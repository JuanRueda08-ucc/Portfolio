import SectionHeading from "@/components/ui/SectionHeading";
import { projects } from "@/data/projects";

// Phase 4: featured section with monitor + video, and arc carousel.
export default function Projects() {
  return (
    <section id="projects" className="px-4 py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Selected work"
          kicker="(03)"
          meta={`(${String(projects.length).padStart(2, "0")})`}
        />
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug} className="group flex flex-col overflow-hidden rounded-3xl border border-ink-3 bg-ink-2">
              <div className="aspect-video bg-gradient-to-br from-violet-deep to-ink" />
              <div className="flex flex-1 flex-col p-6">
                <p className="font-mono text-xs text-stone">{p.year}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-stone">{p.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li key={t} className="rounded-full bg-violet/15 px-2.5 py-0.5 font-mono text-[11px] text-violet-soft">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-2">
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-ink-3 px-4 py-2 text-xs font-semibold hover:border-violet"
                  >
                    GitHub ↗
                  </a>
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-violet px-4 py-2 text-xs font-semibold text-ink"
                  >
                    Live demo ↗
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
