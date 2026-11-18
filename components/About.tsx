"use client";

import LineDrawing from "@/components/ui/LineDrawing";
import LogoReveal from "@/components/ui/LogoReveal";
import ScrambleWords from "@/components/ui/ScrambleWords";
import SectionHeading from "@/components/ui/SectionHeading";
import Stickers from "@/components/ui/Stickers";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { localize, useLang, useT } from "@/lib/i18n";

/** Where each word of the manifesto sits on desktop (% of the stage). */
const WORD_POSITIONS = [
  { x: 14, y: 6 },
  { x: 26, y: 14 },
  { x: 20, y: 24 },
  { x: 66, y: 10 },
  { x: 72, y: 30 },
  { x: 80, y: 44 },
  { x: 8, y: 58 },
  { x: 18, y: 70 },
  { x: 70, y: 66 },
  { x: 62, y: 82 },
  { x: 76, y: 90 },
];

export default function About() {
  const lang = useLang();
  const t = useT();
  const me = localize(profile, lang);
  const facts = [
    { k: t.about.based, v: me.city },
    { k: t.about.studying, v: me.career },
    { k: t.about.currently, v: me.semester },
  ];
  const tech = skills.flatMap((g) => g.items);

  return (
    <section id="about" className="px-4 py-32 md:px-10">
      {/* Stage: scrambling manifesto around a portrait drawn with lines */}
      <div className="relative mx-auto mb-24 flex max-w-7xl flex-col items-center gap-10 md:block md:h-[85svh]">
        <ScrambleWords
          key={lang}
          words={me.manifesto.split(" ")}
          positions={WORD_POSITIONS}
          className="w-full md:absolute md:inset-0"
        />
        {/* Desktop: the JR logo drawn with lines around the cursor (owner's choice);
            "light" traces the chrome letters. */}
        <LineDrawing
          src={profile.logo}
          trace="light"
          fallbackText={profile.initials}
          label={t.about.logoLabel(me.displayName)}
          className="hidden aspect-[3/4] md:absolute md:top-1/2 md:left-1/2 md:block md:h-[80%] md:w-auto md:-translate-x-1/2 md:-translate-y-1/2"
        />
        <span data-cursor={t.cursor.hi} aria-hidden className="absolute inset-x-1/4 inset-y-[10%] hidden md:block" />
        <p className="label absolute bottom-0 left-1/2 hidden -translate-x-1/2 text-stone md:block">
          {t.about.hint}
        </p>

        {/* Phones: no cursor, and the line drawing takes ages to build by itself,
            so a Generate press draws the same lines quickly (owner's choice). */}
        <div className="md:hidden">
          <LogoReveal
            src={profile.logo}
            fallbackText={profile.initials}
            label={t.about.logoLabel(me.displayName)}
            className="aspect-[3/4] w-[min(80vw,22rem)]"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t.about.title} kicker="(02)" />
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xl leading-relaxed md:text-2xl">{me.about}</p>

            <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.k} className="rounded-2xl border border-ink-3 p-4">
                  <dt className="label text-stone">{f.k}</dt>
                  <dd className="mt-1 font-display font-bold">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="label mb-3 text-stone">{t.about.stack}</p>
            <Stickers items={tech} className="min-h-72 rounded-3xl border border-dashed border-ink-3 bg-ink-2/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
