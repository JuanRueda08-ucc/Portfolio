"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import FoodApp, { FoodSprite } from "./food/Food";
import PhotoFilters from "./PhotoFilters";
import PixelPaint from "./PixelPaint";
import ShaderPlayground from "./ShaderPlayground";
import Terminal from "./Terminal";
import { TILES, type AppId, type Tile } from "./tiles";
import Window from "./Window";

const CELL_W = 300;
const CELL_H = 300;
const GAP = 28;
const COL = CELL_W + GAP;
const ROW = CELL_H + GAP;
const mod = (n: number, m: number) => ((n % m) + m) % m;
/**
 * Which tile goes in grid cell (col,row). With 10–11 tiles, `3c + r` never repeats a
 * tile within ±2 columns/rows of itself, so neighbours always differ.
 */
const tileAt = (c: number, r: number) => TILES[mod(c * 3 + r, TILES.length)];
/** Odd columns are shifted down half a cell for a masonry feel. */
const cellY = (c: number, r: number) => r * ROW + (mod(c, 2) ? ROW / 2 : 0);

const APPS: Record<AppId, { title: string; dock: string; width: number; render: () => React.ReactNode }> = {
  terminal: { title: "terminal — zsh", dock: "› Terminal", width: 620, render: () => <Terminal /> },
  paint: { title: "pixel-paint.app", dock: "▦ Paint", width: 640, render: () => <PixelPaint /> },
  shader: { title: "shader-playground.app", dock: "◐ Shader", width: 760, render: () => <ShaderPlayground /> },
  filters: { title: "photo-filters.app", dock: "▣ Filters", width: 800, render: () => <PhotoFilters /> },
  food: { title: "food.app", dock: "🧺 Food", width: 760, render: () => <FoodApp /> },
};

/** Small preview drawn on each app tile. */
function AppPreview({ app }: { app: AppId }) {
  switch (app) {
    case "terminal":
      return (
        <span className="block rounded-xl bg-ink p-3 font-mono text-xs text-stone">
          <span className="text-violet-bright">juano@lab:~$</span> whoami
          <br />
          Juano Rueda
          <br />
          <span className="text-violet-bright">juano@lab:~$</span> <span className="animate-pulse">▍</span>
        </span>
      );
    case "paint":
      return (
        <span aria-hidden className="grid w-24 grid-cols-8 gap-0.5">
          {"0110011011111111111111111111111101111110001111000001100000000000".split("").map((b, i) => (
            <span key={i} className={`aspect-square ${b === "1" ? "bg-violet-bright" : "bg-ink-3/40"}`} />
          ))}
        </span>
      );
    case "shader":
      return (
        <span aria-hidden className="flex gap-1.5">
          {[269, 325, 18, 95, 160, 205].map((h) => (
            <span key={h} className="size-6 rounded-full" style={{ background: `hsl(${h} 72% 63%)` }} />
          ))}
        </span>
      );
    case "filters":
      return (
        <span aria-hidden className="block w-28 font-mono text-[9px] leading-[1.05] text-violet-bright">
          {"  .:-=+*#\n .:=+*#%@\n.:-=*#%@@\n :-=+*#%@\n  .:-=+*#"}
        </span>
      );
    case "food":
      return (
        <span aria-hidden className="size-14">
          <FoodSprite id="arepa" />
        </span>
      );
  }
}

