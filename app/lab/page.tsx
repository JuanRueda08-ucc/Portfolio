import type { Metadata } from "next";
import Link from "next/link";
import LabCanvas from "@/components/lab/LabCanvas";
import PageTransition from "@/components/PageTransition";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `Lab — ${profile.displayName}`,
  description: "Experiments and mini-apps: a terminal, a pixel-art editor and more on an infinite canvas.",
};

export default function LabPage() {
  return (
    <PageTransition>
      {/* h-svh so the page has a real box for the view-transition snapshot (children are fixed) */}
      <main className="h-svh overflow-hidden">
        <h1 className="sr-only">Lab — experiments by {profile.displayName}</h1>
        <LabCanvas />

        {/* Floating top bar */}
        <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-4 md:px-6">
          <Link
            href="/"
            transitionTypes={["page-card"]}
            data-cursor="Home"
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-ink-3 bg-ink/70 py-2 pr-4 pl-3 backdrop-blur-md"
          >
            <span aria-hidden>←</span>
            <span className="font-display text-lg font-bold tracking-tight">
              {profile.displayName.split(" ")[0]}
              <span className="text-violet">.</span>
            </span>
          </Link>
          <p className="label pointer-events-auto rounded-full border border-ink-3 bg-ink/70 px-4 py-2.5 text-violet-soft backdrop-blur-md">
            (Lab) · experiments
          </p>
        </header>
      </main>
    </PageTransition>
  );
}
