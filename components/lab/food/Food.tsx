"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { FOODS, PALETTE, type Food as FoodItem } from "./sprites";

/** Renders a 12×12 sprite as crisp SVG rects. */
function Sprite({ sprite, className = "" }: { sprite: string[]; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden className={className}>
      {sprite.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === "." || !PALETTE[ch] ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETTE[ch]} />)),
      )}
    </svg>
  );
}

/** A single food sprite by id (used for the Lab tile preview). */
export function FoodSprite({ id }: { id: string }) {
  const f = FOODS.find((x) => x.id === id);
  return f ? <Sprite sprite={f.sprite} className="size-full" /> : null;
}

/** Pixel basket (woven) or picnic blanket (gingham), drawn with CSS. */
function Container({ mode }: { mode: "basket" | "picnic" }) {
  if (mode === "picnic") {
    return (
      <div
        aria-hidden
        className="absolute inset-0 rounded-md"
        style={{
          backgroundColor: "#fff8ee",
          backgroundImage:
            "linear-gradient(90deg, rgb(226 72 61 / .55) 50%, transparent 50%), linear-gradient(rgb(226 72 61 / .55) 50%, transparent 50%)",
          backgroundSize: "28px 28px",
          imageRendering: "pixelated",
          boxShadow: "inset 0 0 0 4px #2b1d14",
        }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="absolute inset-0 rounded-[10px]"
      style={{
        backgroundColor: "#c98a4b",
        backgroundImage:
          "repeating-linear-gradient(90deg, #8a4b22 0 6px, transparent 6px 18px), repeating-linear-gradient(0deg, #e0a868 0 6px, transparent 6px 12px)",
        boxShadow: "inset 0 0 0 4px #2b1d14, inset 0 10px 0 4px #5a2e14",
      }}
    />
  );
}

/** Positions (in %) for the 12 foods around the container. */
const SPOTS = [
  [6, 8], [26, 4], [50, 3], [74, 4], [93, 8],
  [3, 45], [96, 45],
  [6, 84], [26, 90], [50, 92], [74, 90], [93, 84],
];

/**
 * Food: drag Colombian snacks into a basket (or onto a picnic blanket).
 * Each one drops a pun. Tap a food to add it, tap it in the basket to take it out.
 */
export default function Food() {
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"basket" | "picnic">("basket");
  const [inside, setInside] = useState<string[]>([]);
  const [pun, setPun] = useState<{ text: string; key: number } | null>(null);
  const punTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const punCount = useRef(0);

  const add = (f: FoodItem) => {
    setInside((list) => (list.includes(f.id) ? list : [...list, f.id]));
    setPun({ text: f.pun, key: ++punCount.current });
    clearTimeout(punTimer.current);
    punTimer.current = setTimeout(() => setPun(null), 2600);
  };
  const remove = (id: string) => setInside((list) => list.filter((x) => x !== id));

  const droppedInBox = (point: { x: number; y: number }) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return false;
    // info.point is page coordinates; convert to viewport.
    const x = point.x - window.scrollX;
    const y = point.y - window.scrollY;
    return x > r.left && x < r.right && y > r.top && y < r.bottom;
  };

  const shelf = FOODS.filter((f) => !inside.includes(f.id));
  const label = mode === "basket" ? "basket" : "blanket";

  return (
    <div className="flex flex-col gap-3 bg-ink-2 p-4" data-lenis-prevent>
      <div ref={stage} className="relative h-[min(62vh,30rem)] overflow-hidden rounded-xl bg-ink">
        {/* Container in the middle */}
        <div ref={box} className="absolute top-1/2 left-1/2 h-[46%] w-[52%] -translate-x-1/2 -translate-y-1/2">
          <Container mode={mode} />
          <ul className="relative flex h-full flex-wrap content-center justify-center gap-1 p-4" aria-label={`In the ${label}`}>
            <AnimatePresence>
              {inside.map((id) => {
                const f = FOODS.find((x) => x.id === id)!;
                return (
                  <motion.li key={id} layout initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                    <button
                      type="button"
                      onClick={() => remove(id)}
                      aria-label={`Take ${f.name} out`}
                      data-cursor="Take out"
                      className="block size-10 md:size-12"
                    >
                      <Sprite sprite={f.sprite} className="size-full drop-shadow" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Pun bubble */}
          <AnimatePresence>
            {pun && (
              <motion.p
                key={pun.key}
                role="status"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute -top-12 left-1/2 w-max max-w-[16rem] -translate-x-1/2 rounded-full border border-ink-3 bg-cream px-3 py-1.5 text-center font-mono text-[11px] text-ink shadow-lg"
              >
                {pun.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Foods around it */}
        {shelf.map((f) => {
          const i = FOODS.indexOf(f);
          const [x, y] = SPOTS[i % SPOTS.length];
          return (
            <motion.button
              key={f.id}
              type="button"
              aria-label={`Add ${f.name} to the ${label}`}
              data-cursor={f.name}
              drag
              dragConstraints={stage}
              dragSnapToOrigin
              dragElastic={0.2}
              whileHover={{ scale: 1.12, rotate: -4 }}
              whileDrag={{ scale: 1.25, zIndex: 20 }}
              onTap={() => add(f)}
              onDragEnd={(_, info) => droppedInBox(info.point) && add(f)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute size-12 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing md:size-16"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <Sprite sprite={f.sprite} className="pointer-events-none size-full drop-shadow-md" />
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-ink p-1" role="radiogroup" aria-label="Mode">
          {(["basket", "picnic"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`btn-text rounded-full px-4 py-1.5 ${mode === m ? "bg-violet text-on-accent" : "text-stone"}`}
            >
              {m === "basket" ? "Canasta" : "Picnic"}
            </button>
          ))}
        </div>
        <p className="label text-stone" aria-live="polite">
          {inside.length} item{inside.length === 1 ? "" : "s"} in the {label}
        </p>
        {inside.length > 0 && (
          <button type="button" onClick={() => setInside([])} className="btn-text ml-auto rounded-full px-3 py-1.5 text-stone hover:text-cream">
            Empty
          </button>
        )}
      </div>
    </div>
  );
}