function TileCard({ tile, onOpen }: { tile: Tile; onOpen: (app: AppId) => void }) {
  const base =
    "group flex size-full flex-col justify-between rounded-3xl border p-6 text-left transition-[transform,border-color] duration-300 hover:-translate-y-1";

  switch (tile.kind) {
    case "app":
      return (
        <button
          type="button"
          data-tile
          data-cursor="Open"
          onClick={() => onOpen(tile.app)}
          className={`${base} border-violet/40 bg-ink-2 hover:border-violet-bright`}
        >
          <AppPreview app={tile.app} />
          <span>
            <span className="label text-violet-soft">App</span>
            <span className="mt-1 block font-display text-3xl font-bold tracking-tight">{tile.title}</span>
            <span className="text-sm text-stone">{tile.hint}</span>
          </span>
        </button>
      );
    case "link": {
      const inner = (
        <>
          <span className="label text-stone">{tile.external ? "External ↗" : "Portfolio →"}</span>
          <span>
            <span className="block font-display text-3xl font-bold tracking-tight">{tile.title}</span>
            <span className="text-sm text-stone">{tile.hint}</span>
          </span>
        </>
      );
      const cls = `${base} border-ink-3 bg-ink-2/60 hover:border-cream/40`;
      return tile.external ? (
        <a data-tile href={tile.href} target="_blank" rel="noopener noreferrer" data-cursor="Visit" className={cls}>
          {inner}
        </a>
      ) : (
        <Link data-tile href={tile.href} transitionTypes={["page-card"]} data-cursor="Go" className={cls}>
          {inner}
        </Link>
      );
    }
    case "quote":
      return (
        <div data-tile className={`${base} border-transparent bg-violet text-on-accent hover:translate-y-0`}>
          <span className="label">Manifesto</span>
          <p className="font-serif text-3xl leading-tight italic">{tile.text}</p>
        </div>
      );
    case "word":
      return (
        <div
          data-tile
          data-cursor="Hi!"
          className={`${base} items-center justify-center border-ink-3 bg-[radial-gradient(circle_at_50%_120%,var(--color-violet-deep),transparent_70%)]`}
        >
          <span className="font-serif text-7xl text-violet-soft italic">{tile.text}</span>
        </div>
      );
    case "soon":
      return (
        <div data-tile className={`${base} border-dashed border-ink-3 bg-transparent hover:translate-y-0`}>
          <span className="label w-fit rounded-full border border-ink-3 px-2 py-0.5 text-stone">Coming soon</span>
          <span>
            <span className="block font-display text-2xl font-bold tracking-tight text-stone">{tile.title}</span>
            <span className="text-sm text-stone/70">{tile.hint}</span>
          </span>
        </div>
      );
  }
}

/**
 * The /lab playground: an infinite canvas you can drag in any direction
 * (inspired by andreas.vision/play) with tiles that open mini-apps in
 * retro OS windows (inspired by evebouffard.com's explorations).
 */
