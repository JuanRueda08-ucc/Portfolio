"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "@/data/types";
import ProjectMedia from "./ProjectMedia";
import VideoButton from "./VideoButton";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, "0");
/** Wheel geometry per screen size: radius of the invisible wheel, degrees between cards, card size. */
const GEO = {
  lg: { radius: 1500, step: 15, w: 340, h: 240, top: "40svh", lift: 1.18, details: 190 },
  sm: { radius: 900, step: 19, w: 230, h: 165, top: "33svh", lift: 1.12, details: 128 },
} as const;
const SM_QUERY = "(max-width: 767px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(SM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getSize = () => (window.matchMedia(SM_QUERY).matches ? "sm" : "lg");

/**
 * "All work" arc carousel (compact geometry on phones), inspired by elicubillos.com:
 * cards ride on a huge wheel that turns as you scroll; the centered card grows
 * and its details appear underneath.
 */
export default function ArcCarousel({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = projects.length;
  const current = projects[active];
  const size = useSyncExternalStore(subscribe, getSize, () => "lg" as const);
  const { radius: RADIUS, step: STEP, w: CARD_W, h: CARD_H, top: TOP, lift, details } = GEO[size];

  useGSAP(
    () => {
      gsap.to(wheel.current, {
        rotate: -(n - 1) * STEP,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          // No `snap`: it fights Lenis smooth scrolling and can jump the page.
          onUpdate: (self) => setActive(Math.round(self.progress * (n - 1))),
        },
      });
    },
    { scope: root, dependencies: [size], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      aria-label="All work"
      className="relative"
      style={{ height: `${n * 55 + 60}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden px-4 pt-24 lg:px-10 lg:pt-28">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-4xl font-bold tracking-tight lg:text-6xl">All work</h2>
          <span className="label text-stone">
            ({pad(active + 1)} / {pad(n)})
          </span>
        </div>

        {/* Faint arc guide */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 rounded-full border border-dashed border-ink-3"
          style={{ width: RADIUS * 2, height: RADIUS * 2, top: TOP, marginLeft: -RADIUS }}
        />

        {/* Wheel: its center sits far below the viewport */}
        <div
          ref={wheel}
          className="absolute left-1/2"
          style={{ top: `calc(${TOP} + ${RADIUS}px)`, width: 0, height: 0 }}
        >
          {projects.map((p, i) => (
            <a
              key={p.slug}
              href={p.demo ?? p.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="View project"
              tabIndex={i === active ? 0 : -1}
              aria-hidden={i !== active}
              className="absolute block"
              style={{
                width: CARD_W,
                height: CARD_H,
                left: -CARD_W / 2,
                top: -RADIUS - CARD_H / 2,
                // Rotate around the wheel center (far below the card).
                transformOrigin: `50% ${RADIUS + CARD_H / 2}px`,
                rotate: `${i * STEP}deg`,
              }}
            >
              {/* Scale on an inner box so it grows around its own center, not the wheel's. */}
              <span
                className={`block size-full overflow-hidden rounded-2xl border border-ink-3 bg-ink-2 shadow-2xl shadow-black/50 transition-[scale,opacity,filter] duration-500 ${
                  i === active ? "opacity-100" : "scale-95 opacity-60 saturate-50"
                }`}
                style={i === active ? { scale: String(lift) } : undefined}
              >
                <ProjectMedia project={p} />
              </span>
            </a>
          ))}
        </div>

        {/* Details of the centered project */}
        <div
          key={current.slug}
          className="absolute inset-x-0 mx-auto max-w-md animate-fade-up px-4 text-center"
          style={{ top: `calc(${TOP} + ${details}px)` }}
        >
          <p className="label text-stone">
            (Project {pad(active + 1)}) · {current.year}
          </p>
          <h3 className="mt-2 font-display text-3xl font-bold tracking-tight lg:text-4xl">{current.title}</h3>
          <p className="mt-3 text-sm text-cream/85">{current.description}</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {current.tags.map((t) => (
              <li key={t} className="rounded-full bg-violet/15 px-2.5 py-0.5 font-mono text-[11px] text-violet-soft">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap justify-center gap-2 [&>*]:whitespace-nowrap">
            <a
              href={current.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Code"
              className="btn-text rounded-full border border-ink-3 px-4 py-2 hover:border-violet"
            >
              GitHub ↗
            </a>
            <VideoButton project={current} />
            {current.demo && (
            <a
              href={current.demo}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Live"
              className="btn-text rounded-full bg-violet-bright px-4 py-2 text-on-accent"
            >
              Visit project ↗
            </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
