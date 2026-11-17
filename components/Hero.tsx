"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { HeroState } from "@/components/hero/HeroScene";
import Avatar from "@/components/ui/Avatar";
import { profile } from "@/data/profile";
import { hasFastWebGL } from "@/lib/gpu";
import { onReady } from "@/lib/ready";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const HeroScene = dynamic(() => import("@/components/hero/HeroScene"), { ssr: false });

/* 3D is enabled only with hardware WebGL and without a reduced-motion preference. */
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const can3D = () => hasFastWebGL() && !window.matchMedia(MOTION_QUERY).matches;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const state = useRef<HeroState>({ mouse: { x: 0.5, y: 0.3 }, hover: 0, scroll: 0, intro: 0 });
  const enable3D = useSyncExternalStore(subscribe, can3D, () => false);
  const [inView, setInView] = useState(true);
  const [mount3D, setMount3D] = useState(false);

  // Mount the (heavy) 3D scene only after the loader leaves and the browser is idle,
  // so shader compilation doesn't block the intro. The word grows in when it appears.
  useEffect(() => {
    let idle = 0;
    const stop = onReady(() => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle = ric(() => setMount3D(true), { timeout: 1200 });
    });
    return () => {
      stop();
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, []);

  // Pause the WebGL loop when the hero leaves the screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const s = state.current;
      const reduce = window.matchMedia(MOTION_QUERY).matches;

      // ── Mouse parallax: every [data-depth] element drifts with the pointer.
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", el).map((node) => ({
        depth: Number(node.dataset.depth),
        x: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3.out" }),
      }));
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        s.mouse.x = nx;
        s.mouse.y = 1 - ny;
        s.hover = ny >= 0 && ny <= 1 ? 1 : 0;
        if (reduce) return;
        for (const l of layers) {
          l.x((nx - 0.5) * l.depth);
          l.y((ny - 0.5) * l.depth);
        }
      };
      const onLeave = () => (s.hover = 0);
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);

      // ── Intro, after the loader leaves.
      const split = SplitText.create("[data-split]", { type: "lines", mask: "lines" });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set("[data-fade]", { autoAlpha: 0, y: 16 });
      const stopReady = onReady(() => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(s, { intro: 1, duration: reduce ? 0 : 2.2, ease: "power2.out" }, 0)
          .to(split.lines, { yPercent: 0, duration: reduce ? 0 : 1.3, stagger: 0.08 }, 0.25)
          .to("[data-fade]", { autoAlpha: 1, y: 0, duration: reduce ? 0 : 1, stagger: 0.08 }, 0.5);
      });

      // ── Scroll: the scene sinks back and the copy drifts up as we leave the hero.
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => (s.scroll = self.progress),
      });
      if (!reduce) {
        gsap.to("[data-scroll-out]", {
          yPercent: -40,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
      }

      return () => {
        stopReady();
        split.revert();
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root },
  );

  return (
    <section
      id="home"
      ref={root}
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-4 pt-28 pb-10 md:px-10"
    >
      {/* Background: WebGL scene, or a static glow + serif word as fallback */}
      <div className="absolute inset-0" data-cursor="Hi!">
        {enable3D ? (
          <>
            {/* Glow placeholder until the WebGL scene mounts */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,var(--color-violet-deep),transparent_60%)]"
            />
            {mount3D && <HeroScene state={state} active={inView} />}
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,var(--color-violet-deep),transparent_60%)]"
            />
            <p
              aria-hidden
              className="absolute inset-0 flex items-center justify-center font-serif text-[28vw] text-violet-soft/25 italic select-none md:text-[18vw]"
            >
              hello
            </p>
          </>
        )}
        {/* Soft fade into the next section */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink"
        />
      </div>

      {/* Copy layers — pointer events only on interactive bits so the scene gets the cursor */}
      <div data-scroll-out className="pointer-events-none relative ml-auto max-w-sm text-right">
        <div data-depth="-18">
          <div data-fade className="mb-4 flex justify-end">
            <Avatar size={56} />
          </div>
          <p data-fade className="font-display text-2xl leading-8 font-bold tracking-[-0.03em]">
            Hi, I&apos;m {profile.displayName}
            <br />
            {profile.role}.
          </p>
          <p data-fade className="mt-3 text-sm text-stone">
            {profile.tagline}
          </p>
        </div>
      </div>

      <div
        data-scroll-out
        className="pointer-events-none relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
      >
        <div data-depth="24">
          <h1
            data-split
            className="font-display text-[clamp(2.5rem,5.2vw,5.75rem)] leading-[0.92] font-bold tracking-[-0.03em] uppercase"
          >
            Building software
            <br />
            with a designer&apos;s soul
          </h1>
        </div>
        <div data-depth="-10" className="shrink-0">
          <div data-fade className="pointer-events-auto flex gap-3">
            <a
              href={profile.cv}
              data-cursor="Download"
              download
              className="btn-text rounded-full bg-violet px-6 py-3 whitespace-nowrap text-ink transition-transform hover:scale-105"
            >
              Download CV
            </a>
            <a
              href="#projects"
              className="btn-text rounded-full border border-ink-3 bg-ink/40 px-6 py-3 whitespace-nowrap backdrop-blur-sm transition-colors hover:border-violet"
            >
              View work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
