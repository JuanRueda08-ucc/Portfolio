"use client";

import { useRef, useState } from "react";
import type { Project } from "@/data/types";

type Props = {
  project: Project;
  className?: string;
  /** Above-the-fold copy (featured screen): load the thumbnail and video metadata eagerly. */
  eager?: boolean;
};

/** How long a finger must rest on a card before its video plays (touch). */
const HOLD_MS = 350;

/**
 * Project visual: the cover image (or a generated cover) at rest. Projects with a
 * video play it like a YouTube thumbnail: on mouse hover, or while a finger holds
 * the card on touch screens; leaving or lifting brings the thumbnail back (owner's
 * choice — an always-running, sped-up loop was too fast to follow).
 */
export default function ProjectMedia({ project, className = "", eager = false }: Props) {
  if (project.video) return <HoverVideo project={project} className={className} eager={eager} />;
  return <Cover project={project} className={className} eager={eager} />;
}

function Cover({ project, className, eager }: Required<Props>) {
  if (project.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.image}
        alt={`${project.title} screenshot`}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        className={`size-full object-cover ${className}`}
      />
    );
  }

  const h = project.hue ?? 268;
  return (
    <div
      role="img"
      aria-label={`${project.title} cover`}
      className={`relative flex size-full items-end overflow-hidden p-5 ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 110%, hsl(${h} 85% 62%), transparent 60%),
                     radial-gradient(90% 80% at 100% 0%, hsl(${(h + 40) % 360} 70% 35%), transparent 70%),
                     hsl(${h} 30% 10%)`,
      }}
    >
      {/* Pixel grid overlay */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.25) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <span className="relative font-display text-[clamp(1.5rem,4vw,3rem)] leading-none font-bold tracking-tight text-cream uppercase">
        {project.title}
      </span>
    </div>
  );
}

function HoverVideo({ project, className, eager }: Required<Props>) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Touch hold: the pending timer, and whether this press turned into a hold
  // (then the release must not open the link underneath).
  const hold = useRef({ timer: 0, held: false });

  const play = () => {
    const v = video.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().then(
      () => setPlaying(true),
      () => {},
    );
  };
  const stop = () => {
    const v = video.current;
    window.clearTimeout(hold.current.timer);
    hold.current.timer = 0;
    if (!v) return;
    v.pause();
    setPlaying(false);
  };

  return (
    <span
      className="relative block size-full touch-manipulation select-none [-webkit-touch-callout:none]"
      onPointerEnter={(e) => e.pointerType === "mouse" && play()}
      onPointerLeave={(e) => e.pointerType === "mouse" && stop()}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        hold.current.held = false;
        hold.current.timer = window.setTimeout(() => {
          hold.current.held = true;
          play();
        }, HOLD_MS);
      }}
      onPointerUp={(e) => e.pointerType !== "mouse" && stop()}
      // Scrolling the page with the finger cancels the press before it becomes a hold.
      onPointerCancel={stop}
      onClickCapture={(e) => {
        if (!hold.current.held) return;
        hold.current.held = false;
        e.preventDefault();
        e.stopPropagation();
      }}
      // A long press would also open the browser's link menu.
      onContextMenu={(e) => {
        if (hold.current.timer || hold.current.held) e.preventDefault();
      }}
    >
      <Cover project={project} className={className} eager={eager} />
      <video
        ref={video}
        src={project.video}
        muted
        loop
        playsInline
        preload={eager ? "metadata" : "none"}
        aria-hidden
        className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${className} ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        aria-hidden
        className={`label pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-ink/75 px-2.5 py-1 text-cream backdrop-blur-sm transition-opacity duration-300 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      >
        <svg viewBox="0 0 10 10" className="size-2 fill-current" aria-hidden>
          <path d="M2 1l7 4-7 4z" />
        </svg>
        <span className="pointer-coarse:hidden">Hover to play</span>
        <span className="hidden pointer-coarse:inline">Hold to play</span>
      </span>
    </span>
  );
}
