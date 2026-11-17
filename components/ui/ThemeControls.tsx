"use client";

import { useSyncExternalStore } from "react";
import { ACCENT_PRESETS, applyTheme, currentTheme, DEFAULT_THEME, subscribeTheme } from "@/lib/theme";

const getMode = () => currentTheme().mode;
const getHue = () => currentTheme().hue;

/** Light/dark switch (sun ↔ moon). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const mode = useSyncExternalStore(subscribeTheme, getMode, () => DEFAULT_THEME.mode);
  const next = mode === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => applyTheme({ mode: next })}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      data-cursor={next === "light" ? "Light" : "Dark"}
      className={`flex size-9 items-center justify-center rounded-full bg-ink-2 text-cream transition-transform hover:scale-110 ${className}`}
    >
      {mode === "dark" ? (
        // Sun
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Moon
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

/** Row of accent presets (the full picker lives in the Lab's Shader Playground). */
export function AccentSwatches({ className = "" }: { className?: string }) {
  const hue = useSyncExternalStore(subscribeTheme, getHue, () => DEFAULT_THEME.hue);
  return (
    <div role="radiogroup" aria-label="Accent color" className={`flex gap-2 ${className}`}>
      {ACCENT_PRESETS.map((p) => (
        <button
          key={p.name}
          type="button"
          role="radio"
          aria-checked={Math.abs(hue - p.hue) < 1}
          aria-label={p.name}
          title={p.name}
          onClick={() => applyTheme({ hue: p.hue })}
          className={`size-6 rounded-full transition-transform hover:scale-110 ${
            Math.abs(hue - p.hue) < 1 ? "ring-2 ring-cream ring-offset-2 ring-offset-ink" : ""
          }`}
          style={{ background: `hsl(${p.hue} 72% 63%)` }}
        />
      ))}
    </div>
  );
}
