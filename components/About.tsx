import SectionHeading from "@/components/ui/SectionHeading";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";

// Phase 3: scrambling-letters phrase + photo drawn with lines revealed by the cursor.
export default function About() {
  const facts = [
    { k: "Based in", v: profile.city },
    { k: "Studying", v: profile.career },
    { k: "Currently", v: profile.semester },
  ];
  const tech = skills.flatMap((g) => g.items);

  return (
    <section id="about" className="px-4 py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="About me" kicker="(02)" />
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div className="aspect-[4/5] rounded-3xl border border-ink-3 bg-ink-2" aria-label="Photo (coming soon)" />
          <div>
            <p className="text-xl leading-relaxed md:text-2xl">{profile.about}</p>

            <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.k} className="rounded-2xl border border-ink-3 p-4">
                  <dt className="font-mono text-xs text-stone uppercase">{f.k}</dt>
                  <dd className="mt-1 font-display font-semibold">{f.v}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-8 flex flex-wrap gap-2">
              {tech.map((t) => (
                <li key={t} className="rounded-full bg-violet/15 px-3 py-1 font-mono text-xs text-violet-soft">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
