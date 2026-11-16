import * as THREE from "three";

/**
 * Background grid for the hero: square tiles with thin gaps, dark at the top,
 * a purple glow rising from the bottom and a halo that follows the cursor.
 * Rendered inside the 3D scene so the glass "hello" refracts it.
 */
export function createGridMaterial() {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.3) },
      uHover: { value: 0 },
      uScroll: { value: 0 },
      uIntro: { value: 0 },
      uCell: { value: 34 },
      uInk: { value: new THREE.Color("#0b0a09") },
      uViolet: { value: new THREE.Color("#9b5de5") },
      uBright: { value: new THREE.Color("#c06dff") },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uRes;
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

      void main() {
        float aspect = uRes.x / uRes.y;
        vec2 px = vUv * uRes;
        vec2 id = floor(px / uCell);
        vec2 f = fract(px / uCell);

        // Tile mask: soft-edged squares separated by a thin gap.
        float gap = 0.07;
        vec2 edge = smoothstep(gap, gap + 0.04, f) * (1.0 - smoothstep(1.0 - gap - 0.04, 1.0 - gap, f));
        float tile = edge.x * edge.y;

        // Work in aspect-corrected space from the tile center.
        vec2 c = (id + 0.5) * uCell / uRes;
        vec2 ca = vec2(c.x * aspect, c.y);

        // Purple glow rising from the bottom-center, fading upwards.
        // On portrait screens the glow reaches higher so the glass word has color behind it.
        float reach = aspect < 1.0 ? 1.1 : 0.85;
        float rise = pow(smoothstep(reach, 0.0, c.y + uScroll * 0.6), 1.6);
        float centerFalloff = 1.0 - smoothstep(0.0, aspect * 0.8, abs(ca.x - aspect * 0.5));
        float base = rise * (0.25 + 0.6 * centerFalloff);

        // Halo that follows the cursor.
        vec2 m = vec2(uMouse.x * aspect, uMouse.y);
        float d = distance(ca, m);
        float halo = exp(-d * d * 9.0) * uHover;

        // Slow diagonal wave + per-tile shimmer so the grid feels alive.
        float wave = 0.5 + 0.5 * sin((c.x + c.y) * 6.0 - uTime * 0.6);
        float shimmer = step(0.985, hash(id + floor(uTime * 1.5))) * 0.35;

        float intensity = base * (0.5 + 0.2 * wave) + halo * 0.75 + shimmer * base;
        intensity *= uIntro;

        vec3 tileColor = mix(uInk * 1.8, uViolet, clamp(intensity, 0.0, 1.0));
        tileColor = mix(tileColor, uBright, clamp(halo * 0.6 * uIntro, 0.0, 1.0));
        vec3 color = mix(uInk, tileColor, tile);

        // Darken the top so text stays readable.
        color *= mix(0.35, 1.0, smoothstep(1.0, 0.45, vUv.y));

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}
