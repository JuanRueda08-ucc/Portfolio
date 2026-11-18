"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/types";
import { useT } from "@/lib/i18n";

/**
 * "Watch demo" button for projects with a video. The video opens in a floating window
 * that grows out of the button (owner's idea), with real controls, while the page
 * behind is blurred and its smooth scroll paused. Esc, ✕ or a click outside close it.
 */
export default function VideoButton({ project, className = "" }: { project: Project; className?: string }) {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const t = useT();
  const button = useRef<HTMLButtonElement>(null);

  const src = project.videoFull ?? project.video;
  if (!src) return null;

  const open = () => {
    const b = button.current!.getBoundingClientRect();
    // Offset from the screen centre, so the window can start on the button.
    setOrigin({ x: b.left + b.width / 2 - innerWidth / 2, y: b.top + b.height / 2 - innerHeight / 2 });
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={open}
        data-cursor={t.cursor.watch}
        className={`btn-text flex items-center gap-2 rounded-full border border-ink-3 px-4 py-2 hover:border-violet ${className}`}
      >
        <svg viewBox="0 0 10 10" className="size-2.5 fill-current" aria-hidden>
          <path d="M2 1l7 4-7 4z" />
        </svg>
        {t.projects.watch}
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {origin && (
              <Player
                project={project}
                src={src}
                origin={origin}
                onClose={() => {
                  setOrigin(null);
                  button.current?.focus();
                }}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function Player({ project, src, origin, onClose }: { project: Project; src: string; origin: { x: number; y: number }; onClose: () => void }) {
  const lenis = useLenis();
  const t = useT();
  const reduce = useReducedMotion();
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lenis?.stop();
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [lenis, onClose]);

  const from = reduce ? { opacity: 0 } : { opacity: 0, x: origin.x, y: origin.y, scale: 0.12 };

  return (
    <motion.div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.projects.videoLabel(project.title)}
        // Width also capped by the height, so a 16:10 video never overflows short screens.
        className="w-full max-w-[min(64rem,calc((100svh-6rem)*1.6))] rounded-2xl border border-ink-3 bg-ink-2 p-2 shadow-[0_40px_140px_-20px] shadow-violet/50"
        initial={from}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        exit={from}
        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window chrome, like the Featured work window */}
        <div className="flex items-center gap-1.5 px-2 pt-1 pb-2">
          <span className="size-2.5 rounded-full bg-ink-3" />
          <span className="size-2.5 rounded-full bg-ink-3" />
          <span className="size-2.5 rounded-full bg-violet" />
          <span className="label ml-3 text-stone">{project.title} — demo</span>
          <button
            ref={close}
            type="button"
            onClick={onClose}
            aria-label={t.projects.closeVideo}
            data-cursor={t.cursor.close}
            className="ml-auto flex size-7 items-center justify-center rounded-full text-stone hover:bg-ink-3 hover:text-cream"
          >
            ✕
          </button>
        </div>
        <video
          src={src}
          preload="none"
          poster={project.image}
          controls
          autoPlay
          playsInline
          className="block aspect-[16/10] w-full rounded-xl bg-ink object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
