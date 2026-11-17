"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

/* Only enable the custom cursor on devices with a precise pointer (mouse/trackpad). */
const FINE_POINTER = "(pointer: fine) and (prefers-reduced-motion: no-preference)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getSnapshot = () => window.matchMedia(FINE_POINTER).matches;
const getServerSnapshot = () => false;

const INTERACTIVE = "a, button, [role='button'], label, summary";

/**
 * Custom cursor inspired by kiira.in: a small dot that follows the mouse and
 * morphs into a pill label over any element with `data-cursor="Label"`.
 * Plain links/buttons without a label make the dot grow.
 */
export default function Cursor() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.35 });

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor || null);
      setHovering(Boolean(target?.closest(INTERACTIVE)));
    };
    const leave = () => setVisible(false);
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      html.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const scale = pressed ? 0.8 : hovering && !label ? 2.6 : 1;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[90]"
      style={{ x: sx, y: sy }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        layout
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden ${
          label ? "rounded-full bg-violet-bright px-4 py-2" : "size-2.5 rounded-full"
        } ${!label && hovering ? "bg-violet-bright/40" : !label ? "bg-cream" : ""}`}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ borderRadius: 999 }}
      >
        <AnimatePresence mode="popLayout">
          {label && (
            <motion.span
              key={label}
              className="btn-text whitespace-nowrap text-on-accent"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
