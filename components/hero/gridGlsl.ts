// Kept free of imports so non-3D code (Lab shader playground) can reuse it without pulling in three.js.
/** Shared GLSL: `vec3 grid(vec2 px)` returns the background color at a CSS-pixel position. */
export const GRID_GLSL = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uScroll;
  uniform float uIntro;
  uniform float uCell;
  uniform float uGlow;
  uniform vec3 uInk;
  uniform vec3 uTile;
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

    float intensity = (base * (0.5 + 0.2 * wave) * uGlow + halo * 0.75 + shimmer * base) * uIntro;

    vec3 tileColor = mix(uTile, uViolet, clamp(intensity, 0.0, 1.0));
    tileColor = mix(tileColor, uBright, clamp(halo * 0.6 * uIntro, 0.0, 1.0));
    vec3 color = mix(uInk, tileColor, tile);

    // Fade the top toward the page background so text stays readable (works in both modes).
    color = mix(uInk, color, mix(0.35, 1.0, smoothstep(1.0, 0.45, px.y / uRes.y)));
    return color;
  }
`;
