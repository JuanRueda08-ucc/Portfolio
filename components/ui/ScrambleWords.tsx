"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Same kind of glyph pool as the reference: letters, digits and a few symbols.
const GLYPHS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&*#%";

type Props = {
  words: string[];
  /** Absolute positions (in %) for each word on md+ screens. Below md, words flow inline. */
  positions?: { x: number; y: number }[];
  className?: string;
};

/**
 * Words scattered across the area whose letters randomly swap to another
 * glyph for a moment (inspired by elissamartial.com).
 */
export default function ScrambleWords({ words, positions, className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);

  // Reveal the words one by one when the block enters the viewport.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-word]", {
        autoAlpha: 0,
        y: 14,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
    },
    { scope: root },
  );

  /*
   * Scramble rhythm measured on elissamartial.com:
   * - each word "decodes" about every 2.9 s (with jitter), never all at once;
   * - in a burst only 2–3 of its letters change;
   * - each of those letters cycles a new glyph every ~55 ms for 350–550 ms,
   *   then settles back on the real letter.
   */
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wordEls = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-word]"));
    const wordLetters = wordEls.map((w) => Array.from(w.querySelectorAll<HTMLSpanElement>("[data-ch]")));
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    // Next burst time per word (staggered so they don't fire together).
    let now = 0;
    const nextAt = wordEls.map(() => rand(300, 3000));
    // Active letters: when to stop and when to swap the glyph next.
    const active = new Map<HTMLSpanElement, { until: number; swap: number }>();

    const STEP = 55;
    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      now += STEP;

      // Start bursts on words whose time has come (at most 2 words active at once).
      const busyWords = new Set(wordLetters.filter((ls) => ls.some((l) => active.has(l))).map((ls) => ls));
      wordLetters.forEach((letters, i) => {
        if (now < nextAt[i] || busyWords.size >= 2 || busyWords.has(letters)) return;
        nextAt[i] = now + rand(2400, 3400);
        const n = Math.min(letters.length, Math.random() < 0.5 ? 2 : 3);
        const picks = [...letters].sort(() => Math.random() - 0.5).slice(0, n);
        picks.forEach((l) => {
          const start = now + rand(0, 120);
          active.set(l, { until: start + rand(350, 550), swap: start });
        });
        busyWords.add(letters);
      });

      // Advance active letters.
      for (const [l, s] of active) {
        if (now >= s.until) {
          l.textContent = l.dataset.ch ?? "";
          l.classList.remove("text-violet-bright");
          active.delete(l);
        } else if (now >= s.swap) {
          l.textContent = glyph();
          l.classList.add("text-violet-bright");
          s.swap = now + STEP;
        }
      }
    };

    const reset = () => {
      for (const l of active.keys()) {
        l.textContent = l.dataset.ch ?? "";
        l.classList.remove("text-violet-bright");
      }
      active.clear();
    };

    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = setInterval(tick, STEP);
      else reset();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
      reset();
    };
  }, [words]);

  return (
    <div ref={root} className={className}>
      <p className="sr-only">{words.join(" ")}</p>
      <div aria-hidden className="flex flex-wrap justify-center gap-x-3 gap-y-1 md:block">
        {words.map((word, i) => {
          const pos = positions?.[i];
          return (
            <span
              key={`${word}-${i}`}
              data-word
              className="inline-block font-serif text-2xl text-violet-soft italic md:absolute md:top-(--y) md:left-(--x) md:text-3xl"
              style={pos ? ({ "--x": `${pos.x}%`, "--y": `${pos.y}%` } as React.CSSProperties) : undefined}
            >
              {[...word].map((ch, j) => (
                <span key={j} data-ch={ch} className="transition-colors duration-150">
                  {ch}
                </span>
              ))}
            </span>
          );
        })}
      </div>
    </div>
  );
}
