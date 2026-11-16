<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project context — Juano Rueda's portfolio

Read this file first. It is the single source of truth for any AI agent (Claude, Cursor, Copilot, …) working on this repo, so context survives across sessions.

## Who / what

- **Owner:** Juano Rueda (Software Engineering, 5th semester, San Juan de Pasto, Colombia). Talks in **Spanish**.
- **Purpose:** personal portfolio graded in the university course *Diseño de Interfaces*.
- **Live:** deployed on Vercel from `main` (every push redeploys). Repo: `github.com/JuanRueda08-ucc/Portfolio`.

## Hard rules

1. **Language:** all site copy, code, comments and commits in **English**. Chat with the owner in **Spanish**. Planning docs in `docs/` are in Spanish.
2. **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `style:`, `refactor:`, `perf:`, `docs:`, `chore:`, `test:`. One commit per logical change, imperative mood, English.
3. **Required stack (course):** Next.js (App Router) + TypeScript + Tailwind CSS, hosted on GitHub + Vercel. Extra libraries are allowed.
4. **Required sections, in this order:** Navbar → Hero (with **Download CV** button) → About → Projects (each with **GitHub** + **live demo** links) → Testimonials (**≥ 3**) → Experience (**education + work**) → Contact (form with validation + confirmation) → Footer (name + © year, socials, quick links, back to top, credits). Plus **≥ 1 extra section** before the footer. Full checklist: [`docs/requisitos-profesor.md`](docs/requisitos-profesor.md).
5. **Must be responsive** (mobile hamburger menu) and respect `prefers-reduced-motion`.
6. **Original, not a clone:** we take patterns from references, but never copy their content, images or code.

## Design references (what we take from each)

Full analysis and roadmap: [`docs/plan.md`](docs/plan.md).

| Site | What we take |
|---|---|
| **elicubillos.com** (main reference) | Overall look: dark bg, purple accent, typography, "LOADING" loader where the **O stretches** into a progress bar, 3D glass word over a cursor-lit grid (Three.js), mouse parallax on all text, Lenis + ScrollTrigger scroll, pinned "Featured Work" with retro screen, arc carousel, staggered purple skill cards, footer with live clock + WebGL pixel background |
| **kiira.in** | **Custom cursor**: small circle that morphs into a label ("View project", "Hi") on hover; **draggable objects** |
| **evebouffard.com** | "Explorations" sidebar with real mini-apps (Paint, paper filters, WebGL) → our `/lab` |
| **andreas.vision** | Page transitions (page shrinks into a card over a pixel sky), infinite draggable "Play" canvas, floating pill navbar |
| **elissamartial.com** | Words scattered on screen whose letters randomly **scramble**; image drawn with fine lines revealed around the cursor |

## Design tokens (`app/globals.css`)

- **Colors:** `ink #0b0a09` (bg), `ink-2 #1c1714`, `ink-3 #2a2420`, `cream #f3eadf` (text), `stone #a39a90`, `violet #9b5de5` and `violet-bright #c06dff` (exact values from elicubillos.com), `violet-soft`, `violet-deep`.
- **Fonts (copied from references):**
  - `font-sans` / `font-display` → `"Helvetica Neue", Helvetica, Arial` (elicubillos main stack; renders as **Arial on Windows**). Headings: bold, tight tracking, often uppercase.
  - `font-card` → **Outfit** 400/600 (elicubillos skill cards).
  - `font-ui` → **Figtree** 600 (elicubillos buttons). Use the `btn-text` utility.
  - `font-serif` → **Newsreader** italic (andreas.vision accents).
  - `font-mono` → **Geist Mono** (tags, dates).
  - `label` utility → 11px uppercase meta text like `( 01 / 04 )`.

## Stack

Next.js 16 (App Router, `cacheComponents`) · React 19.3 (built-in `<ViewTransition>`) · TypeScript · Tailwind v4 · GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText — all free) · Lenis 1.3 (`lenis/react`, driven by the GSAP ticker) · Three.js + @react-three/fiber + drei · Motion 14 · Formspree (`NEXT_PUBLIC_FORMSPREE_ID`).

