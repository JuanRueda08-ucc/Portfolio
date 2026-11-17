"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import SplitReveal from "@/components/ui/SplitReveal";
import { skills } from "@/data/skills";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Smooth sine wave across a `w × h` box, in real pixels (so dots stay round). */
function wavePath(w: number, h: number) {
  const pts: string[] = [];
  const steps = Math.max(24, Math.round(w / 12));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * w;
    const y = h * 0.5 - Math.sin(t * Math.PI * 2 * 1.25 + 0.6) * h * 0.38;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/**
 * One continuous dotted line across all the cards. The faint base line is always
 * there; a brighter copy is revealed behind the butterfly as it flies (the
 * butterfly drives the mask through `data-butterfly-trail`).
 */
function SkillsTrail({ cards }: { cards: React.RefObject<HTMLUListElement | null> }) {
  const [box, setBox] = useState({ w: 0, h: 0, top: 0 });

  useEffect(() => {
    const ul = cards.current;
    const first = ul?.querySelector<HTMLElement>("[data-card]");
    if (!ul || !first) return;
    const measure = () => {
      // Band through the upper-middle of the first row of cards.
      const ch = first.offsetHeight;
      setBox({ w: ul.clientWidth, h: Math.round(ch * 0.34), top: Math.round(ch * 0.16) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [cards]);

  if (!box.w) return null;
  const d = wavePath(box.w, box.h);

  return (
    <svg
      aria-hidden
      width={box.w}
      height={box.h}
      viewBox={`0 0 ${box.w} ${box.h}`}
      className="pointer-events-none absolute left-0 z-10 overflow-visible text-cream"
      style={{ top: box.top }}
    >
      <defs>
        <mask id="skills-trail-mask" maskUnits="userSpaceOnUse" x={-20} y={-20} width={box.w + 40} height={box.h + 40}>
          {/* Revealed length is set every frame by the butterfly (0 → 1000). */}
          <path data-butterfly-trail d={d} pathLength={1000} fill="none" stroke="white" strokeWidth={16} strokeDasharray="0 1000" />
        </mask>
      </defs>
      {/* Base line: faint round dots */}
      <path
        data-butterfly-line="skills"
        d={d}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={2.5}
        strokeDasharray="0 10"
        strokeLinecap="round"
      />
      {/* Trail: bright dots, only where the butterfly has already flown */}
      <path
        d={d}
        mask="url(#skills-trail-mask)"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeDasharray="0 10"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 4px var(--color-violet-bright))" }}
      />
    </svg>
  );
}

// Extra section (course requirement): staggered rising cards like elicubillos.com.
export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const cards = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const mm = gsap.matchMedia();
      // Desktop: cards rise with the scroll, each one a bit later; the last ends higher.
      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { yPercent: 85 },
            {
              yPercent: i === cards.length - 1 ? -12 : 0,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: `top ${85 - i * 6}%`,
                end: `top ${25 - i * 6}%`,
                scrub: 0.6,
              },
            },
          );
        });
      });
      // Mobile/tablet: simple staggered fade-up.
      mm.add("(max-width: 1023px)", () => {
        gsap.from("[data-card]", {
          y: 60,
          autoAlpha: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-cards]", start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="skills" ref={root} className="overflow-hidden px-4 pt-32 pb-40 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 ml-auto max-w-xs text-right lg:mb-32">
          <p className="label mb-3 text-violet-soft">(06)</p>
          <SplitReveal className="font-display text-4xl font-bold tracking-tight md:text-5xl">Skills &amp; tools</SplitReveal>
          <p className="mt-4 text-sm text-stone">Always excited to take on new challenges and keep learning new tools.</p>
        </div>

        <div className="relative">
        <SkillsTrail cards={cards} />
        <ul ref={cards} data-cards className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          {skills.map((s, i) => (
            <li
              key={s.title}
              data-card
              className="relative flex min-h-[26rem] flex-col overflow-hidden rounded-2xl bg-violet p-6 text-on-accent"
            >
              <span className="label">{String(i + 1).padStart(2, "0")}</span>

              <div className="relative mt-auto">
                <h3 className="font-card text-2xl font-semibold">{s.title}</h3>
                <p className="font-card text-lg">{s.subtitle}</p>
                <p className="mt-3 text-sm">{s.description}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.items.map((it) => (
                    <li key={it} className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[11px]">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  );
}
