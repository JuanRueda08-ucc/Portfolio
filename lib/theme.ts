/**
 * Visitor-customizable theme: light/dark mode, accent hue and hero-grid settings.
 *
 * Source of truth is `<html>` (data-theme + CSS variables) plus a JSON blob in
 * localStorage, so every chunk/module copy sees the same state (see AGENTS.md:
 * Turbopack may duplicate modules). An inline script in the layout applies the
 * saved theme before first paint (THEME_INIT_SCRIPT).
 */

export type Mode = "dark" | "light";

export type Theme = {
  mode: Mode;
  /** Accent hue 0–360. 269 = the original purple from the reference. */
  hue: number;
  /** Hero grid: tile size in px. */
  cell: number;
  /** Hero grid: glow intensity multiplier. */
  glow: number;
  /** Hero grid: animation speed multiplier. */
  speed: number;
};

export const DEFAULT_THEME: Theme = { mode: "dark", hue: 269, cell: 34, glow: 1, speed: 1 };
export const STORAGE_KEY = "juano-theme";
export const THEME_EVENT = "themechange";

export const ACCENT_PRESETS: { name: string; hue: number }[] = [
  { name: "Violet", hue: 269 },
  { name: "Pink", hue: 325 },
  { name: "Ember", hue: 18 },
  { name: "Lime", hue: 95 },
  { name: "Mint", hue: 160 },
  { name: "Sky", hue: 205 },
];

/** Accent palette derived from a hue. Matches the original purples at hue 269. */
export function accentVars(hue: number, mode: Mode): Record<string, string> {
  const h = Math.round(hue);
  return mode === "dark"
    ? {
        "--color-violet": `hsl(${h} 72% 63%)`,
        "--color-violet-bright": `hsl(${h + 6} 100% 71%)`,
        "--color-violet-soft": `hsl(${h - 7} 100% 82%)`,
        "--color-violet-deep": `hsl(${h - 6} 62% 27%)`,
      }
    : {
        "--color-violet": `hsl(${h} 62% 60%)`,
        "--color-violet-bright": `hsl(${h + 6} 80% 66%)`,
        "--color-violet-soft": `hsl(${h - 7} 55% 40%)`,
        "--color-violet-deep": `hsl(${h - 6} 85% 88%)`,
      };
}

export function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    /* private mode / blocked storage */
  }
  return DEFAULT_THEME;
}

/** Applies a theme to <html>, persists it and notifies listeners. */
export function applyTheme(next: Partial<Theme>) {
  const theme = { ...currentTheme(), ...next };
  const root = document.documentElement;
  root.dataset.theme = theme.mode;
  root.style.colorScheme = theme.mode;
  for (const [k, v] of Object.entries(accentVars(theme.hue, theme.mode))) root.style.setProperty(k, v);
  (window as unknown as { __theme: Theme }).__theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.mode === "dark" ? "#0b0a09" : "#f4efe8");
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

/** Current theme (shared across module copies through `window.__theme`). */
export function currentTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const w = window as unknown as { __theme?: Theme };
  return w.__theme ?? (w.__theme = readTheme());
}

export function subscribeTheme(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
}

let probe: CanvasRenderingContext2D | null = null;

/** Resolves a CSS color variable (hex, hsl(), …) to a "#rrggbb" string for canvas/WebGL. */
export function cssColor(name: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  probe ??= document.createElement("canvas").getContext("2d");
  if (!probe || !raw) return raw || "#000000";
  probe.fillStyle = "#000000";
  probe.fillStyle = raw; // the browser normalizes any valid color to #rrggbb
  return probe.fillStyle as string;
}

/** Same as cssColor but as [r, g, b] in 0..1 (for GLSL uniforms). */
export function cssRgb(name: string): [number, number, number] {
  const hex = cssColor(name).replace("#", "");
  const n = parseInt(hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Inline script for <head>: applies the saved mode + accent before first paint.
 * Kept dependency-free and tiny; mirrors `accentVars`.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"null");if(!t)return;var r=document.documentElement,m=t.mode==="light"?"light":"dark",h=Math.round(t.hue==null?269:t.hue);r.dataset.theme=m;r.style.colorScheme=m;var v=m==="dark"?[[h,72,63],[h+6,100,71],[h-7,100,82],[h-6,62,27]]:[[h,62,60],[h+6,80,66],[h-7,55,40],[h-6,85,88]];["--color-violet","--color-violet-bright","--color-violet-soft","--color-violet-deep"].forEach(function(k,i){r.style.setProperty(k,"hsl("+v[i][0]+" "+v[i][1]+"% "+v[i][2]+"%)")})}catch(e){}})();`;