Gotchas found so far:
- Next 16 + `cacheComponents` forbids `new Date()` during prerender, even in client components → use `useSyncExternalStore` with a `null` server snapshot (see `components/Footer.tsx`).
- ESLint `react-hooks/set-state-in-effect` is on: don't `setState` synchronously inside `useEffect`.
- React Compiler lint (`react-hooks/immutability`) forbids mutating values returned by hooks (e.g. a `useMemo` material's uniforms) inside `useFrame`; mutate through a mesh ref instead (see `GridBackground`).
- Don't use ScrollTrigger `snap` — it fights Lenis and can jump the page back.
- `scale`/`rotate` share `transform-origin`. When an element rotates around a far-away origin (arc carousel), apply `scale` on an inner element.
- In tests, `el.offsetTop` is relative to the offset parent; use `getBoundingClientRect().top + scrollY` for document position.
- Tailwind v4 drops hand-written CSS rules it doesn't recognise in some cases (a `[data-word]` media rule vanished). Prefer utilities with CSS vars, e.g. `md:left-(--x)`.
- Motion serializes transforms with different precision on server vs client → hydration mismatch. Round initial `rotate`/`x` values (see `Stickers.tsx`).
- Turbopack may instantiate a module once per chunk (layout vs page). Don't rely on module-level singletons for cross-component state; `lib/ready.ts` stores it on `<html data-app-ready>`.
- An animated `transform` on a parent breaks `position: fixed` children; the navbar's mobile menu works because Motion resets the header transform to `none` once it lands.

## Shared building blocks

- **`<Loader />`** (`components/Loader.tsx`) — LOADING screen; calls `markReady()` when it leaves.
- **`onReady(cb)`** (`lib/ready.ts`) — run intro animations after the loader.
- **`<Cursor />`** — custom cursor. Add `data-cursor="Label"` to any element to show a pill label on hover (e.g. `"View project"`, `"Hi!"`, `"Download"`).
- **`btn-text`** / **`label`** CSS utilities for button and meta text.
- **Hero 3D** (`components/hero/`) — `HeroScene.tsx` (R3F canvas: grid plane + glass `Text3D`), `gridMaterial.ts` (GLSL grid shader). The DOM writes pointer/scroll/intro into a shared `HeroState` ref; the scene reads it every frame. Loaded with `next/dynamic` (`ssr: false`); static fallback without WebGL or with reduced motion.
- **`data-depth="N"`** inside the hero — mouse parallax offset in px (negative = opposite direction). **`data-split`** — SplitText line reveal. **`data-fade`** — intro fade. **`data-scroll-out`** — fades up on scroll.
- **`<SplitReveal as="h2">`** (`components/ui/`) — masked line-by-line reveal on scroll. `SectionHeading` uses it.
- **`<ScrambleWords words positions>`** — Elissa-style scattered words with randomly flickering letters (inline flow below `md`).
- **`<LineDrawing src fallbackText>`** — draws an image with contour lines around the cursor, self-draws when idle. Uses `profile.photo`; falls back to the initials until a photo exists.
- **`<Stickers items>`** — draggable tech chips (Motion `drag`), `data-cursor="Drag"`.
- **`<PixelField>`** — raw WebGL2 pixel terrain (footer). Pattern to copy for any light full-screen shader without three.js.
- **Marquee** — `animate-marquee` utility (defined in `@theme`), pause with `group-hover:[animation-play-state:paused]`.
- **Projects** (`components/projects/`) — `ProjectMedia` (video → image → generated gradient cover using `project.hue`), `FeaturedWork` (pinned retro window for `featured: true`, desktop only), `ArcCarousel` (cards on a big wheel turned by scroll, desktop only). The responsive grid in `Projects.tsx` is always rendered — it's the course's "1 col mobile / 2–3 desktop" requirement, don't remove it.
- **3D fonts** — `npm run typeface` converts a font to `public/fonts/*.typeface.json` (script: `scripts/build-typeface.mjs`). Current: Pacifico (OFL).

## Verifying in the Claude browser pane

A hidden browser pane pauses `requestAnimationFrame`, so GSAP/the loader freeze and screenshots come out black. Show the pane before checking animations. Dev mode compiles three.js slowly; use the `portfolio-prod` launch config (`npm run build` first, port 3001) to judge real load timing.

## Code layout

```
app/                 layout.tsx (fonts, providers), page.tsx (section order), globals.css (tokens)
components/          one component per section + ui/ (shared) + providers/ (SmoothScroll, Cursor…)
data/                ALL content lives here, typed (profile, projects, testimonials, experience, skills)
docs/                requisitos-profesor.md, plan.md (Spanish)
public/              cv.pdf, images/, videos/
```

To change content, edit `data/*.ts` only. Placeholders are marked `TODO(Juano)`.

## Roadmap / status

- [x] **Phase 0** — scaffold, tokens, base sections, GitHub + Vercel
- [x] **Phase 1** — fonts from references, loader, custom cursor, navbar motion
- [x] **Phase 2** — hero: 3D glass "hello" + cursor-lit grid shader + parallax
- [x] **Phase 3** — About (scramble text, line-drawn photo, draggable stickers), Experience (both timelines visible), Testimonials (marquee), Skills (rising cards), Contact reveal, Footer pixel background
- [x] **Phase 4** — Projects: pinned featured section with videos + arc carousel + responsive grid (placeholder projects until real ones arrive)
- [ ] **Phase 5** — `/lab` (infinite canvas, Terminal, Pixel Paint) + page transitions
- [ ] **Phase 6** — responsive, a11y, performance, course checklist
- [ ] **Phase 7** — final content (Harvard-style CV, testimonials, videos)

**Pending from the owner:** photo, current CV (to redo in Harvard format), project GitHub/Vercel links + videos, email/LinkedIn, real experience, 3 testimonials.

Keep this section up to date when a phase lands.
