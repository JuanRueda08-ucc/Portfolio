"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import SplitReveal from "@/components/ui/SplitReveal";
import { skills } from "@/data/skills";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Timeline length in "card units": each card takes 1 unit to rise, plus a short
 * hold at the end so the finished row stays on screen. The butterfly reads the
 * section progress (data-progress) and maps it with the same constant.
 */
export const SKILLS_TIMELINE = skills.length + 0.35;

/** Bell-shaped "hump" across a card, in real pixels (like the dotted curves on elicubillos.com). */
function humpPath(w: number, h: number) {
  const pts: string[] = [];
  const steps = Math.max(30, Math.round(w / 8));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const g = Math.exp(-((t - 0.5) ** 2) / (2 * 0.15 ** 2)); // gaussian bump
    const y = h * 0.95 - g * h * 0.85;
    pts.push(`${i === 0 ? "M" : "L"}${(t * w).toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/**
 * The dotted curve inside one card. A faint full curve is always visible; a
 * brighter copy is revealed behind the butterfly through the mask path
 * `[data-butterfly-trail="i"]` (the butterfly writes its stroke-dasharray).
 */
function CardCurve({ index, w, h }: { index: number; w: number; h: number }) {
  if (!w) return null;
  const d = humpPath(w, h);
  const id = `skills-trail-${index}`;
  return (
    <svg
      aria-hidden
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="pointer-events-none absolute top-[10%] left-0 overflow-visible text-cream"
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-20} y={-20} width={w + 40} height={h + 40}>
          <path
            data-butterfly-trail={index}
            d={d}
            pathLength={1000}
            fill="none"
            stroke="white"
            strokeWidth={16}
            // Fully drawn by default (reduced motion / no butterfly); the butterfly overrides it.
            strokeDasharray="1000 1000"
          />
        </mask>
      </defs>
      <path
        data-butterfly-line="skills"
        data-index={index}
        d={d}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={2.5}
        strokeDasharray="0 9"
        strokeLinecap="round"
      />
      <path
        d={d}
        mask={`url(#${id})`}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.85}
        strokeWidth={3}
        strokeDasharray="0 9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Extra section (course requirement), modelled on elicubillos.com:
 * the section pins while you scroll; the cards rise one after another and the
 * butterfly flies along the curve of the card that is rising, drawing it.
 * At the end all cards sit aligned at the same height.
 */
export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [curve, setCurve] = useState({ w: 0, h: 0 });

  // Curve box = card width × 42% of card height (all cards share the same size).
  useEffect(() => {
    const first = list.current?.querySelector<HTMLElement>("[data-card]");
    if (!first) return;
    const measure = () => setCurve({ w: first.offsetWidth, h: Math.round(first.offsetHeight * 0.42) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = root.current!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mm = gsap.matchMedia();

      // Desktop: pinned stage, cards rise in sequence (scrubbed by scroll).
      mm.add("(min-width: 1024px)", () => {
        if (reduce) {
          section.dataset.progress = "1";
          return;
        }
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            onUpdate: (self) => (section.dataset.progress = self.progress.toFixed(4)),
          },
        });
        cards.forEach((card, i) => tl.fromTo(card, { yPercent: 84 }, { yPercent: 0, duration: 1 }, i));
        tl.to({}, { duration: SKILLS_TIMELINE - cards.length }); // hold the finished row
        return () => delete section.dataset.progress;
      });

      // Smaller screens: no pin, simple staggered fade-up.
      mm.add("(max-width: 1023px)", () => {
        if (reduce) return;
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
    <section id="skills" ref={root} className="relative lg:h-[280vh]">
      <div className="flex flex-col px-4 pt-32 pb-16 md:px-10 lg:sticky lg:top-0 lg:h-svh lg:overflow-hidden lg:pt-28 lg:pb-8">
        <div className="mb-12 ml-auto max-w-xs text-right lg:mb-0">
          <p className="label mb-3 text-violet-soft">(06)</p>
          <SplitReveal className="font-display text-4xl font-bold tracking-tight md:text-5xl">Skills &amp; tools</SplitReveal>
          <p className="mt-4 text-sm text-stone">Always excited to take on new challenges and keep learning new tools.</p>
        </div>

        <ul
          ref={list}
          data-cards
          className="mx-auto mt-auto grid w-full max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {skills.map((s, i) => (
            <li
              key={s.title}
              data-card
              className="relative flex min-h-[26rem] flex-col overflow-hidden rounded-2xl bg-violet p-6 text-on-accent lg:h-[62svh]"
            >
              <span className="label">{String(i + 1).padStart(2, "0")}</span>
              <CardCurve index={i} w={curve.w} h={curve.h} />

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
