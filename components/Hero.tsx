import { profile } from "@/data/profile";

// Phase 2: 3D glass "hello" + cursor-reactive grid shader + parallax go here.
export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-4 pt-28 pb-10 md:px-10"
    >
      {/* Purple glow (temporary until the shader lands) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,var(--color-violet-deep),transparent_60%)]"
      />

      <div className="relative ml-auto max-w-xs text-right">
        <p className="font-display text-xl font-bold">
          Hi, I&apos;m {profile.displayName}
          <br />
          {profile.role}.
        </p>
        <p className="mt-3 text-sm text-stone">{profile.tagline}</p>
      </div>

      <p
        aria-hidden
        data-cursor="Hi!"
        className="relative self-center font-serif text-[28vw] leading-none text-violet-soft/20 italic select-none md:text-[18vw]"
      >
        hello
      </p>

      <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <h1 className="font-display text-5xl leading-[0.95] font-bold tracking-tight uppercase md:text-7xl">
          Building software
          <br />
          with a designer&apos;s soul
        </h1>
        <div className="flex shrink-0 gap-3">
          <a
            href={profile.cv}
            data-cursor="Download"
            download
            className="rounded-full bg-violet px-6 py-3 btn-text whitespace-nowrap text-ink transition-transform hover:scale-105"
          >
            Download CV
          </a>
          <a
            href="#projects"
            className="rounded-full border border-ink-3 px-6 py-3 btn-text whitespace-nowrap transition-colors hover:border-violet"
          >
            View work
          </a>
        </div>
      </div>
    </section>
  );
}
