"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { SKILLS_TIMELINE } from "@/components/Skills";
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

const SPRITE = 150; // css px of the butterfly canvas
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
    // Light rim along the outer edge (like the reference's glowing wing edges).
    g.strokeStyle = gray(225);
    g.lineWidth = 2.2;
    g.stroke();

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
    g.strokeStyle = gray(210);
    g.lineWidth = 1.8;
    g.stroke();

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

/** Point (viewport coords) and tangent angle at progress `p` (0..1) of an SVG path. */
function lineAt(path: SVGGeometryElement, p: number): (Pt & { angle: number }) | null {
  const ctm = path.getScreenCTM();
  if (!ctm) return null;
  const len = path.getTotalLength();
  const l = Math.min(1, Math.max(0, p)) * len;
  const a0 = path.getPointAtLength(Math.max(0, l - 2));
  const b0 = path.getPointAtLength(Math.min(len, l + 2));
  const c0 = path.getPointAtLength(l);
  const a = new DOMPoint(a0.x, a0.y).matrixTransform(ctm);
  const b = new DOMPoint(b0.x, b0.y).matrixTransform(ctm);
  const c = new DOMPoint(c0.x, c0.y).matrixTransform(ctm);
  return { x: c.x, y: c.y, angle: Math.atan2(b.y - a.y, b.x - a.x) };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const shortest = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

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
    let heading = Math.PI / 2; // radians, 0 = up (starts facing right, along the wave)
    let alpha = 0;
    let flap = 0;
    let prog = 0; // smoothed progress in card units (2.4 = 40% along card #3's curve)
    let facing = 1; // 1 = flying forward along the line, -1 = backward
    let placed = false;
    let last = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove);
    const fine = window.matchMedia("(pointer: fine)");

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

      // The Skills section pins on desktop and exposes its scroll progress (0..1)
      // in data-progress; each card rises during one "unit" of the timeline.
      const skills = document.getElementById("skills");
      const r = skills?.getBoundingClientRect();
      const progAttr = skills?.dataset.progress;
      const pinned = progAttr !== undefined;
      const paths = Array.from(document.querySelectorAll<SVGGeometryElement>('[data-butterfly-line="skills"]'));
      const trails = Array.from(document.querySelectorAll<SVGPathElement>("[data-butterfly-trail]"));
      const count = paths.length;
      const units = pinned ? Number(progAttr) * SKILLS_TIMELINE : 0;
      const staged = Boolean(r && pinned && r.top <= vh * 0.05 && r.bottom >= vh * 0.95);

      // Hidden before Skills. Rides the rising card's curve while the stage is pinned.
      // After the cards are done (or the section has scrolled away) it may follow the cursor.
      const lineMode = staged && units > 0.02 && units < count;
      const after = Boolean(r && pinned && (r.bottom < vh * 0.95 || (staged && units >= count)));
      // Following the cursor only makes sense with a mouse; on touch it leaves after the cards.
      const visible = lineMode || (after && fine.matches);
      let speed = 0;

      // Fade in/out.
      alpha += ((visible ? 1 : 0) - alpha) * Math.min(1, dt * 4);
      el.style.opacity = alpha.toFixed(3);

      // Trail on every card: finished cards fully drawn, current card up to the butterfly.
      const cardIndex = Math.min(count - 1, Math.floor(prog));
      trails.forEach((tr) => {
        const j = Number(tr.dataset.butterflyTrail);
        // Not pinned (mobile / reduced motion): no butterfly, show the curves fully drawn.
        const drawn = !pinned
          ? 1
          : !visible && !after
            ? 0
            : after || j < cardIndex
              ? 1
              : j === cardIndex
                ? prog - cardIndex
                : 0;
        tr.setAttribute("stroke-dasharray", `${(clamp01(drawn) * 1000).toFixed(1)} 1000`);
      });

      // ── Line mode: sit exactly on the curve of the card that is rising.
      if (lineMode) {
        const before = prog;
        prog = alpha < 0.05 ? units : prog + (units - prog) * Math.min(1, dt * 5);
        const dir = prog - before;
        if (Math.abs(dir) > 1e-4) facing = dir > 0 ? 1 : -1;
        const i = Math.min(count - 1, Math.max(0, Math.floor(prog)));
        const path = paths.find((p) => Number(p.dataset.index) === i) ?? paths[i];

        const at = path ? lineAt(path, prog - i) : null;
        if (at) {
          // Tiny bob perpendicular to the line so it feels alive.
          const bob = Math.sin(t * 3.2) * 3;
          const nx = -Math.sin(at.angle) * bob;
          const ny = Math.cos(at.angle) * bob;
          const tx = at.x + nx;
          const ty = at.y + ny;
          speed = Math.hypot(tx - pos.x, ty - pos.y) / Math.max(dt, 0.001);
          if (alpha < 0.05 || !placed) {
            pos.x = tx;
            pos.y = ty;
            placed = true;
          } else {
            // Stick to the line (fast follow) — no drifting off it.
            pos.x += (tx - pos.x) * Math.min(1, dt * 14);
            pos.y += (ty - pos.y) * Math.min(1, dt * 14);
          }
          // Face along the curve (sprite points up, so +90°), flipped when scrolling back.
          const want = at.angle + Math.PI / 2 + (facing < 0 ? Math.PI : 0);
          heading += shortest(heading, want) * Math.min(1, dt * 6);
        }
      } else if (visible) {
        // ── After the line: follow the cursor lazily (owner allowed this only at the end).
        const target: Pt =
          mouse.x >= 0
            ? { x: mouse.x + 46 + Math.sin(t * 1.4) * 14, y: mouse.y - 40 + Math.cos(t * 1.9) * 10 }
            : { x: vw * (0.8 + Math.sin(t * 0.5) * 0.08), y: vh * (0.35 + Math.cos(t * 0.6) * 0.08) };
        const vx = (target.x - pos.x) * Math.min(1, dt * 3);
        const vy = (target.y - pos.y) * Math.min(1, dt * 3);
        pos.x += vx;
        pos.y += vy;
        speed = Math.hypot(vx, vy) / Math.max(dt, 0.001);
        if (speed > 8) heading += shortest(heading, Math.atan2(vx, -vy)) * Math.min(1, dt * 5);
      } else {
        placed = false;
        if (!after) prog = 0;
      }

      if (alpha < 0.01) return;

      // Wing beat: faster when moving; wings fold toward the body (open 1 → 0.22).
      flap += dt * (6 + Math.min(speed, 600) / 55);
      const open = 0.22 + 0.78 * Math.abs(Math.cos(flap));
      render(open);

      el.style.transform = `translate3d(${pos.x - SPRITE / 2}px, ${pos.y - SPRITE / 2}px, 0) rotate(${heading}rad) scale(${vw < 768 ? 0.55 : 0.75})`;
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
