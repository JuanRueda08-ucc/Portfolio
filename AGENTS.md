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
- `MeshTransmissionMaterial`, `Environment` and other PBR-heavy materials take ~1–2 s to compile on Windows (ANGLE → D3D) and freeze the first frame. If you use them, warm up with `gl.compileAsync` (see `<Warmup>`) and keep a light fallback for phones. To find such stalls: `npx lighthouse … --save-assets`, then look for a long `FireAnimationFrame` overlapping a long `GPUTask` in the trace.
- React Compiler lint (`react-hooks/immutability`) forbids mutating values returned by hooks (e.g. a `useMemo` material's uniforms) inside `useFrame`; mutate through a mesh ref instead (see `GridBackground`).
- Lab windows: only bump a window's z-index when it isn't already on top; the custom cursor lives on z 9999. (Bumping on every click once pushed windows above the cursor and "hid" it.)
- Turbopack dev sometimes keeps a stale CSS chunk after big `globals.css` edits (view-transition rules didn't appear). Verify CSS-heavy changes with `npm run build` + the `portfolio-prod` preview.
- `setPointerCapture` can throw (synthetic events); wrap it in try/catch so drawing logic still runs.
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
- **Hero 3D** (`components/hero/`) — `HeroScene.tsx` (R3F canvas: grid plane + glass `Text3D`), `gridMaterial.ts` (shared `grid(px)` GLSL used by the background and by a light procedural glass shader). **Two glass looks (owner's choice):** desktop = physical `MeshTransmissionMaterial` + `Environment` Lightformers (the look the owner prefers — don't replace it); phones/tablets/slow devices = the light procedural glass. `<Warmup>` runs `gl.compileAsync` and keeps `frameloop="never"` until shaders are ready, which cut the first-frame freeze from ~1 s to ~0.36 s on an Intel UHD 630. The DOM writes pointer/scroll/intro into a shared `HeroState` ref; the scene reads it every frame. Loaded with `next/dynamic` (`ssr: false`); static fallback without WebGL or with reduced motion.
- **`data-depth="N"`** inside the hero — mouse parallax offset in px (negative = opposite direction). **`data-split`** — SplitText line reveal. **`data-fade`** — intro fade. **`data-scroll-out`** — fades up on scroll.
- **`<SplitReveal as="h2">`** (`components/ui/`) — masked line-by-line reveal on scroll. `SectionHeading` uses it.
- **`<ScrambleWords words positions>`** — Elissa-style scattered words (inline flow below `md`). Rhythm measured on elissamartial.com — keep it: each word bursts about every 2.4–3.4 s, only 2–3 of its letters cycle a new glyph every 55 ms for 350–550 ms, max 2 words active at once. (A faster random flicker was rejected by the owner as unreadable.)
- **`<Generate>`** (`components/ui/Generate.tsx`) — vendored from bencho.dev (MIT; keep its comments): blank card + "Generate" pill, the picture forms through an SVG blur/contrast/ripple filter. Currently unused; its pill/counter CSS (`.gen-go`, `.gen-pct`) is reused by `<LogoReveal>`. Next 16 refuses `Math.random()` while prerendering, so its count curve starts straight and is rolled on each press.
- **`<LogoReveal>`** (About, **phones only**) — the SAME line drawing as desktop, not a picture of the logo (owner was explicit). It waits for a "Generate" press, then `LineDrawing` draws it quickly (`drawSignal`, `autoDraw={false}`, ~2.7 s, % counter). Once drawn the button never comes back, so nothing covers the logo. Desktop keeps the cursor drawing plus a "( Move your cursor over it to reveal the logo )" hint.
- **`<LineDrawing src trace fallbackText>`** — draws an image with contour lines around the cursor, self-draws when idle. In About it draws the owner's **JR logo** (`profile.logo`, `public/images/logo-jr.webp`) with `trace="light"` (ink = bright × low saturation, so the saturated blue background is ignored).
- **Logo** — `profile.logo` is the owner's chrome JR monogram. Used by the About line drawing and by `<Avatar>` (zoomed into a circle) until `profile.photo` exists.
- **`<Stickers items>`** — draggable tech chips (Motion `drag`), `data-cursor="Drag"`.
- **`<PixelField>`** — raw WebGL2 pixel terrain (footer). Pattern to copy for any light full-screen shader without three.js.
- **Marquee** — `animate-marquee` utility (defined in `@theme`), pause with `group-hover:[animation-play-state:paused]`. (no longer used by Testimonials.)
- **`<StepPlayer>`** (`components/ui/StepPlayer.tsx`) — dots + morphing play/pause button, vendored from bencho.dev (MIT); keep its comments. Portfolio-only props: `autoPlay`, `loop`, `onStep`, `label`, `hold` (freeze while off screen). Bencho tokens are mapped onto ours on `.spl` in `globals.css` (no new globals). Used by **`<TestimonialSlider>`**: a slow slideshow (active card centered, neighbours dimmed) that autoplays, pauses, or jumps with a dot.
- **Projects** (`components/projects/`) — `ProjectMedia` (video → image → generated gradient cover using `project.hue`), `FeaturedWork` (pinned retro window for `featured: true`; on phones the ring + window are smaller and the title/details sit below), `ArcCarousel` (cards on a big wheel turned by scroll; `GEO.sm` geometry below 768px). The responsive grid in `Projects.tsx` is always rendered — it's the course's "1 col mobile / 2–3 desktop" requirement, don't remove it.
- **Lab** (`app/lab/page.tsx`, `components/lab/`) — `LabCanvas` (infinite pan: drag with inertia, wheel, arrow keys; only visible cells render; tile pattern `TILES[(3c + r) mod 10]`), `tiles.tsx` (tile list), `Window` (draggable retro OS window, Escape closes, full-screen on mobile), apps `Terminal` (commands read from `data/`) and `PixelPaint` (32×32, pen/erase/fill/mirror/undo/PNG). To add an app: add an `AppId`, an entry in `APPS` in `LabCanvas.tsx` and a tile in `tiles.tsx`.
- **Page transitions** — wrap each `page.tsx` in `<PageTransition>` and use `<Link transitionTypes={["page-card"]}>`. CSS in `globals.css` (`page-card-out/in`). `SmoothScroll` stores `--vt-old-oy` on click so the tall old page scales around what was on screen. Fixed-only pages need a real box (`h-svh`) to be snapshotted.
- **Theme system** (`lib/theme.ts`) — visitor-chosen `mode` (dark/light), accent `hue` and hero-grid `cell`/`glow`/`speed`, saved in localStorage (`juano-theme`) and applied to `<html>` (`data-theme` + `--color-violet*` vars). `THEME_INIT_SCRIPT` runs in `<head>` before paint. Light-mode tokens live under `html[data-theme="light"]` in `globals.css` (same token names, inverted roles). Use `text-on-accent` for text on accent backgrounds. Canvas/WebGL code reads colors with `cssColor()`/`cssRgb()` and listens with `subscribeTheme()`. UI: `<ThemeToggle>` (navbar, footer) and `<AccentSwatches>` (footer); full controls in the Lab's Shader playground.
- **`<AsciiButterfly>`** — dithered dot-grid butterfly (style ref: owner's "ascii dither butterfly" video; motion ref: creatures that glide and turn toward their heading). **Owner's rule: it must NOT follow the visitor through the page.** Hidden until `#skills`. **Skills works like elicubillos.com's skills section:** on desktop the section is `280vh` with a sticky one-screen stage; a scrubbed GSAP timeline raises the cards (`SKILLS_LEAD` unit for the first card + 1 unit per card + a short hold = `SKILLS_TIMELINE`). **The butterfly must never drop or vanish mid-route (owner):** card i rises during the last half-unit of card i−1, so it is already up when the butterfly arrives and the dotted route continues at the same height and writes the progress to `#skills[data-progress]`. Each card has its own dotted gaussian "hump" (`CardCurve`, paths `data-butterfly-line="skills"` + `data-index`). The butterfly reads `data-progress`, sits exactly on the curve of the card that is rising (facing the tangent) and reveals that card's bright trail via the mask path `[data-butterfly-trail="i"]` (pathLength 1000). At the end all cards are aligned at the same height. After the cards (or below the section) it may follow the cursor (fine pointers only; on touch it fades out). **Below `lg`** (like Eli on mobile): section `400vh`, sticky stage, cards in a horizontal row (`min(80vw,26rem)`) that slides left at the butterfly's pace, so it stays near the middle of the screen like Eli's bee; it glides in from the upper left and rests at the end of the line until the section leaves — same `data-progress`, so the butterfly rides the curves too (scale 0.55 under 768px). Reduced motion: no pin, no butterfly, curves fully drawn.
- **Lab apps** — Terminal, Pixel Paint, Shader playground (`ShaderPlayground.tsx`, reuses `components/hero/gridGlsl.ts`), Photo filters (`PhotoFilters.tsx`), Food (`food/`: 12×12 text sprites of Colombian food in `sprites.ts`).
- **`hasFastWebGL()`** (`lib/gpu.ts`) — use before any WebGL effect; false for software renderers.
- **`<Avatar>`** / **`<SocialIcon name>`** (`components/ui/`) — profile avatar (photo or monogram) and inline SVG icons (github, linkedin, email).
- **SEO** — `app/opengraph-image.tsx`, `app/icon.jpg` + `app/apple-icon.jpg` (JR logo), `app/robots.ts`, `app/sitemap.ts`, `app/not-found.tsx`; base URL in `lib/site.ts`.
- **Content guide for the owner** — `docs/contenido.md` (Spanish): where every piece of real content goes.
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
- [x] **Phase 5** — `/lab` (infinite canvas, Terminal, Pixel Paint) + page transitions
- [x] **Phase 6** — course checklist audit (avatar, CV placeholder, social icons), responsive (no horizontal scroll 375–1920), a11y (skip link, focus ring, contrast; Lighthouse a11y 100), SEO (metadata, OG image, icon, robots, sitemap, 404), perf (lighter 3D, adaptive DPR, deferred mount, software-WebGL fallback). 
- [x] **Perf pass** — root cause of the long task: first R3F frame waiting ~1.7 s on GPU shader compile (MeshTransmissionMaterial + Environment/PMREM through ANGLE/D3D on Windows). A procedural shader alone scored desktop 83–88, but the owner preferred the physical glass, so desktop keeps it (with shader warm-up) and phones use the light one. Lighthouse now: desktop 63 (headless Chrome doesn't benefit from the warm-up), mobile ~54 (LCP ~4 s = hero h1 after the intentional loader). Owner decided NOT to drop the loader or the 3D on phones.
- [x] **Extras** — visitor theme (light mode + accent picker), Lab apps Shader playground / Photo filters / Food, ASCII butterfly.
- [x] **Logo** — owner's JR logo in About (line drawing), hero avatar and favicon (`app/icon.jpg` + `app/apple-icon.jpg`, 180px crop of the monogram). Owner chose to keep the "Juano." wordmark in the navbar/lab.
- [ ] **Phase 7** — final content (Harvard-style CV, testimonials, videos)

**Pending from the owner:** photo, current CV (to redo in Harvard format), project GitHub/Vercel links + videos, email/LinkedIn, real experience, 3 testimonials.

Keep this section up to date when a phase lands.
