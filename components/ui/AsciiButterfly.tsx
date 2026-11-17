"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cssRgb, subscribeTheme } from "@/lib/theme";

/**
 * Dithered "ASCII" butterfly (style reference: a pink butterfly made of square dots
 * with ordered dithering; motion reference: creatures that glide and turn toward
 * where they're heading).
 *
 * Behaviour (owner's request):
 * - Hidden for the whole page until the Skills section ("the final part").
 * - In Skills it rides the dotted wave (`data-butterfly-line="skills"`), its
 *   position driven by scroll progress through the section — like the bee on
 *   elicubillos.com.
 * - After Skills (contact + footer) it lets go and follows the cursor lazily.
 */

const SPRITE = 132; // css px of the butterfly canvas
const DOT = 3; // dot grid cell (css px)
const GRID = Math.round(SPRITE / DOT);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

type Pt = { x: number; y: number };

/** Draws the butterfly (top view, heading up) into a small offscreen canvas. */
function drawShape(g: CanvasRenderingContext2D, open: number) {
  g.clearRect(0, 0, GRID, GRID);
  g.save();
  // The shape is designed in a ~84-unit box centered on the body; fit it to the grid.
  g.translate(GRID / 2, GRID / 2 + 1);
  g.scale(GRID / 86, GRID / 86);

  const gray = (v: number) => `rgb(${v},${v},${v})`;

  const wing = (side: 1 | -1) => {
    g.save();
    // Fold toward the body: horizontal scale = how open the wing is.
    g.scale(side * open, 1);

    // Forewing: bright core fading to dark edges.
    const fw = g.createRadialGradient(14, -12, 1, 16, -12, 30);
    fw.addColorStop(0, gray(255));
    fw.addColorStop(0.45, gray(190));
    fw.addColorStop(0.8, gray(105));
    fw.addColorStop(1, gray(45));
    g.fillStyle = fw;
    g.beginPath();
    g.moveTo(1, -3);
    g.bezierCurveTo(8, -28, 32, -34, 40, -22);
    g.bezierCurveTo(43, -12, 32, -1, 2, 1);
    g.closePath();
    g.fill();

    // Hindwing
    const hw = g.createRadialGradient(10, 10, 1, 11, 11, 22);
    hw.addColorStop(0, gray(230));
    hw.addColorStop(0.6, gray(140));
    hw.addColorStop(1, gray(50));
    g.fillStyle = hw;
    g.beginPath();
    g.moveTo(1, 1);
    g.bezierCurveTo(15, 2, 30, 11, 24, 24);
    g.bezierCurveTo(17, 34, 6, 26, 1, 8);
    g.closePath();
    g.fill();

    // Veins (dark lines) and spots so the dithering has texture.
    g.strokeStyle = gray(60);
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(2, -1);
    g.lineTo(36, -22);
    g.moveTo(2, -1);
    g.lineTo(30, -8);
    g.moveTo(2, 2);
    g.lineTo(20, 22);
    g.stroke();
    g.fillStyle = gray(35);
    for (const [x, y, r] of [
      [33, -24, 3],
      [24, -16, 2],
      [16, 16, 2.4],
    ]) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  };

  wing(1);
  wing(-1);

  // Body + antennae
  g.fillStyle = gray(255);
  g.beginPath();
  g.ellipse(0, 2, 2.2, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = gray(220);
  g.lineWidth = 1.4;
  g.beginPath();
  g.moveTo(-0.6, -10);
  g.quadraticCurveTo(-5, -19, -9, -21);
  g.moveTo(0.6, -10);
  g.quadraticCurveTo(5, -19, 9, -21);
  g.stroke();
  g.restore();
}

/** Points of the skills wave in viewport coordinates. */
function wavePoints(): Pt[] {
  const pts: Pt[] = [];
  document.querySelectorAll<SVGGeometryElement>('[data-butterfly-line="skills"]').forEach((el) => {
    const ctm = el.getScreenCTM();
    if (!ctm) return;
    const len = el.getTotalLength();
    for (let i = 0; i <= 24; i++) {
      const p = el.getPointAtLength((len * i) / 24);
      const q = new DOMPoint(p.x, p.y).matrixTransform(ctm);
      pts.push({ x: q.x, y: q.y });
    }
  });
  return pts;
}

function along(pts: Pt[], t: number): Pt {
  const f = Math.min(1, Math.max(0, t)) * (pts.length - 1);
  const i = Math.floor(f);
  const a = pts[i];
  const b = pts[Math.min(i + 1, pts.length - 1)];
  return { x: a.x + (b.x - a.x) * (f - i), y: a.y + (b.y - a.y) * (f - i) };
}

const MOTION = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOTION);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function AsciiButterfly() {
  const reduce = useSyncExternalStore(subscribe, () => window.matchMedia(MOTION).matches, () => true);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduce) return;
    const el = wrap.current!;
    const cvs = canvas.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = SPRITE * dpr;
    cvs.height = SPRITE * dpr;
    const ctx = cvs.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const off = document.createElement("canvas");
    off.width = off.height = GRID;
    const og = off.getContext("2d", { willReadFrequently: true })!;

    // Dot tones (dark → light): deep accent → bright accent → soft accent → text color.
    // Ending on the text color keeps it visible on accent-colored cards and on the page.
    let tones: string[] = [];
    const readTones = () => {
      tones = ["--color-violet-deep", "--color-violet-bright", "--color-violet-soft", "--color-cream"].map(
        (n) => `rgb(${cssRgb(n).map((v) => Math.round(v * 255)).join(",")})`,
      );
    };
    readTones();
    const stopTheme = subscribeTheme(readTones);

    const pos = { x: -200, y: -200 };
    const mouse = { x: -1, y: -1 };
    let heading = 0; // radians, 0 = up
    let alpha = 0;
    let flap = 0;
    let last = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove);

    const render = (open: number) => {
      drawShape(og, open);
      const data = og.getImageData(0, 0, GRID, GRID).data;
      ctx.clearRect(0, 0, SPRITE, SPRITE);
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const i = (y * GRID + x) * 4;
          if (data[i + 3] < 40) continue;
          const l = Math.pow(data[i] / 255, 1.5); // grayscale shape → brightness (more contrast)
          // Ordered dithering between 4 tone levels.
          const level = l * (tones.length - 1);
          const base = Math.floor(level);
          const frac = level - base;
          const tone = frac > (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16 ? base + 1 : base;
          // Sparse dots in the darkest areas, like the reference.
          if (tone === 0 && BAYER[(y % 4) * 4 + (x % 4)] > 6) continue;
          ctx.fillStyle = tones[Math.min(tones.length - 1, tone)];
          ctx.fillRect(x * DOT, y * DOT, DOT - 1, DOT - 1);
        }
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      const skills = document.getElementById("skills");
      const r = skills?.getBoundingClientRect();
      let target: Pt | null = null;
      let visible = false;

      if (r && r.top < vh * 0.75) {
        visible = true;
        if (r.bottom > vh * 0.45) {
          // In Skills: ride the wave, progress = how far we've scrolled through it.
          const pts = wavePoints();
          const progress = (vh * 0.75 - r.top) / (r.height * 0.85);
          if (pts.length > 1) {
            const p = along(pts, progress);
            target = { x: p.x, y: p.y - 26 + Math.sin(t * 2) * 6 };
          }
        } else if (mouse.x >= 0) {
          // After Skills: lazily follow the cursor.
          target = { x: mouse.x + 46 + Math.sin(t * 1.4) * 14, y: mouse.y - 40 + Math.cos(t * 1.9) * 10 };
        } else {
          target = { x: vw * (0.8 + Math.sin(t * 0.5) * 0.08), y: vh * (0.35 + Math.cos(t * 0.6) * 0.08) };
        }
      }

      // Fade in/out; teleport to the first target when appearing.
      alpha += ((visible ? 1 : 0) - alpha) * Math.min(1, dt * 4);
      if (target && alpha < 0.05) {
        pos.x = target.x;
        pos.y = target.y;
      }
      el.style.opacity = alpha.toFixed(3);
      if (alpha < 0.01 || !target) return;

      // Glide toward the target and turn to face the direction of travel.
      const vx = (target.x - pos.x) * Math.min(1, dt * 3);
      const vy = (target.y - pos.y) * Math.min(1, dt * 3);
      pos.x += vx;
      pos.y += vy;
      const speed = Math.hypot(vx, vy) / Math.max(dt, 0.001);
      if (speed > 8) {
        const want = Math.atan2(vx, -vy);
        let diff = want - heading;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        heading += diff * Math.min(1, dt * 5);
      } else {
        heading += (Math.sin(t * 0.8) * 0.25 - heading) * Math.min(1, dt * 1.5);
      }

      // Wing beat: faster when moving; wings fold toward the body (open 1 → 0.25).
      flap += dt * (5 + Math.min(speed, 600) / 60);
      const open = 0.25 + 0.75 * Math.abs(Math.cos(flap));
      render(open);

      el.style.transform = `translate3d(${pos.x - SPRITE / 2}px, ${pos.y - SPRITE / 2}px, 0) rotate(${heading}rad) scale(0.8)`;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      stopTheme();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 opacity-0 will-change-transform"
      style={{ width: SPRITE, height: SPRITE }}
    >
      <canvas ref={canvas} className="size-full drop-shadow-[0_0_8px_var(--color-violet)]" />
    </div>
  );
}
