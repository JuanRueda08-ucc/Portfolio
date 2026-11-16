"use client";

import { useState } from "react";
import { navLinks, profile } from "@/data/profile";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink-3 bg-ink/70 py-2 pr-2 pl-5 backdrop-blur-md"
      >
        <a href="#home" className="font-display text-lg font-bold tracking-tight">
          {profile.displayName.split(" ")[0]}
          <span className="text-violet">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className="rounded-full px-3 py-1.5 text-sm text-stone transition-colors hover:bg-ink-2 hover:text-cream"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={profile.cv}
            download
            className="rounded-full bg-violet px-4 py-2 btn-text text-ink transition-transform hover:scale-105"
          >
            CV ↓
          </a>

          {/* Hamburger button (mobile) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-9 flex-col items-center justify-center gap-1.5 rounded-full bg-ink-2 md:hidden"
          >
            <span
              className={`h-px w-4 bg-cream transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-4 bg-cream transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Full-screen menu (mobile) */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 -z-10 flex flex-col justify-center bg-ink px-8 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="space-y-4">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="font-display text-5xl font-bold tracking-tight"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
