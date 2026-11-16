import SectionHeading from "@/components/ui/SectionHeading";
import { skills } from "@/data/skills";

// Extra section. Phase 3: staggered rising cards with GSAP.
export default function Skills() {
  return (
    <section id="skills" className="px-4 py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Skills & tools" kicker="(06)" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s, i) => (
            <li key={s.title} className="flex min-h-80 flex-col rounded-2xl bg-violet p-6 text-ink">
              <span className="font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
              <div className="mt-auto">
                <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
                <p className="font-display text-lg">{s.subtitle}</p>
                <p className="mt-3 text-sm">{s.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
