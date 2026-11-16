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
- Turbopack may instantiate a module once per chunk (layout vs page). Don't rely on module-level singletons for cross-component state; `lib/ready.ts` stores it on `<html data-app-ready>`.
- An animated `transform` on a parent breaks `position: fixed` children; the navbar's mobile menu works because Motion resets the header transform to `none` once it lands.

## Shared building blocks

- **`<Loader />`** (`components/Loader.tsx`) — LOADING screen; calls `markReady()` when it leaves.
- **`onReady(cb)`** (`lib/ready.ts`) — run intro animations after the loader.
- **`<Cursor />`** — custom cursor. Add `data-cursor="Label"` to any element to show a pill label on hover (e.g. `"View project"`, `"Hi!"`, `"Download"`).
- **`btn-text`** / **`label`** CSS utilities for button and meta text.

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
- [ ] **Phase 2** — hero: 3D glass "hello" + cursor-lit grid shader + parallax
- [ ] **Phase 3** — About (scramble text, line-drawn photo), Experience, Testimonials, Skills, Contact, Footer pixel background
- [ ] **Phase 4** — Projects: pinned featured section with videos + arc carousel
- [ ] **Phase 5** — `/lab` (infinite canvas, Terminal, Pixel Paint) + page transitions
- [ ] **Phase 6** — responsive, a11y, performance, course checklist
- [ ] **Phase 7** — final content (Harvard-style CV, testimonials, videos)

**Pending from the owner:** photo, current CV (to redo in Harvard format), project GitHub/Vercel links + videos, email/LinkedIn, real experience, 3 testimonials.

Keep this section up to date when a phase lands.
