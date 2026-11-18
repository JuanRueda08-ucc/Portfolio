<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project context — Juano Rueda's portfolio

Read this file first. It is the single source of truth for any AI agent (Claude Code, **Codex**, Cursor, Copilot, …) working on this repo, so context survives across sessions. `CLAUDE.md` only imports this file (`@AGENTS.md`); **edit AGENTS.md, never fork the context into CLAUDE.md or into an agent's private memory.**

**Multi-agent workflow (owner's plan):** the owner works with Claude Code until its 5-hour usage window runs out, then continues with Codex (and back). Therefore: read "Handoff — current state" and "Task backlog" at the bottom before starting, finish or clearly mark any half-done work, commit in small Conventional Commits, and update those two sections whenever something lands or a decision is made.

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
- **`<LogoReveal>`** (About, **phones only**) — the SAME line drawing as desktop, not a picture of the logo (owner was explicit). It waits for a "Generate" press, then `LineDrawing` draws it quickly (`drawSignal`, `autoDraw={false}`, ~2.7 s, % counter). The pill and counter styles (`.gen`, `.gen-go`, `.gen-pct` in `globals.css`) come from bencho.dev's Generate (MIT); the component itself was removed. Once drawn the button never comes back, so nothing covers the logo. Desktop keeps the cursor drawing plus a "( Move your cursor over it to reveal the logo )" hint.
- **`<LineDrawing src trace fallbackText>`** — draws an image with contour lines around the cursor, self-draws when idle. In About it draws the owner's **JR logo** (`profile.logo`, `public/images/logo-jr.webp`) with `trace="light"` (ink = bright × low saturation, so the saturated blue background is ignored).
- **Logo** — `profile.logo` is the owner's chrome JR monogram. Used by the About line drawing and as favicon. `profile.photo` (`public/images/me.webp`, 400px square) is the hero `<Avatar>`.
- **`<Stickers items>`** — draggable tech chips (Motion `drag`), `data-cursor="Drag"`.
- **`<PixelField>`** — raw WebGL2 pixel terrain (footer). Pattern to copy for any light full-screen shader without three.js.
- **Marquee** — `animate-marquee` utility (defined in `@theme`), pause with `group-hover:[animation-play-state:paused]`. (no longer used by Testimonials.)
- **`<StepPlayer>`** (`components/ui/StepPlayer.tsx`) — dots + morphing play/pause button, vendored from bencho.dev (MIT); keep its comments. Portfolio-only props: `autoPlay`, `loop`, `onStep`, `label`, `hold` (freeze while off screen). Bencho tokens are mapped onto ours on `.spl` in `globals.css` (no new globals). Used by **`<TestimonialSlider>`**: a slow slideshow (active card centered, neighbours dimmed) that autoplays, pauses, or jumps with a dot.
- **Project videos** — `Watch demo` (`components/projects/VideoButton.tsx`) opens the video in a floating player that grows out of the button (controls, Esc/✕/backdrop close, Lenis paused). The card shows the cover image at rest; the video plays like a YouTube thumbnail on mouse hover, or while a finger holds the card on touch (`HOLD_MS`; the release does not open the link). An always-running, sped-up loop was rejected by the owner as too fast. Files: `public/videos/<slug>.mp4` + `image` as the thumbnail. Recipe: crop browser chrome/taskbar, speed up about 3× (not 6×), blur private data (`boxblur` + `overlay=…:enable=between(t,…)`), `ffmpeg -an -c:v libx264 -crf 27 -pix_fmt yuv420p -movflags +faststart` (FinanzIA: 46 MB → 1.2 MB, account email blurred). ffmpeg is installed through winget (`Gyan.FFmpeg.Essentials`).
- **Video tooling** (`video/`, own package.json, excluded from the site lint/tsc; see `video/README.md`) — `record/recorder.mjs` records a scripted walk with the installed Chrome (playwright-core + CDP screencast + drawn cursor); Remotion (`src/apps.ts` segments: range, speed, caption, zoom; `src/Demo.tsx` title card + browser window) polishes it. Done: Ancla Calma, Vinyl Player, Chef Digital (FinanzIA is the owner's own recording). **Chef Digital** is recorded with `record/chef-app.mjs`: the app's own `out/` build launched through Playwright's `_electron`, with runtime env overrides (empty `CHEF_SUPABASE_*` = no-account mode, `CHEF_API_URL` → a backend on :8799 run with `PROVEEDOR_IA=falso` from outside the repo so it ignores the owner's `.env`), `--user-data-dir=video/raw/chef-profile` (checked before recording) and `CHEF_SIN_SONIDO=1`; it never builds into the app's `out/` (the owner builds there). Claude Motion was considered but needs a Team/Enterprise plan. Next: Vigía (Android emulator + `adb screenrecord`).
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
- [ ] **Phase 7** — final content (Harvard-style CV, testimonials, videos) — **in progress**, see the backlog below.

Keep this section up to date when a phase lands.

## Handoff — current state (updated 2026-11-17)

**Everything required by the course is built and deployed** (all sections, responsive, a11y, SEO). What remains is mostly **real content** from the owner, **project videos**, and optional polish. The site works end to end with placeholders where content is missing.

**Git:** branch `main`. Pushing to `main` redeploys on Vercel. Watch demo loads `videoFull ?? video` on open. Chef Digital has a full local demo (3:52, 3.41 MB); the four existing previews still serve the cards. Its four contact sheets were reviewed, including the in-step technique question, timer controls, all nine steps, saved recipe, dark mode and GitHub outro.

**Content state (`data/`):**

Remotion supports two-second chapter cards on segments and an optional six-second closing card with the repository and live demo URLs. The full compositions still need their recordings and chapter timings.

| File | State |
|---|---|
| `projects.ts` | Real: 7 projects (Ancla Calma, FinanzIA, Chef Digital featured; then TickGo, Vigía, Vinyl Player, Ecos de la Tierra). **FinanzIA, Ancla Calma and Vinyl Player have videos** (`/videos/<slug>.mp4`); the rest don't yet. `demo` is optional: TickGo, Chef Digital, Vigía, Ecos have none → card links to the repo. |
| `profile.ts` | Photo + JR logo done. **Email is a placeholder** (`TODO(Juano)`). |
| `experience.ts` | **Placeholder** (`TODO(Juano)`) — needs real education + work. |
| `testimonials.ts` | **Placeholder** (3 fake entries) — need 3 real ones. |
| `skills.ts` | Provisional — review with the owner. |
| `public/cv.pdf` | **Provisional** — owner will provide the current CV; redo in Harvard format. |
| Contact form | Works in "simulated" mode until `NEXT_PUBLIC_FORMSPREE_ID` is set (in Vercel env vars **and** a local `.env.local`). |

## Project video pipeline (`video/`)

Agreed with the owner: **record each app for real, then polish with Remotion** (device/browser frame, zooms, short captions). Do not use AI-generated/fake footage. Videos play only on **hover** (desktop) or **touch-hold** (phones) over the cover image; the cover stays as the thumbnail. Keep the final speed gentle (~3× at most for dead time, 1× for the good parts); the owner rejected a 6× loop as unreadable. Always **blur private data** (account emails, tokens) and never record with a personal account that exposes real data.

- `video/record/recorder.mjs` — Playwright (`playwright-core` + system Chrome) walk-through recorder. Frames come from the CDP screencast (JPEG q92) into ffmpeg → smooth 30 fps MP4 at 1440×900, with a fake cursor + click ripple injected into the page (headless Chrome has none). Per-app scripts: `ancla-calma.mjs`, `vinyl-player.mjs` (plus `explore.mjs` / `inspect.mjs` helpers to find selectors). Output goes to `video/raw/` (git-ignored).
- `video/src/apps.ts` — per-app `DemoProps`: segments `{from,to,rate,caption,zoom}` over the raw recording, colors, title/tagline/url. `Demo.tsx` renders title card → browser window with the clip → captions. `Root.tsx` registers compositions (`ancla-calma`, `vinyl-player`) at 1280×800, 30 fps.
- Render: `cd video && npx remotion render src/index.ts <composition-id> out/<id>.mp4 --browser-executable="C:Program FilesGoogleChromeApplicationchrome.exe"` (the flag avoids downloading Remotion's own Chrome); the Remotion clips are read from `video/public/clips/` (git-ignored copies of the raw recordings).
- **Final delivery recipe** (from the FinanzIA video): `ffmpeg -an -c:v libx264 -crf 27 -pix_fmt yuv420p -movflags +faststart` → `public/videos/<slug>.mp4` (target < 3 MB), then set `video: "/videos/<slug>.mp4"` in `data/projects.ts`. ffmpeg is installed via winget (`Gyan.FFmpeg.Essentials`); the recorder reads its path from `$FFMPEG` or the hard-coded WinGet path.
- **State:** FinanzIA, Ancla Calma, Chef Digital and Vinyl Player are shipped as **short previews** (40–64 s, compressed into `public/videos/`, wired in `data/projects.ts`). Chef Digital is recorded with `record/chef-app.mjs` + `record/chef-digital.mjs` (see the Video tooling bullet above). Vinyl Player recording needs MP3s (`video/raw/tracks/`, local only — royalty-free, don't commit).
- **Still to record:** Vigía (Android emulator + `adb screenrecord`), TickGo (Wear OS emulator), Ecos de la Tierra (Godot export or screen capture). Apps without a public URL need either a screen recording from the owner or a local run.

### Next: full-length demo videos (owner request, 2026-11-17) — assigned to Codex

**The problem.** The current clips are short previews: Claude trimmed them to 40–64 s for hover-to-play, sped up whole stretches, and scripted only part of each app, so they **end abruptly and skip most of the flow**. Concretely: Ancla Calma only shows public routes (no account → no Bitácora, Isla del Faro, voice notes, trusted contacts, profile, day/night theme); Chef Digital stops at step 3 of 9 (the recipe is never finished; no "Pedir ideas al chef", Mis recetas, menu, dark mode, Mi cuenta); FinanzIA is the owner's phone recording sped up 3×, not polished; Vinyl Player skips add-at-position, removing, repeat modes and list-view interactions.

**What the owner wants.** Complete demos that show the **whole flow** of each app and **end properly** (finish the task they start, then an outro card), not cut off mid-action. Rough targets: 2–4 min each, real speed for the important parts (≤ 1.5×; ≤ 3× only for dead time such as loading), one caption per chapter.

**Plan.**
1. **Two files per project.** Keep a short `<slug>.mp4` (hover preview on the card, ~30–60 s) and add a full `<slug>-full.mp4` for the "Watch demo" floating player. Add `videoFull?: string` to `Project` (`data/types.ts`); `components/projects/VideoButton.tsx` should play `videoFull ?? video`. The full files will be 5–15 MB: fine for `public/`, but check the Vercel deploy and keep `preload` off for them.
2. **Re-record each app end to end** with longer scripts in `video/record/` (copy the existing ones). Write the flow as chapters and finish each one (e.g. Chef Digital: welcome → pantry by chat and by hand → results → "Pedir ideas al chef" → recipe → all 9 cooking steps with timers → finish screen → Mis recetas → menu, dark mode).
3. **Remotion**: add chapter title cards between sections and an **outro** (app name, "github.com/…", live URL if any) in `video/src/Demo.tsx`, so the video ends on purpose. Segments in `video/src/apps.ts` stay the single place for timing.
4. **FinanzIA through Remotion**: put the owner's recording (`D:DownloadsWhatsApp Video 2026-11-17 at 2.47.25 PM.mp4`, 1916×1034, 3:13) in `video/public/clips/`, crop the browser bar (y 0–37) and taskbar (y ≥ 988) with an `objectPosition`/crop in the composition, keep the **email blur** (login field, the "Hola, <email>" greeting, the user card — exact boxes and times in `video/record/finanzia-blur.ps1`, which is how the current clip was made), and play it at 1–1.5× with chapters.
5. **Accounts.** Flows behind a login (Ancla Calma's Faro/Bitácora/profile, FinanzIA, Chef Digital's cloud features) need a **demo account with fake data**, never the owner's personal account. Agents must **not** type passwords into production sites. Options, in order: (a) the owner signs in himself in the recorder's browser and the script continues; (b) run the app **locally** (`localhost`) against a test Supabase project with a seeded demo user whose credentials live in a git-ignored local file; (c) the owner records that part himself. Never commit credentials; blur any email/name on screen.
6. Check every finished video with contact sheets (`ffmpeg -vf "fps=1/2,scale=320:-2,tile=6x6"`) before shipping — an agent can't watch a video, so sheets are how you verify chapters, blur and the ending.

**Can Codex do this?** Yes — nothing here is Claude-specific: it is Node scripts (playwright-core driving the installed Chrome/Electron), Remotion (React → MP4) and ffmpeg, all already installed on this machine. Codex needs: permission to run commands outside its sandbox (launch Chrome/Electron/an Android emulator, open network connections to the live sites, write `video/raw/`), PowerShell for the recorder scripts (Git Bash rewrites arguments that start with `/`), and its image viewer to read screenshots/contact sheets. Read `video/README.md` first.

## Task backlog (priority order)

Items marked **[owner]** need input only the owner can give — ask in Spanish, don't invent content (especially testimonials and work history: fabricated entries would be dishonest on a graded, public portfolio).

1. **Check touch-hold** on the project videos on a real phone (only tested with simulated touch events) and the video file sizes on the deployed site. (`video/` workspace + Ancla Calma/Vinyl Player videos: done; `npm run lint` and `npm run build` pass.)
2. **[owner] Real content** — current CV → rebuild `public/cv.pdf` in Harvard format (one page, English); real email; real experience (education + work, newest first); 3 real testimonials with name/relation/quote; confirm `skills.ts`.
3. **[owner] Formspree** — create the form, set `NEXT_PUBLIC_FORMSPREE_ID` in Vercel (+ `.env.local`), test a real submission, confirm the validation + confirmation message.
4. **Full-length demo videos (Codex)** — Chef Digital is complete locally. Next: Ancla Calma (owner signs into a temporary browser using a demo account), Vinyl Player, FinanzIA through Remotion, Vigía → TickGo → Ecos de la Tierra.
5. **[owner] Covers/logos** for TickGo and Vinyl Player (owner is making them) → `public/images/projects/<slug>.webp` (1280×800).
6. **Live demos** — when TickGo / Chef Digital / Vigía / Ecos get a public link, add `demo` to their entry.
7. **Final QA pass** before delivery: Lighthouse on `portfolio-prod`, 375/768/1280/1920 px with no horizontal scroll, `prefers-reduced-motion`, keyboard focus, every link (GitHub + demo) opens, favicon/OG image, `docs/requisitos-profesor.md` checklist re-ticked. Update the Lighthouse table there.
8. **Update docs**: tick Phase 7 here, refresh `docs/requisitos-profesor.md` ("only real content is missing") and `docs/contenido.md` when content lands.

## Decisions already taken (don't re-litigate)

- Desktop keeps the physical glass 3D (owner prefers it) even though it costs Lighthouse points; phones use the light shader. The LOADING loader stays. 3D stays on phones.
- Navbar/lab keep the "Juano." wordmark; the JR logo is used in About, the hero avatar and the favicon.
- Butterfly must never follow the visitor through the page, and must never drop/vanish mid-route in Skills.
- Scramble words keep the measured Elissa rhythm (not a fast flicker). Project videos are hover/hold-to-play, not autoplaying loops.
- Site copy, code, comments, commits in **English**; chat with the owner in **Spanish**; `docs/` in Spanish.
- Commits: Conventional Commits, one logical change each; push to `main` only when the owner wants it live (every push redeploys).
- Claude Motion (Team/Enterprise only, no real footage) was rejected for videos in favour of real recordings + Remotion.

## Open decisions (ask the owner when reached)

- Whether to publish the Remotion polished clips for **all** projects or keep plain screen recordings for the apps that can't be recorded cleanly (Wear OS, Godot).
- Language of the CV (English only vs. English + Spanish download) and whether to add a Spanish toggle to the site (not planned; site is English-only).
- Whether to add the optional WhatsApp contact (course lists it as optional).
- Whether to keep `/lab` apps as they are or add one more (course doesn't require them; the owner added them as personal extras).

## Working notes for any agent (Windows, owner's machine)

- OS is **Windows 11**; shell is PowerShell/Git Bash. Use forward slashes in scripts that must run in both. Paths contain spaces (`C:\Users\Edwin Rueda\…`) — quote them.
- Dev servers: `npm run dev` (port 3000) or, for real timings, `npm run build` then `npm run start -- -p 3001` (Claude's launch configs are in `.claude/launch.json`: `portfolio-dev`, `portfolio-prod`). Codex: just run those npm commands.
- Verify UI in a browser that is actually visible (a hidden tab pauses `requestAnimationFrame`, so GSAP/loader freeze and screenshots look black).
- Before finishing any change: `npm run lint`, `npx tsc --noEmit`, and for CSS/animation changes `npm run build`.
- Never put secrets or personal data in commits; `.env*` is git-ignored.
- Read `node_modules/next/dist/docs/` before touching Next.js APIs (this is Next 16 with breaking changes — see the block at the top).
- Claude-specific tooling (memory in `~/.claude`, `ccd_*` tools, the browser pane) is not available to other agents; everything durable must live in this file or in `docs/`.
