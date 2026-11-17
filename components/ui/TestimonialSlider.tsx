"use client";

import { Children, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { StepPlayer } from "@/components/ui/StepPlayer";

/**
 * The testimonials as a slow slideshow driven by <StepPlayer>: it glides on its own
 * (play), can be paused, or a dot picks a testimonial directly. The active card sits
 * in the middle of the row; its neighbours peek in, dimmed.
 */
export default function TestimonialSlider({ children, pace = 6 }: { children: ReactNode; pace?: number }) {
  const items = Children.toArray(children);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  const onStep = useCallback((i: number) => setAt(i), []);
  // Off screen the player holds its step instead of running a loop for nobody.
  const [inView, setInView] = useState(false);
  useLayoutEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(viewport.current!);
    return () => io.disconnect();
  }, []);

  // Center the active card (DOM write only, measured from the real layout).
  useLayoutEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const place = () => {
      const card = tr.children[at] as HTMLElement | undefined;
      if (!card) return;
      const x = vp.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
      tr.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [at]);

  return (
    <div data-stroke="on">
      <div
        ref={viewport}
        className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <ul
          ref={track}
          aria-live="polite"
          className="flex w-max gap-6 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        >
          {items.map((item, i) => (
            <li
              key={i}
              aria-hidden={i !== at}
              className={`transition-opacity duration-700 ${i === at ? "opacity-100" : "opacity-35"}`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex justify-center">
        <StepPlayer steps={items.length} pace={pace} autoPlay loop onStep={onStep} hold={!inView} label="Testimonial" />
      </div>
    </div>
  );
}
