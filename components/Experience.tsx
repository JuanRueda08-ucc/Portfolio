"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { experience } from "@/data/experience";
import type { ExperienceItem } from "@/data/types";

const tabs: { id: ExperienceItem["type"]; label: string }[] = [
  { id: "education", label: "Education" },
  { id: "work", label: "Work" },
];

export default function Experience() {
  const [tab, setTab] = useState<ExperienceItem["type"]>("education");
  const items = experience.filter((e) => e.type === tab);

  return (
    <section id="experience" className="px-4 py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Experience" kicker="(05)" />

        <div role="tablist" aria-label="Experience type" className="mb-10 inline-flex rounded-full border border-ink-3 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? "bg-violet text-ink" : "text-stone hover:text-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ol className="relative border-l border-ink-3">
          {items.map((it) => (
            <li key={it.title} className="relative mb-10 ml-8">
              <span className="absolute top-1.5 -left-[37px] size-2.5 rounded-full bg-violet ring-4 ring-ink" />
              <p className="font-mono text-xs text-stone">
                {it.start} — {it.end}
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold">{it.title}</h3>
              <p className="text-violet-soft">{it.place}</p>
              {it.description && <p className="mt-2 max-w-xl text-sm text-stone">{it.description}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
