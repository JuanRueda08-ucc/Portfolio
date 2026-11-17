"use client";

import { useEffect, useRef } from "react";
import { hasFastWebGL } from "@/lib/gpu";

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

/**
 * Purple pixel "terrain": cells made of horizontal slats, denser at the bottom,
 * slowly drifting noise, random flicker and a glow that follows the cursor.
 */
const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uRes;    // canvas size in px
uniform vec2 uMouse;  // px, y up; negative when outside
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  float cell = 18.0;
  vec2 px = gl_FragCoord.xy;
  vec2 id = floor(px / cell);
  vec2 f = fract(px / cell);
  vec2 center = (id + 0.5) * cell;
  float y = center.y / uRes.y; // 0 bottom .. 1 top

  // Terrain: drifting noise must beat a threshold that rises with height.
  float n = fbm(id * 0.075 + vec2(uTime * 0.05, uTime * 0.015));
  float m = length(uMouse - center);
  float near = uMouse.x < 0.0 ? 0.0 : exp(-m * m / (2.0 * 150.0 * 150.0));
  float threshold = mix(0.22, 0.85, pow(y, 0.8)) - near * 0.45;
  float on = smoothstep(threshold, threshold + 0.06, n);

  // Flicker a few cells off/on.
  float flick = step(0.975, hash(id + floor(uTime * 6.0)));
  on *= 1.0 - flick * 0.8;

  // Cell shape: square with a gap, filled with 3 horizontal slats.
  vec2 sq = step(vec2(0.1), f) * step(f, vec2(0.9));
  float slats = step(0.35, fract(f.y * 3.0));
  float shape = sq.x * sq.y * slats;

  vec3 ink = vec3(0.043, 0.039, 0.035);
  vec3 deep = vec3(0.231, 0.102, 0.431);
  vec3 violet = vec3(0.608, 0.365, 0.898);
  vec3 bright = vec3(0.753, 0.427, 1.0);
  float level = clamp((n - threshold) * 2.5 + near * 0.6, 0.0, 1.0);
  vec3 col = mix(deep, violet, level);
  col = mix(col, bright, near * 0.8);

  outColor = vec4(mix(ink, col, on * shape), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

export default function PixelField({ className = "" }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvas.current;
    if (!cvs || !hasFastWebGL()) return; // software WebGL would stall the page
    const gl = cvs.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
    } catch {
      return; // leave the plain background
    }
    gl.useProgram(program);

    // Full-screen triangle.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uRes = gl.getUniformLocation(program, "uRes");
    const uMouse = gl.getUniformLocation(program, "uMouse");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const mouse = { x: -1, y: -1, tx: -1, ty: -1 };
    let raf = 0;
    let visible = false;
    const start = performance.now();

    const resize = () => {
      const r = cvs.getBoundingClientRect();
      cvs.width = Math.max(1, Math.round(r.width * dpr));
      cvs.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, cvs.width, cvs.height);
      if (reduce) draw(0);
    };

    const draw = (t: number) => {
      // Ease the glow toward the pointer.
      if (mouse.tx < 0) {
        mouse.x = -1;
      } else {
        mouse.x = mouse.x < 0 ? mouse.tx : mouse.x + (mouse.tx - mouse.x) * 0.12;
        mouse.y = mouse.y < 0 ? mouse.ty : mouse.y + (mouse.ty - mouse.y) * 0.12;
      }
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, cvs.width, cvs.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible) draw((performance.now() - start) / 1000);
    };

    const onMove = (e: PointerEvent) => {
      const r = cvs.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= -80 && x <= r.width && y <= r.height;
      mouse.tx = inside ? x * dpr : -1;
      mouse.ty = inside ? (r.height - y) * dpr : -1;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(cvs);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cvs);
    window.addEventListener("pointermove", onMove);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={`block ${className}`}
      // CSS fallback (no WebGL / software rendering): purple pixel grid fading upward.
      style={{
        backgroundImage:
          "linear-gradient(to top, rgb(155 93 229 / 0.55), transparent 85%), radial-gradient(rgb(11 10 9) 30%, transparent 31%)",
        backgroundSize: "100% 100%, 18px 18px",
      }}
    />
  );
}
