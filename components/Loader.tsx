"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { markReady } from "@/lib/ready";

gsap.registerPlugin(useGSAP);

/** Resolves when web fonts and the window `load` event are done. */
function assetsReady(): Promise<void> {
  const load =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
  return Promise.all([load, document.fonts.ready]).then(() => undefined);
}

/**
 * Intro loader inspired by elicubillos.com: the "O" of LOADING is an outlined
 * pill that stretches with the progress, then the whole screen slides up.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const active = useRef(true);

  // Lock smooth scroll while the loader is on screen (Lenis may mount after us).
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
    if (active.current) lenis?.stop();
  }, [lenis]);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const state = { p: 0 };
      // Max extra width of the "O", relative to the viewport.
      const maxGrow = () => Math.min(window.innerWidth * 0.55, 900);

      const render = () => {
        if (count.current) count.current.textContent = `${Math.round(state.p)}%`;
        pill.current?.style.setProperty("--grow", `${(state.p / 100) * maxGrow()}px`);
      };

      const finish = () => {
        gsap
          .timeline({
            onComplete: () => {
              active.current = false;
              lenisRef.current?.start();
              if (root.current) root.current.style.display = "none";
            },
          })
          .to(state, { p: 100, duration: reduce ? 0 : 0.5, ease: "power2.out", onUpdate: render })
          .to(root.current, {
            yPercent: -100,
            duration: reduce ? 0 : 1,
            ease: "expo.inOut",
            delay: reduce ? 0 : 0.15,
            onStart: markReady,
          });
      };

      // Count up to 90% while assets load, then finish once everything is ready.
      const crawl = gsap.to(state, { p: 90, duration: reduce ? 0 : 2, ease: "power1.out", onUpdate: render });
      const minTime = new Promise((r) => setTimeout(r, reduce ? 0 : 1400));
      Promise.all([assetsReady(), minTime]).then(() => {
        crawl.kill();
        finish();
      });
    },
    { scope: root },
  );

  return (
    <div
      id="loader"
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-ink px-4 pb-4 text-violet md:px-6 md:pb-6"
    >
      <span ref={count} className="text-[clamp(1rem,2.5vw,2.25rem)] leading-none">
        0%
      </span>
      <p className="flex items-center text-[clamp(3rem,7vw,7.5rem)] leading-none font-medium tracking-[-0.06em] uppercase">
        L
        <span
          ref={pill}
          className="mx-[0.02em] inline-block h-[0.74em] w-[calc(0.7em+var(--grow,0px))] shrink-0 rounded-full border-[0.1em] border-current"
        />
        ADING
      </p>
      <noscript>
        <style>{"#loader{display:none}"}</style>
      </noscript>
    </div>
  );
}
