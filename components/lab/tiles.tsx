import { profile, socials } from "@/data/profile";

export type AppId = "terminal" | "paint" | "shader" | "filters" | "food";

export type Tile =
  | { kind: "app"; app: AppId; title: string; hint: string }
  | { kind: "link"; title: string; href: string; external?: boolean; hint: string }
  | { kind: "quote"; text: string }
  | { kind: "soon"; title: string; hint: string }
  | { kind: "word"; text: string };

const github = socials.find((s) => s.label === "GitHub")?.href ?? "https://github.com/";
const linkedin = socials.find((s) => s.label === "LinkedIn")?.href ?? "https://www.linkedin.com/";

/** The tiles repeated across the infinite canvas. Order matters: it sets the pattern. */
export const TILES: Tile[] = [
  { kind: "app", app: "terminal", title: "Terminal", hint: "Ask me things in a shell" },
  { kind: "quote", text: profile.manifesto },
  { kind: "link", title: "Selected work", href: "/#projects", hint: "Back to the projects" },
  { kind: "app", app: "shader", title: "Shader playground", hint: "Pick your color, tune the grid" },
  { kind: "word", text: "hola" },
  { kind: "app", app: "paint", title: "Pixel Paint", hint: "Draw 32×32 pixel art" },
  { kind: "link", title: "GitHub", href: github, external: true, hint: "Code & experiments" },
  { kind: "app", app: "filters", title: "Photo filters", hint: "Pixelate, dither & ASCII your photos" },
  { kind: "app", app: "food", title: "Food", hint: "Pack a Colombian snack basket" },
  { kind: "link", title: "LinkedIn", href: linkedin, external: true, hint: "Let's connect" },
  { kind: "link", title: "Say hi", href: "/#contact", hint: "Contact form" },
];
