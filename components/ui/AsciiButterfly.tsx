"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { onReady } from "@/lib/ready";

/** Wing-beat frames (original ASCII art). Cycled open → half → closed → half. */
const FRAMES = [
  ["(\\_ | _/)", " \\ \\|/ / ", " / /|\\ \\ ", "(/  |  \\)"],
  [" (\\ | /) ", "  \\\\|//  ", "  //|\\\\  ", " (/ | \\) "],
  ["   \\|/   ", "   (|)   ", "   /|\\   ", "    |    "],
  [" (\\ | /) ", "  \\\\|//  ", "  //|\\\\  ", " (/ | \\) "],
].map((f) => f.join("\n"));

type Pt = { x: number; y: number };

/**
 * Points (viewport coords) of a "line group": every element with
 * data-butterfly-line="<group>". SVG shapes are sampled along their length,
 * other elements are treated as a vertical line on their left edge.
 */
function samplePath(group: string): { pts: Pt[]; closed: boolean } {
  const els = Array.from(document.querySelectorAll<Element>(`[data-butterfly-line="${group}"]`));
  const pts: Pt[] = [];
  let closed = false;
  for (const el of els) {
    if (el instanceof SVGGeometryElement) {
      const ctm = el.getScreenCTM();
      if (!ctm) continue;
      const len = el.getTotalLength();
      const n = Math.max(12, Math.round(len / 4));
      for (let i = 0; i <= n; i++) {
        const p = el.getPointAtLength((len * i) / n);
        const q = new DOMPoint(p.x, p.y).matrixTransform(ctm);
        pts.push({ x: q.x, y: q.y });
      }
      if (el.tagName === "circle") closed = true;
    } else {
      const r = el.getBoundingClientRect();
      for (let i = 0; i <= 24; i++) pts.push({ x: r.left, y: r.top + (r.height * i) / 24 });
    }
  }
  return { pts, closed };
}

/** The visible line group closest to the middle of the screen, if any. */
function pickGroup(): string | null {
  const groups = new Set(
    Array.from(document.querySelectorAll<HTMLElement | SVGElement>("[data-butterfly-line]")).map(
      (e) => e.getAttribute("data-butterfly-line")!,
    ),
  );
  let best: string | null = null;
  let bestDist = Infinity;
  const vh = window.innerHeight;
  for (const g of groups) {
    const rects = Array.from(document.querySelectorAll(`[data-butterfly-line="${g}"]`)).map((e) => e.getBoundingClientRect());
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    if (bottom < vh * 0.1 || top > vh * 0.9 || rects.every((r) => r.width === 0 && r.height === 0)) continue;
    const d = Math.abs((top + bottom) / 2 - vh / 2);
    if (d < bestDist) [best, bestDist] = [g, d];
  }
  return best;
}

const MOTION = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOTION);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** A small ASCII butterfly that flies along the site's lines (wave, ring, timelines). */
export default function AsciiButterfly() {
  const reduce = useSyncExternalStore(subscribe, () => window.matchMedia(MOTION).matches, () => true);
  const root = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (reduce) return;
    const el = root.current!;
    const pre = art.current!;
    const pos = { x: window.innerWidth * 0.8, y: window.innerHeight * 0.3 };
    const mouse = { x: -999, y: -999 };
    let s = 0; // progress along the current path, 0..1
    let dir = 1;
    let group: string | null = null;
    let frame = 0;
    let lastFlap = 0;
    let last = performance.now();
    let raf = 0;
    let started = false;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // Choose which line to follow (re-evaluated a few times per second).
      if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
        const g = pickGroup();
        if (g !== group) {
          group = g;
          s = 0;
          dir = 1;
        }
      }

      let target: Pt;
      if (group) {
        const { pts, closed } = samplePath(group);
        if (pts.length > 1) {
          // Constant speed (~70px/s) along the polyline.
          let total = 0;
          for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
          s += (dir * 70 * dt) / Math.max(total, 1);
          if (closed) s = ((s % 1) + 1) % 1;
          else if (s > 1 || s < 0) {
            dir *= -1;
            s = Math.min(1, Math.max(0, s));
          }
          const f = s * (pts.length - 1);
          const i = Math.floor(f);
          const a = pts[i];
          const b = pts[Math.min(i + 1, pts.length - 1)];
          target = { x: a.x + (b.x - a.x) * (f - i), y: a.y + (b.y - a.y) * (f - i) - 18 };
        } else target = pos;
      } else if (mouse.x > -999) {
        // Hover lazily near the cursor.
        target = { x: mouse.x + 70 + Math.sin(t * 1.3) * 25, y: mouse.y - 60 + Math.cos(t * 1.7) * 18 };
      } else {
        target = { x: window.innerWidth * (0.75 + Math.sin(t * 0.4) * 0.12), y: window.innerHeight * (0.3 + Math.cos(t * 0.5) * 0.1) };
      }

      // Shy: dodge the cursor when it gets close.
      const dx = pos.x - mouse.x;
      const dy = pos.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 80 && d > 0) {
        target = { x: target.x + (dx / d) * 90, y: target.y + (dy / d) * 90 };
      }

      // Ease toward the target with a little flutter.
      const vx = (target.x - pos.x) * Math.min(1, dt * 3.5);
      const vy = (target.y - pos.y) * Math.min(1, dt * 3.5);
      pos.x += vx;
      pos.y += vy + Math.sin(t * 9) * 0.6;

      // Faster flapping when moving fast.
      const speed = Math.hypot(vx, vy) / Math.max(dt, 0.001);
      if (now - lastFlap > Math.max(70, 160 - speed * 0.3)) {
        frame = (frame + 1) % FRAMES.length;
        pre.textContent = FRAMES[frame];
        lastFlap = now;
      }

      const face = vx < -0.2 ? -1 : 1;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scaleX(${face}) rotate(${Math.max(-12, Math.min(12, vy * 2))}deg)`;
      if (!started) {
        started = true;
        el.style.opacity = "1";
      }
    };

    const stopReady = onReady(() => (raf = requestAnimationFrame(tick)));
    return () => {
      stopReady();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 opacity-0 transition-opacity duration-700 will-change-transform"
    >
      {/* Text color (not accent) so it stays visible over accent cards too; accent glow around it. */}
      <pre
        ref={art}
        className="font-mono text-[10px] leading-[1.05] font-bold text-cream drop-shadow-[0_0_5px_var(--color-violet-bright)] select-none"
      >
        {FRAMES[0]}
      </pre>
    </div>
  );
}
