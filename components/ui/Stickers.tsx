"use client";

import { motion } from "motion/react";
import { useRef } from "react";

type Props = { items: string[]; className?: string };

/** Pseudo-random but stable tilt/position per index, so SSR and client match. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Tech "stickers" you can drag around inside their box (inspired by the
 * draggable objects on kiira.in). On touch they're still draggable.
 */
export default function Stickers({ items, className = "" }: Props) {
  const bounds = useRef<HTMLDivElement>(null);

  return (
    <div ref={bounds} className={`relative ${className}`}>
      <ul className="flex flex-wrap content-center justify-center gap-3 p-6" aria-label="Technologies I use">
        {items.map((t, i) => (
          <motion.li
            key={t}
            drag
            dragConstraints={bounds}
            dragElastic={0.15}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
            whileHover={{ scale: 1.06 }}
            whileDrag={{ scale: 1.12, rotate: 0, zIndex: 10 }}
            // Rounded so the server and client serialize the same transform string.
            initial={{ rotate: Math.round((rand(i, 1) - 0.5) * 140) / 10 }}
            data-cursor="Drag"
            className={`cursor-grab touch-none rounded-full px-4 py-2 font-mono text-sm shadow-lg shadow-black/30 select-none active:cursor-grabbing ${
              rand(i, 2) > 0.7
                ? "bg-violet-bright text-ink"
                : rand(i, 3) > 0.5
                  ? "bg-cream text-ink"
                  : "border border-violet/40 bg-ink-2 text-violet-soft"
            }`}
          >
            {t}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
