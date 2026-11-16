"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import SplitReveal from "@/components/ui/SplitReveal";
import { skills } from "@/data/skills";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * One continuous dotted sine wave split across the cards: card `i` draws the
 * slice [i, i+1] of the wave, so together they read as a single line.
 */
function wavePath(i: number, total: number) {
  const pts: string[] = [];
  for (let x = 0; x <= 100; x += 2) {
    const t = (i * 100 + x) / (total * 100); // 0..1 across all cards
    const y = 52 - Math.sin(t * Math.PI * 2 * 1.25 + 0.6) * 22;
    pts.push(`${x === 0 ? "M" : "L"}${x},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

// Extra section (course requirement): staggered rising cards like elicubillos.com.
export default function Skills() {
  const root = useRef<HTMLElement>(null);

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

        <ul data-cards className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          {skills.map((s, i) => (
            <li
              key={s.title}
              data-card
              className="relative flex min-h-[26rem] flex-col overflow-hidden rounded-2xl bg-violet p-6 text-ink"
            >
              <span className="label">{String(i + 1).padStart(2, "0")}</span>

              <svg
                aria-hidden
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 top-[18%] h-[40%] w-full"
              >
                <path
                  d={wavePath(i, skills.length)}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.45"
                  strokeWidth="1.4"
                  strokeDasharray="1 5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

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
    </section>
  );
}
