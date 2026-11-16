"use client";

import { useSyncExternalStore } from "react";
import { useLenis } from "lenis/react";
import Link from "next/link";
import PixelField from "@/components/ui/PixelField";
import { navLinks, profile, socials } from "@/data/profile";

// Live clock: null on the server, ticks every second in the browser.
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

function useClock(timeZone: string) {
  const seconds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (seconds === null) return { time: "--:--:--", date: "", year: "" };
  const now = new Date(seconds * 1000);
  return {
    time: now.toLocaleTimeString("en-US", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    date: now.toLocaleDateString("en-US", { timeZone, weekday: "long", day: "numeric", month: "short", year: "numeric" }),
    year: String(now.getFullYear()),
  };
}

export default function Footer() {
  const lenis = useLenis();
  const { time, date, year } = useClock(profile.timezone);

  return (
    <footer className="border-t border-ink-3 px-4 pt-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2">
          <ul className="space-y-1">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="font-display text-4xl font-bold tracking-tight hover:text-violet md:text-5xl">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/lab"
                transitionTypes={["page-card"]}
                data-cursor="Play"
                className="font-display text-4xl font-bold tracking-tight text-violet-soft hover:text-violet-bright md:text-5xl"
              >
                Lab ✦
              </Link>
            </li>
          </ul>
          <div className="space-y-4 md:text-right">
            <a href={`mailto:${profile.email}`} data-cursor="Say hi" className="block underline decoration-violet underline-offset-4">
              {profile.email}
            </a>
            <ul className="flex gap-4 md:justify-end">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-stone hover:text-cream">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 font-mono text-xs text-stone md:flex-row md:items-end md:justify-between">
          <p>
            {profile.city} · {time}
            <br />
            <span className="capitalize">{date}</span>
          </p>
          <button
            type="button"
            onClick={() => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
            className="self-start text-cream hover:text-violet md:self-auto"
          >
            Back to top ↑
          </button>
          <p>
            © {year} {profile.displayName} · Built with Next.js + Tailwind
          </p>
        </div>
      </div>

      {/* WebGL pixel terrain that reacts to the cursor (inspired by elicubillos.com) */}
      <PixelField className="-mx-4 mt-10 h-[38vh] min-h-56 w-[calc(100%+2rem)] md:-mx-10 md:w-[calc(100%+5rem)]" />
    </footer>
  );
}
