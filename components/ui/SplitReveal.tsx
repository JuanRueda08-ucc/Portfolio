"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ElementType, type ReactNode } from "react";
import { useLang } from "@/lib/i18n";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Delay in seconds after the element enters the viewport. */
  delay?: number;
};

/** Reveals its text line by line (masked slide-up) when it scrolls into view. */
export default function SplitReveal({ as: Tag = "h2", className, children, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);
  // New language = new text: remount the element (SplitText rewrote its DOM) and split again.
  const lang = useLang();

  useGSAP(
    () => {
      if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const split = SplitText.create(ref.current, { type: "lines", mask: "lines" });
      // Room above each masked line so Spanish capitals keep their accents (Á, Ñ).
      gsap.set(split.masks, { paddingTop: "0.16em", marginTop: "-0.16em" });
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        delay,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [lang], revertOnUpdate: true },
  );

  return (
    <Tag key={lang} ref={ref} className={className}>
      {children}
    </Tag>
  );
}
