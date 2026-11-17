import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center"
      style={{
        backgroundImage: "radial-gradient(circle, var(--color-ink-3) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <p className="label text-violet-soft">(404)</p>
      <h1 className="font-display text-[clamp(4rem,14vw,11rem)] leading-none font-bold tracking-tight">
        L<span className="inline-block h-[0.74em] w-[1.6em] rounded-full border-[0.1em] border-violet align-[-0.05em]" />ST
      </h1>
      <p className="max-w-sm text-stone">This page wandered off. Let&apos;s get you back somewhere magical.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-text rounded-full bg-violet px-6 py-3 text-on-accent">
          Back home
        </Link>
        <Link href="/lab" className="btn-text rounded-full border border-ink-3 px-6 py-3 hover:border-violet">
          Visit the lab
        </Link>
      </div>
    </main>
  );
}
