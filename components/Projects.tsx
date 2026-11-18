"use client";

import ArcCarousel from "@/components/projects/ArcCarousel";
import FeaturedWork from "@/components/projects/FeaturedWork";
import ProjectMedia from "@/components/projects/ProjectMedia";
import SectionHeading from "@/components/ui/SectionHeading";
import { projects } from "@/data/projects";
import VideoButton from "@/components/projects/VideoButton";
import { localize, useLang, useT } from "@/lib/i18n";

/**
 * Projects:
 * - Desktop: pinned "Featured work" screen + "All work" arc carousel.
 * - Every size: responsive grid index (course requirement: 1 col mobile, 2–3 desktop),
 *   each card with GitHub + live demo links opening in a new tab.
 */
export default function Projects() {
  const lang = useLang();
  const t = useT();
  const list = projects.map((p) => localize(p, lang));
  const featured = list.filter((p) => p.featured);

  return (
    <section id="projects">
      {featured.length > 0 && <FeaturedWork projects={featured} />}
      {list.length > 2 && <ArcCarousel projects={list} />}

      <div className="px-4 py-32 md:px-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title={t.projects.index}
            kicker="(03)"
            meta={`(${String(list.length).padStart(2, "0")})`}
          />
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <li
                key={p.slug}
                className="group flex flex-col overflow-hidden rounded-3xl border border-ink-3 bg-ink-2 transition-colors hover:border-violet/60"
              >
                <a
                  href={p.demo ?? p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor={t.cursor.view}
                  tabIndex={-1}
                  className="block aspect-video overflow-hidden"
                >
                  <span className="block size-full transition-transform duration-700 ease-out group-hover:scale-105">
                    <ProjectMedia project={p} />
                  </span>
                </a>
                <div className="flex flex-1 flex-col p-6">
                  <p className="label text-stone">{p.year}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-stone">{p.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <li key={t} className="rounded-full bg-violet/15 px-2.5 py-0.5 font-mono text-[11px] text-violet-soft">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2 [&>*]:whitespace-nowrap">
                    <a
                      href={p.github}
                      data-cursor={t.cursor.code}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-text rounded-full border border-ink-3 px-4 py-2 hover:border-violet"
                    >
                      {t.projects.github}
                    </a>
                    <VideoButton project={p} />
                    {p.demo && (
                    <a
                      href={p.demo}
                      data-cursor="Live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-text rounded-full bg-violet px-4 py-2 text-on-accent"
                    >
                      Live demo ↗
                    </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
