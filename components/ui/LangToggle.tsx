"use client";

import { setLang, useLang, useT } from "@/lib/i18n";

/** EN / ES switch: a pill with both codes and a highlight that slides to the active one. */
export default function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const t = useT();
  const next = lang === "en" ? "es" : "en";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t.switchTo}
      title={t.switchTo}
      data-cursor={next.toUpperCase()}
      className={`relative flex h-9 items-center rounded-full bg-ink-2 p-1 font-mono text-[11px] font-semibold ${className}`}
    >
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-violet transition-transform duration-300 ease-out motion-reduce:transition-none ${
          lang === "es" ? "translate-x-full" : ""
        }`}
      />
      {(["en", "es"] as const).map((l) => (
        <span
          key={l}
          aria-hidden
          className={`relative w-7 text-center uppercase transition-colors duration-300 ${
            lang === l ? "text-on-accent" : "text-stone"
          }`}
        >
          {l}
        </span>
      ))}
    </button>
  );
}
