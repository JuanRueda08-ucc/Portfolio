"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

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

  // Continuous scramble: every tick one random letter flickers, while in view.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-ch]"));
    let timer: ReturnType<typeof setInterval> | undefined;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    const tick = () => {
      const span = letters[Math.floor(Math.random() * letters.length)];
      if (!span || span.dataset.busy) return;
      span.dataset.busy = "1";
      span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      span.classList.add("text-violet-bright");
      const id = setTimeout(() => {
        span.textContent = span.dataset.ch ?? "";
        span.classList.remove("text-violet-bright");
        delete span.dataset.busy;
        timeouts.delete(id);
      }, 160 + Math.random() * 220);
      timeouts.add(id);
    };

    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = setInterval(tick, 70);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
      timeouts.forEach(clearTimeout);
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
