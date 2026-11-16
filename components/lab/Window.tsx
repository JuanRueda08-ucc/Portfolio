"use client";

import { motion, useDragControls } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  title: string;
  z: number;
  /** Offset so stacked windows don't cover each other exactly. */
  index: number;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
  width?: number;
};

/**
 * Retro OS window: drag it by the title bar, click to bring to front,
 * Escape or the red dot to close. Full-screen on small viewports.
 */
export default function Window({ title, z, index, onClose, onFocus, children, width = 560 }: Props) {
  const controls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      onPointerDown={onFocus}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      style={{ zIndex: z, ["--w" as string]: `${width}px`, ["--i" as string]: index }}
      className="fixed inset-2 flex flex-col overflow-hidden rounded-2xl border border-ink-3 bg-ink-2 shadow-[0_40px_120px_-30px] shadow-black outline-none md:inset-auto md:top-[calc(18vh+var(--i)*28px)] md:left-[calc(50%-var(--w)/2+var(--i)*28px)] md:w-(--w)"
      data-lenis-prevent
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="flex cursor-grab touch-none items-center gap-2 border-b border-ink-3 px-3 py-2.5 select-none active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="size-3 rounded-full bg-violet-bright transition-transform hover:scale-125"
        />
        <span aria-hidden className="size-3 rounded-full bg-ink-3" />
        <span aria-hidden className="size-3 rounded-full bg-ink-3" />
        <span className="label ml-2 text-stone">{title}</span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </motion.div>
  );
}
