"use client";

import { useT } from "@/lib/i18n";

/** Keyboard users can jump straight past the navbar. */
export default function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main-content"
      className="btn-text fixed top-3 left-3 z-[110] -translate-y-20 rounded-full bg-violet-bright px-4 py-2 text-on-accent transition-transform focus:translate-y-0"
    >
      {t.skip}
    </a>
  );
}
