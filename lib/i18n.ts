/**
 * Visitor-chosen language (English / Spanish), same pattern as lib/theme.ts.
 *
 * Source of truth is `<html lang>` plus localStorage, so every chunk/module copy sees
 * the same value. An inline script in the layout sets `lang` before first paint (saved
 * choice, else the browser language). The server always renders English; on hydration
 * `useLang()` switches to the saved language — the LOADING screen covers that swap.
 *
 * Text that GSAP splits or scrambles (SplitText, ScrambleWords) must be remounted on a
 * language change: key those elements by `lang` (see SplitReveal, Hero, About).
 */
import { useSyncExternalStore } from "react";
import { LANG_KEY } from "./lang-script";
import { messages, type Messages } from "./messages";

export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];
export const LANG_EVENT = "langchange";

export function currentLang(): Lang {
  if (typeof document === "undefined") return "en";
  return document.documentElement.lang === "es" ? "es" : "en";
}

export function setLang(lang: Lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* private mode / blocked storage */
  }
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
}

function subscribeLang(cb: () => void) {
  window.addEventListener(LANG_EVENT, cb);
  return () => window.removeEventListener(LANG_EVENT, cb);
}

/** Current language; "en" on the server and during hydration. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribeLang, currentLang, () => "en");
}

/** UI strings for the current language. */
export function useT(): Messages {
  return messages[useLang()];
}

/**
 * Content items keep English as their main fields and Spanish in an optional `es`
 * object with the same keys (see data/*.ts). `localize` merges the right one.
 */
export function localize<T extends { es?: object }>(item: T, lang: Lang): T {
  return lang === "es" && item.es ? { ...item, ...item.es } : item;
}

