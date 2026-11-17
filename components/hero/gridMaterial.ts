import * as THREE from "three";

/**
 * Hero shaders.
 *
 * - The background is a procedural grid: square tiles, dark at the top, a purple
 *   glow rising from the bottom and a halo that follows the cursor.
 * - The "hello" uses a custom glass shader that evaluates the SAME grid function
 *   at a refracted screen position. That fakes real transmission without
 *   re-rendering the scene to a texture every frame (what MeshTransmissionMaterial
 *   does), and its shader compiles in milliseconds instead of seconds on Windows/ANGLE.
 *
 * Both materials share one uniforms object, so updating it once drives both.
 */

export type HeroUniforms = ReturnType<typeof createHeroUniforms>;

export function createHeroUniforms() {
  return {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, // canvas size in CSS px
    uDpr: { value: 1 },
    uMouse: { value: new THREE.Vector2(0.5, 0.3) },
    uHover: { value: 0 },
    uScroll: { value: 0 },
    uIntro: { value: 0 },
    uCell: { value: 34 },
    uInk: { value: new THREE.Color("#0b0a09") },
    uViolet: { value: new THREE.Color("#9b5de5") },
    uBright: { value: new THREE.Color("#c06dff") },
  };
}

/** Shared GLSL: `vec3 grid(vec2 px)` returns the background color at a CSS-pixel position. */
const GRID_GLSL = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uScroll;
  uniform float uIntro;
  uniform float uCell;
  uniform vec3 uInk;
  uniform vec3 uViolet;
  uniform vec3 uBright;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec3 grid(vec2 px) {
    float aspect = uRes.x / uRes.y;
    vec2 id = floor(px / uCell);
    vec2 f = fract(px / uCell);

    // Tile mask: soft-edged squares separated by a thin gap.
    float gap = 0.07;
    vec2 edge = smoothstep(gap, gap + 0.04, f) * (1.0 - smoothstep(1.0 - gap - 0.04, 1.0 - gap, f));
    float tile = edge.x * edge.y;

    // Tile center in 0..1 (y up) and aspect-corrected space.
    vec2 c = (id + 0.5) * uCell / uRes;
    vec2 ca = vec2(c.x * aspect, c.y);

    // Purple glow rising from the bottom-center; reaches higher on portrait screens.
    float reach = aspect < 1.0 ? 1.1 : 0.85;
    float rise = pow(smoothstep(reach, 0.0, c.y + uScroll * 0.6), 1.6);
    float centerFalloff = 1.0 - smoothstep(0.0, aspect * 0.8, abs(ca.x - aspect * 0.5));
    float base = rise * (0.25 + 0.6 * centerFalloff);

    // Halo that follows the cursor.
    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    float d = distance(ca, m);
    float halo = exp(-d * d * 9.0) * uHover;

    // Slow diagonal wave + per-tile shimmer.
    float wave = 0.5 + 0.5 * sin((c.x + c.y) * 6.0 - uTime * 0.6);
    float shimmer = step(0.985, hash(id + floor(uTime * 1.5))) * 0.35;

    float intensity = (base * (0.5 + 0.2 * wave) + halo * 0.75 + shimmer * base) * uIntro;

    vec3 tileColor = mix(uInk * 1.8, uViolet, clamp(intensity, 0.0, 1.0));
    tileColor = mix(tileColor, uBright, clamp(halo * 0.6 * uIntro, 0.0, 1.0));
    vec3 color = mix(uInk, tileColor, tile);

    // Darken the top so text stays readable.
    color *= mix(0.35, 1.0, smoothstep(1.0, 0.45, px.y / uRes.y));
    return color;
  }
`;

export function createGridMaterial(uniforms: HeroUniforms) {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms,
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      ${GRID_GLSL}
      void main() {
        gl_FragColor = vec4(grid(gl_FragCoord.xy / uDpr), 1.0);
      }
    `,
  });
}

/**
 * Fake glass: refracts the procedural grid by the surface normal with a little
 * chromatic aberration, plus fresnel rim, a soft lavender body and specular glints.
 */
export function createGlassMaterial(uniforms: HeroUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      uRefract: { value: 70 }, // refraction offset in CSS px
      uTint: { value: new THREE.Color("#e9dcff") },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      ${GRID_GLSL}
      uniform float uRefract;
      uniform vec3 uTint;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vViewDir);
        float ndv = clamp(dot(n, v), 0.0, 1.0);
        float fresnel = pow(1.0 - ndv, 2.2);

        // Refraction: sample the grid behind, pushed along the normal; split RGB slightly.
        vec2 px = gl_FragCoord.xy / uDpr;
        vec2 offs = n.xy * uRefract * (0.55 + 0.45 * fresnel);
        vec3 refr = vec3(
          grid(px - offs * 0.94).r,
          grid(px - offs).g,
          grid(px - offs * 1.08).b
        );

        // Glass body: refracted grid tinted lavender, lifted so it reads on dark areas.
        vec3 col = refr * 1.35 * uTint + uTint * 0.07;

        // Rim light + two specular glints from fixed "studio" lights.
        vec3 l1 = normalize(vec3(-0.4, 0.8, 0.6));
        vec3 l2 = normalize(vec3(0.7, -0.2, 0.5));
        float s1 = pow(max(dot(reflect(-l1, n), v), 0.0), 48.0);
        float s2 = pow(max(dot(reflect(-l2, n), v), 0.0), 24.0);
        col += fresnel * mix(uViolet, vec3(1.0), 0.45) * 0.75;
        col += s1 * 0.9 + s2 * vec3(0.75, 0.55, 1.0) * 0.45;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}
