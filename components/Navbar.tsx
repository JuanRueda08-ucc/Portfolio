"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks, profile } from "@/data/profile";
import { ThemeToggle } from "@/components/ui/ThemeControls";
import LangToggle from "@/components/ui/LangToggle";
import { useT } from "@/lib/i18n";
import { onReady } from "@/lib/ready";

const EASE = [0.16, 1, 0.3, 1] as const;
type SectionId = (typeof navLinks)[number]["id"];

/** Tracks which nav section is crossing the middle of the viewport. */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>("home");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navLinks.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const active = useActiveSection();
  const lenis = useLenis();
  const t = useT();

  // Slide in once the loader is gone.
  useEffect(() => onReady(() => setShown(true)), []);

  // Lock scroll and listen for Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6"
      initial={{ y: "-120%" }}
      animate={{ y: shown ? 0 : "-120%" }}
      transition={{ duration: 1, ease: EASE, delay: 0.2 }}
    >
      <nav
        aria-label="Main"
        className="relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink-3 bg-ink/70 py-2 pr-2 pl-5 backdrop-blur-md"
      >
        <a href="#home" data-cursor={t.cursor.home} className="font-display text-lg font-bold tracking-tight">
          {profile.displayName.split(" ")[0]}
          <span className="text-violet">.</span>
        </a>

        {/* Desktop links with a pill that slides to the active section */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <li key={l.id} className="relative">
              {active === l.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-ink-2"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? "location" : undefined}
                className={`relative block rounded-full px-2 py-1.5 text-sm whitespace-nowrap lg:px-3 transition-colors ${
                  active === l.id ? "text-cream" : "text-stone hover:text-cream"
                }`}
              >
                {t.nav[l.id]}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/lab"
              transitionTypes={["page-card"]}
              data-cursor={t.cursor.play}
              className="block rounded-full px-2 py-1.5 text-sm whitespace-nowrap text-violet-soft lg:px-3 transition-colors hover:text-violet-bright"
            >
              Lab ✦
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <a
            href={profile.cv}
            data-cursor={t.cursor.download}
            download
            className="btn-text rounded-full bg-violet px-4 py-2 text-on-accent transition-transform hover:scale-105"
          >
            CV ↓
          </a>

          {/* Hamburger button (mobile) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.menuClose : t.menuOpen}
            className="flex size-9 flex-col items-center justify-center gap-1.5 rounded-full bg-ink-2 md:hidden"
          >
            <span
              className={`h-px w-4 bg-cream transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-4 bg-cream transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Full-screen menu (mobile): circular reveal + staggered links */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 flex flex-col justify-between bg-ink px-6 pt-32 pb-8 md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ul className="space-y-2">
              {navLinks.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <motion.a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className={`block font-display text-5xl font-bold tracking-tight uppercase ${
                      active === l.id ? "text-violet" : ""
                    }`}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.05 }}
                  >
                    {t.nav[l.id]}
                  </motion.a>
                </li>
              ))}
              <li className="overflow-hidden">
                <motion.div
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "110%" }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.15 + navLinks.length * 0.05 }}
                >
                  <Link
                    href="/lab"
                    transitionTypes={["page-card"]}
                    onClick={() => setOpen(false)}
                    className="block font-display text-5xl font-bold tracking-tight text-violet-soft uppercase"
                  >
                    Lab ✦
                  </Link>
                </motion.div>
              </li>
            </ul>
            <motion.p
              className="label text-stone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              {profile.city} · {profile.email}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
