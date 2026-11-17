"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { useRef, useState } from "react";
import type { Project } from "@/data/types";
import ProjectMedia from "./ProjectMedia";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pinned "Featured work" (desktop only), inspired by elicubillos.com:
 * a retro OS window in the middle swaps project as you scroll, a dotted ring
 * spins around it and the list of names on the left highlights the current one.
 */
export default function FeaturedWork({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();
  const n = projects.length;
  const current = projects[active];

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n))),
      });
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to("[data-ring]", {
          rotate: 220,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    },
    { scope: root },
  );

  // Clicking a name scrolls to that project's slot inside the pinned section.
  const goTo = (i: number) => {
    const el = root.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + (i + 0.5) * (el.offsetHeight - window.innerHeight) / n;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      aria-label="Featured work"
      className="relative"
      style={{ height: `${n * 100 + 50}svh` }}
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-4 pt-24 pb-8 lg:px-10 lg:pt-28 lg:pb-10">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-4xl leading-none font-bold tracking-tight lg:text-6xl">Featured work</h2>
          <span className="label text-stone">
            ({pad(active + 1)} / {pad(n)})
          </span>
        </div>

        {/* Center: dotted ring + retro window */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[22svh] lg:pb-0">
          <svg data-ring aria-hidden viewBox="0 0 200 200" className="absolute size-[min(92vw,58svh)] text-violet/50 lg:size-[86svh]">
            <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="0.4 2.6" strokeLinecap="round" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth=".4" strokeDasharray="0.3 4" />
          </svg>

          <a
            href={current.demo ?? current.github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="View project"
            className="pointer-events-auto relative w-[min(64vw,22rem)] rounded-2xl lg:w-[min(38vw,34rem)] border border-ink-3 bg-ink-2 p-2 shadow-[0_30px_120px_-20px] shadow-violet/40"
          >
            {/* Window chrome */}
            <span className="flex items-center gap-1.5 px-2 pt-1 pb-2">
              <span className="size-2.5 rounded-full bg-ink-3" />
              <span className="size-2.5 rounded-full bg-ink-3" />
              <span className="size-2.5 rounded-full bg-violet" />
              <span className="label ml-auto text-stone">{current.slug}.app</span>
            </span>
            <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-ink">
              {projects.map((p, i) => (
                <span
                  key={p.slug}
                  className={`absolute inset-0 transition-[opacity,transform,filter] duration-700 ease-out ${
                    i === active ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-sm"
                  }`}
                >
                  <ProjectMedia project={p} eager={i === 0} />
                </span>
              ))}
              {/* CRT scanlines */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                style={{ backgroundImage: "repeating-linear-gradient(to bottom, #000 0 1px, transparent 1px 3px)" }}
              />
            </span>
          </a>
        </div>

        {/* Bottom: names (left) + details (right) */}
        <div className="relative mt-auto flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <ol className="hidden space-y-1 lg:block">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active}
                  className={`font-display text-5xl font-bold tracking-tight transition-colors duration-500 ${
                    i === active ? "text-cream" : "text-stone/70 hover:text-stone"
                  }`}
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ol>

          <div key={current.slug} className="animate-fade-up lg:max-w-xs lg:text-right">
            {/* Mobile: the list of names is hidden, so show the current title here */}
            <h3 className="mb-2 font-display text-4xl font-bold tracking-tight lg:hidden">{current.title}</h3>
            <p className="text-sm text-cream/90">{current.description}</p>
            <p className="label mt-3 text-stone">
              {current.year} · {current.tags.join(" · ")}
            </p>
            <div className="mt-5 flex gap-2 lg:justify-end">
              <a
                href={current.github}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Code"
                className="btn-text rounded-full border border-ink-3 px-4 py-2 hover:border-violet"
              >
                GitHub ↗
              </a>
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
      </div>
    </section>
  );
}
