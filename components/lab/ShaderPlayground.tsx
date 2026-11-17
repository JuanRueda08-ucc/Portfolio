"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { GRID_GLSL } from "@/components/hero/gridGlsl";
import { hasFastWebGL } from "@/lib/gpu";
import { ACCENT_PRESETS, applyTheme, cssRgb, currentTheme, DEFAULT_THEME, subscribeTheme, type Theme } from "@/lib/theme";

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
const FRAG = `precision highp float;\n${GRID_GLSL}\nvoid main(){ gl_FragColor = vec4(grid(gl_FragCoord.xy / uDpr), 1.0); }`;

/** Live preview running the exact hero grid shader with the current theme. */
function Preview() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvas.current;
    if (!cvs || !hasFastWebGL()) return;
    const gl = cvs.getContext("webgl", { antialias: false });
    if (!gl) return;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0.5, y: 0.35, hover: 0, tx: 0.5, ty: 0.35, th: 0 };
    let colors = {} as Record<string, [number, number, number]>;
    const readColors = () => {
      const ink = cssRgb("--color-ink");
      const cream = cssRgb("--color-cream");
      colors = {
        uInk: ink,
        uTile: ink.map((v, i) => v + (cream[i] - v) * 0.06) as [number, number, number],
        uViolet: cssRgb("--color-violet"),
        uBright: cssRgb("--color-violet-bright"),
      };
    };
    readColors();
    const stopTheme = subscribeTheme(readColors);

    let time = 0;
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t: Theme = currentTheme();
      time += dt * t.speed;
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      mouse.hover += (mouse.th - mouse.hover) * 0.08;
      const w = cvs.clientWidth;
      const h = cvs.clientHeight;
      if (cvs.width !== Math.round(w * dpr)) {
        cvs.width = Math.round(w * dpr);
        cvs.height = Math.round(h * dpr);
      }
      gl.viewport(0, 0, cvs.width, cvs.height);
      gl.uniform1f(U("uTime"), time);
      gl.uniform2f(U("uRes"), w, h);
      gl.uniform1f(U("uDpr"), dpr);
      gl.uniform2f(U("uMouse"), mouse.x, mouse.y);
      gl.uniform1f(U("uHover"), mouse.hover);
      gl.uniform1f(U("uScroll"), 0);
      gl.uniform1f(U("uIntro"), 1);
      gl.uniform1f(U("uCell"), t.cell);
      gl.uniform1f(U("uGlow"), t.glow);
      for (const [k, v] of Object.entries(colors)) gl.uniform3f(U(k), v[0], v[1], v[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    const move = (e: PointerEvent) => {
      const r = cvs.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
      mouse.th = 1;
    };
    const leave = () => (mouse.th = 0);
    cvs.addEventListener("pointermove", move);
    cvs.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      stopTheme();
      cvs.removeEventListener("pointermove", move);
      cvs.removeEventListener("pointerleave", leave);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      data-cursor="Hover me"
      aria-label="Live preview of the hero grid"
      role="img"
      className="aspect-[4/3] w-full rounded-xl bg-ink"
    />
  );
}

const getTheme = () => JSON.stringify(currentTheme());
const getServerTheme = () => JSON.stringify(DEFAULT_THEME);

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v: number) => String(v),
  trackStyle,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  trackStyle?: React.CSSProperties;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="flex justify-between">
        <span className="label text-stone">{label}</span>
        <span className="font-mono text-xs text-cream">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-3 accent-violet"
        style={trackStyle}
      />
    </label>
  );
}

/**
 * Shader Playground: pick your own accent color and tune the hero grid.
 * Everything is saved in this browser and recolors the whole portfolio.
 */
export default function ShaderPlayground() {
  const theme: Theme = JSON.parse(useSyncExternalStore(subscribeTheme, getTheme, getServerTheme));

  return (
    <div className="grid gap-4 bg-ink-2 p-4 md:grid-cols-[1.2fr_1fr]" data-lenis-prevent>
      <Preview />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-stone">Make the site yours — your choice is saved and recolors everything.</p>

        <Slider
          label="Accent hue"
          value={Math.round(theme.hue)}
          min={0}
          max={360}
          step={1}
          onChange={(hue) => applyTheme({ hue })}
          format={(v) => `${v}°`}
          trackStyle={{
            background:
              "linear-gradient(to right, hsl(0 72% 63%), hsl(60 72% 63%), hsl(120 72% 63%), hsl(180 72% 63%), hsl(240 72% 63%), hsl(300 72% 63%), hsl(360 72% 63%))",
          }}
        />
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Accent presets">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              role="radio"
              aria-checked={Math.round(theme.hue) === p.hue}
              onClick={() => applyTheme({ hue: p.hue })}
              className="flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 font-mono text-[11px] text-stone hover:text-cream"
            >
              <span className="size-3 rounded-full" style={{ background: `hsl(${p.hue} 72% 63%)` }} />
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-full bg-ink p-1" role="radiogroup" aria-label="Mode">
          {(["dark", "light"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={theme.mode === m}
              onClick={() => applyTheme({ mode: m })}
              className={`btn-text flex-1 rounded-full py-1.5 ${theme.mode === m ? "bg-violet text-on-accent" : "text-stone"}`}
            >
              {m}
            </button>
          ))}
        </div>

        <Slider label="Tile size" value={theme.cell} min={16} max={64} step={1} onChange={(cell) => applyTheme({ cell })} format={(v) => `${v}px`} />
        <Slider label="Glow" value={theme.glow} min={0.2} max={2} step={0.05} onChange={(glow) => applyTheme({ glow })} format={(v) => `${v.toFixed(2)}×`} />
        <Slider label="Speed" value={theme.speed} min={0} max={4} step={0.1} onChange={(speed) => applyTheme({ speed })} format={(v) => `${v.toFixed(1)}×`} />

        <button
          type="button"
          onClick={() => applyTheme(DEFAULT_THEME)}
          className="btn-text mt-auto self-start rounded-full border border-ink-3 px-4 py-2 text-stone hover:border-violet hover:text-cream"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}
