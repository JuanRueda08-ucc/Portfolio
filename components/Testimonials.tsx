import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Kind words" kicker="(04)" />
        <ul className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <li key={i} className="flex flex-col rounded-3xl border border-ink-3 bg-ink-2 p-6">
              <p className="flex-1 font-serif text-xl leading-snug italic">“{t.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-violet/20 font-display text-sm font-bold text-violet-soft">
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-display font-bold">{t.name}</p>
                  <p className="text-xs text-stone">{t.relation}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
