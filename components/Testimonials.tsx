import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialSlider from "@/components/ui/TestimonialSlider";
import { testimonials } from "@/data/testimonials";
import type { Testimonial } from "@/data/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="flex w-[min(80vw,24rem)] shrink-0 flex-col rounded-3xl border border-ink-3 bg-ink-2 p-7 transition-colors hover:border-violet/60">
      <span aria-hidden className="font-serif text-5xl leading-none text-violet">
        “
      </span>
      <blockquote className="mt-2 flex-1 font-serif text-xl leading-snug italic">{t.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatar} alt="" className="size-10 rounded-full object-cover" />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-violet/20 font-display text-sm font-bold text-violet-soft">
            {initials(t.name)}
          </span>
        )}
        <span>
          <span className="block font-display font-bold">{t.name}</span>
          <span className="block text-xs text-stone">{t.relation}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Testimonials as a slow slideshow with a step player under it: it plays on its own,
 * can be paused, or a dot jumps to one testimonial.
 */
export default function Testimonials() {
  return (
    <section id="testimonials" className="overflow-hidden py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-10">
        <SectionHeading title="Kind words" kicker="(04)" meta={`(${String(testimonials.length).padStart(2, "0")})`} />
      </div>

      <TestimonialSlider>
        {testimonials.map((t, i) => (
          <Card key={i} t={t} />
        ))}
      </TestimonialSlider>
    </section>
  );
}
