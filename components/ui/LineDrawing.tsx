"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Image to draw. Without it, `fallbackText` is rendered as the source shape. */
  src?: string;
  fallbackText?: string;
  className?: string;
  /** Accessible description of the image. */
  label: string;
};

const SAMPLE_W = 220; // luminance map resolution (width)
const MAX_STROKES = 16000; // auto-draw stops after this many strokes
const STROKE_STEPS = 22;
const STEP = 2.4;

/**
 * Draws an image with fine contour-following lines that only appear around
 * the cursor and accumulate over time (inspired by elissamartial.com).
 * On touch devices (or when idle) it slowly draws itself.
 */
export default function LineDrawing({ src, fallbackText = "JR", className = "", label }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = wrap.current;
    const cvs = canvas.current;
    const ctx = cvs?.getContext("2d");
    if (!host || !cvs || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let lum: Float32Array = new Float32Array(0);
    let sw = 0;
    let sh = 0;
    let strokes = 0;
    let raf = 0;
    let inView = false;
    let lastPointer = 0;
    const spawns: { x: number; y: number }[] = [];
    let source: CanvasImageSource | null = null;

    // ── Build a luminance map of the source, cropped like `object-fit: cover`.
    const buildMap = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      cvs.width = Math.round(W * dpr);
      cvs.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      strokes = 0;

      sw = SAMPLE_W;
      sh = Math.max(1, Math.round((SAMPLE_W * H) / W));
      const off = document.createElement("canvas");
      off.width = sw;
      off.height = sh;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.fillStyle = "#fff";
      o.fillRect(0, 0, sw, sh);
      if (source instanceof HTMLImageElement && source.naturalWidth) {
        const s = Math.max(sw / source.naturalWidth, sh / source.naturalHeight);
        const dw = source.naturalWidth * s;
        const dh = source.naturalHeight * s;
        o.drawImage(source, (sw - dw) / 2, (sh - dh) / 2, dw, dh);
      } else {
        o.fillStyle = "#000";
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.font = `italic 700 ${Math.round(sh * 0.62)}px Georgia, serif`;
        o.fillText(fallbackText, sw / 2, sh * 0.54);
      }
      const data = o.getImageData(0, 0, sw, sh).data;
      lum = new Float32Array(sw * sh);
      for (let i = 0; i < sw * sh; i++) {
        lum[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
      }
      if (reduce) drawAll();
    };

    const sample = (x: number, y: number) => {
      const ix = Math.min(sw - 1, Math.max(0, Math.floor((x / W) * sw)));
      const iy = Math.min(sh - 1, Math.max(0, Math.floor((y / H) * sh)));
      return lum[iy * sw + ix];
    };

    // ── One stroke: walks along the image contours (perpendicular to the gradient).
    const stroke = (x: number, y: number) => {
      const darkness = 1 - sample(x, y);
      if (Math.random() > darkness * 1.15 + 0.03) return;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const e = 2;
      let dir = Math.random() < 0.5 ? 1 : -1;
      for (let k = 0; k < STROKE_STEPS; k++) {
        const gx = sample(x + e, y) - sample(x - e, y);
        const gy = sample(x, y + e) - sample(x, y - e);
        let ang = Math.atan2(gy, gx) + Math.PI / 2;
        if (Math.abs(gx) + Math.abs(gy) < 0.001) ang = Math.random() * Math.PI * 2;
        ang += (Math.random() - 0.5) * 0.5;
        x += Math.cos(ang) * STEP * dir;
        y += Math.sin(ang) * STEP * dir;
        if (x < 0 || y < 0 || x > W || y > H) break;
        ctx.lineTo(x, y);
        if (Math.random() < 0.04) dir *= -1;
      }
      const a = 0.12 + darkness * 0.38;
      ctx.strokeStyle = Math.random() < 0.18 ? `rgba(192,109,255,${a})` : `rgba(196,161,255,${a * 0.85})`;
      ctx.lineWidth = 0.5 + Math.random() * 0.6;
      ctx.stroke();
      strokes++;
    };

    const drawAll = () => {
      for (let i = 0; i < MAX_STROKES; i++) stroke(Math.random() * W, Math.random() * H);
    };

    // ── Animation loop.
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!inView || !W) return;
      // Strokes around the cursor.
      while (spawns.length) {
        const p = spawns.shift()!;
        for (let i = 0; i < 18; i++) {
          const r = Math.random() * 56;
          const t = Math.random() * Math.PI * 2;
          stroke(p.x + Math.cos(t) * r, p.y + Math.sin(t) * r);
        }
      }
      // Slow self-drawing when idle (and always on touch screens).
      if (now - lastPointer > 1400 && strokes < MAX_STROKES) {
        for (let i = 0; i < 30; i++) stroke(Math.random() * W, Math.random() * H);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = cvs.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      lastPointer = performance.now();
      spawns.push({ x, y });
    };

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
    io.observe(host);
    const ro = new ResizeObserver(buildMap);

    if (src) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        source = img;
        buildMap();
      };
      img.src = src;
    }
    ro.observe(host);
    window.addEventListener("pointermove", onMove);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [src, fallbackText]);

  return (
    <div ref={wrap} className={className} role="img" aria-label={label}>
      <canvas ref={canvas} className="block size-full" />
    </div>
  );
}