export default function LabCanvas() {
  const viewport = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const [range, setRange] = useState({ c0: 0, c1: 0, r0: 0, r1: 0 });
  const [windows, setWindows] = useState<{ app: AppId; z: number }[]>([]);
  const zTop = useRef(10);

  /** Apply the offset to the plane and update which cells are visible. */
  const apply = useCallback(() => {
    const el = viewport.current;
    if (!el || !plane.current) return;
    const { x, y } = offset.current;
    plane.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const c0 = Math.floor(-x / COL) - 1;
    const c1 = Math.ceil((-x + el.clientWidth) / COL);
    const r0 = Math.floor(-y / ROW) - 2;
    const r1 = Math.ceil((-y + el.clientHeight) / ROW);
    setRange((prev) => (prev.c0 === c0 && prev.c1 === c1 && prev.r0 === r0 && prev.r1 === r1 ? prev : { c0, c1, r0, r1 }));
  }, []);

  useEffect(() => {
    const el = viewport.current!;
    // Start roughly centered on an interesting tile.
    offset.current = { x: el.clientWidth / 2 - CELL_W * 1.5, y: el.clientHeight / 2 - CELL_H * 0.9 };
    apply();

    let raf = 0;
    const glide = () => {
      if (drag.current) return;
      const v = velocity.current;
      if (Math.abs(v.x) < 0.1 && Math.abs(v.y) < 0.1) return;
      offset.current.x += v.x;
      offset.current.y += v.y;
      v.x *= 0.94;
      v.y *= 0.94;
      apply();
      raf = requestAnimationFrame(glide);
    };

    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest("[role=dialog]")) return;
      cancelAnimationFrame(raf);
      drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
      velocity.current = { x: 0, y: 0 };
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      d.moved += Math.abs(dx) + Math.abs(dy);
      if (d.moved > 6) el.classList.add("is-dragging");
      offset.current.x += dx;
      offset.current.y += dy;
      velocity.current = { x: dx, y: dy };
      apply();
    };
    const up = () => {
      if (!drag.current) return;
      const moved = drag.current.moved;
      drag.current = null;
      // Swallow the click that ends a drag so tiles don't open by accident.
      if (moved > 6) {
        const stop = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        window.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 0);
      }
      el.classList.remove("is-dragging");
      raf = requestAnimationFrame(glide);
    };
    const wheel = (e: WheelEvent) => {
      if ((e.target as Element).closest("[role=dialog]")) return;
      e.preventDefault();
      offset.current.x -= e.shiftKey ? e.deltaY : e.deltaX;
      offset.current.y -= e.shiftKey ? 0 : e.deltaY;
      apply();
    };
    const key = (e: KeyboardEvent) => {
      if ((e.target as Element).closest("input, textarea, [role=dialog]")) return;
      const step = 80;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [step, 0],
        ArrowRight: [-step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      offset.current.x += d[0];
      offset.current.y += d[1];
      apply();
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    window.addEventListener("resize", apply);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", apply);
    };
  }, [apply]);

  // Bring a window to the front (or open it). Only bumps the z-index when it isn't
  // already on top, so clicking/drawing inside a window doesn't grow it forever
  // (it used to end up above the custom cursor).
  const open = (app: AppId) =>
    setWindows((ws) => {
      const existing = ws.find((w) => w.app === app);
      const top = Math.max(0, ...ws.map((w) => w.z));
      if (existing && existing.z === top) return ws;
      zTop.current = top + 1;
      return existing
        ? ws.map((w) => (w.app === app ? { ...w, z: zTop.current } : w))
        : [...ws, { app, z: zTop.current }];
    });
  const close = (app: AppId) => setWindows((ws) => ws.filter((w) => w.app !== app));

  const cells: { c: number; r: number }[] = [];
  for (let c = range.c0; c <= range.c1; c++) for (let r = range.r0; r <= range.r1; r++) cells.push({ c, r });

  return (
    <>
      <div
        ref={viewport}
        data-lenis-prevent
        aria-label="Lab canvas — drag, scroll or use the arrow keys to explore"
        className="group/lab fixed inset-0 cursor-grab touch-none overflow-hidden bg-ink select-none [&.is-dragging]:cursor-grabbing [&.is-dragging_[data-tile]]:pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-ink-3) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div ref={plane} className="absolute top-0 left-0 will-change-transform">
          {cells.map(({ c, r }) => (
            <motion.div
              key={`${c}:${r}`}
              className="absolute"
              style={{ left: c * COL, top: cellY(c, r), width: CELL_W, height: CELL_H }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: mod(c + r, 5) * 0.04 }}
            >
              <TileCard tile={tileAt(c, r)} onOpen={open} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dock: always-reachable app launcher (keyboard + mobile friendly) */}
      <nav
        aria-label="Lab apps"
        data-lenis-prevent
        className="fixed bottom-5 left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-ink-3 bg-ink/80 p-1.5 whitespace-nowrap backdrop-blur-md [scrollbar-width:none]"
      >
        {(Object.keys(APPS) as AppId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => open(id)}
            className="btn-text rounded-full px-4 py-2 text-cream transition-colors hover:bg-ink-2"
          >
            {APPS[id].dock}
          </button>
        ))}
        <span className="label hidden px-3 text-stone md:inline">Drag to explore</span>
      </nav>

      <AnimatePresence>
        {windows.map((w, i) => (
          <Window
            key={w.app}
            title={APPS[w.app].title}
            width={APPS[w.app].width}
            z={w.z + 40}
            index={i}
            onClose={() => close(w.app)}
            onFocus={() => open(w.app)}
          >
            {APPS[w.app].render()}
          </Window>
        ))}
      </AnimatePresence>
    </>
  );
}
