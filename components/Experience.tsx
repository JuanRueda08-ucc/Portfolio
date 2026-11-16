"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { experience } from "@/data/experience";
import type { ExperienceItem } from "@/data/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const columns: { type: ExperienceItem["type"]; label: string; icon: string }[] = [
  { type: "education", label: "Education", icon: "🎓" },
  { type: "work", label: "Work", icon: "💼" },
];

/** Both education and work are always visible (course requirement), side by side on desktop. */
export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-timeline]").forEach((tl) => {
        // The vertical line draws itself as you scroll through the column.
        gsap.fromTo(
          tl.querySelector("[data-line]"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: tl, start: "top 75%", end: "bottom 60%", scrub: 0.5 },
          },
        );
        tl.querySelectorAll<HTMLElement>("[data-item]").forEach((item) => {
          gsap
            .timeline({ scrollTrigger: { trigger: item, start: "top 82%", once: true } })
            .from(item.querySelector("[data-dot]"), { scale: 0, duration: 0.5, ease: "back.out(3)" })
            .from(item.querySelector("[data-body]"), { y: 24, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.05);
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="experience" ref={root} className="px-4 py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Experience" kicker="(05)" />

        <div className="grid gap-16 md:grid-cols-2 md:gap-12">
          {columns.map((col) => {
            const items = experience.filter((e) => e.type === col.type);
            return (
              <div key={col.type}>
                <h3 className="label mb-8 flex items-center gap-2 text-violet-soft">
                  <span aria-hidden>{col.icon}</span> {col.label}
                </h3>
                <ol data-timeline className="relative">
                  <span
                    data-line
                    aria-hidden
                    className="absolute top-0 bottom-0 left-0 w-px origin-top bg-gradient-to-b from-violet to-ink-3"
                  />
                  {items.map((it) => (
                    <li key={it.title} data-item className="relative pb-12 pl-8 last:pb-0">
                      <span
                        data-dot
                        aria-hidden
                        className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-violet ring-4 ring-ink"
                      />
                      <div data-body>
                        <p className="label text-stone">
                          {it.start} — {it.end}
                        </p>
                        <h4 className="mt-1 font-display text-2xl font-bold tracking-tight">{it.title}</h4>
                        <p className="text-violet-soft">{it.place}</p>
                        {it.description && <p className="mt-2 max-w-md text-sm text-stone">{it.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
