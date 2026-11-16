import type { Project } from "@/data/types";

type Props = {
  project: Project;
  className?: string;
  /** Load the video eagerly (featured screen) instead of on demand. */
  eager?: boolean;
};

/**
 * Project visual: autoplaying muted video if there is one, else the image,
 * else a generated cover (gradient + pixel grid + title) so placeholders
 * still look intentional.
 */
export default function ProjectMedia({ project, className = "", eager = false }: Props) {
  if (project.video) {
    return (
      <video
        className={`size-full object-cover ${className}`}
        src={project.video}
        poster={project.image}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        aria-label={`${project.title} preview`}
      />
    );
  }

  if (project.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.image}
        alt={`${project.title} screenshot`}
        loading={eager ? "eager" : "lazy"}
        className={`size-full object-cover ${className}`}
      />
    );
  }

  const h = project.hue ?? 268;
  return (
    <div
      role="img"
      aria-label={`${project.title} cover`}
      className={`relative flex size-full items-end overflow-hidden p-5 ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 110%, hsl(${h} 85% 62%), transparent 60%),
                     radial-gradient(90% 80% at 100% 0%, hsl(${(h + 40) % 360} 70% 35%), transparent 70%),
                     hsl(${h} 30% 10%)`,
      }}
    >
      {/* Pixel grid overlay */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.25) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <span className="relative font-display text-[clamp(1.5rem,4vw,3rem)] leading-none font-bold tracking-tight text-cream uppercase">
        {project.title}
      </span>
    </div>
  );
}
