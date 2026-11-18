# Project videos

Records the portfolio projects for real and polishes the clips with [Remotion](https://www.remotion.dev/).
Separate `package.json`: nothing here ships with the Next.js site (excluded from its ESLint and TypeScript).

## 1. Record

`record/recorder.mjs` drives the installed Chrome (playwright-core, no browser download), captures frames over the
DevTools screencast (sharper than Playwright's `recordVideo`) and draws a cursor with a click ripple.
One script per app:

```powershell
node record/ancla-calma.mjs      # → raw/ancla-calma.mp4
node record/vinyl-player.mjs     # → raw/vinyl-player.mp4 (demo tracks in raw/tracks, synthesized with ffmpeg)
node record/inspect.mjs <url>    # list a page's buttons/inputs to write a new script
```

Run them from PowerShell: Git Bash rewrites arguments that start with `/`.

## 2. Polish

Copy the raw clip to `public/clips/`, describe its segments in `src/apps.ts` (time range, speed, caption, zoom), then:

```powershell
npm run studio                                   # preview
npx remotion render src/index.ts ancla-calma out/ancla-calma.mp4 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## 3. Ship

```powershell
ffmpeg -i out/<slug>.mp4 -an -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart ../public/videos/<slug>.mp4
```

Then add `video: "/videos/<slug>.mp4"` to the project in `../data/projects.ts` (the cover image stays the thumbnail).
`raw/`, `out/` and `public/clips/` are git-ignored.

### Full walkthroughs

Run `node record/chef-digital-full.mjs` from this directory in PowerShell. Copy the resulting MP4 from `raw/` to `public/clips/` and use the chapter times printed by the script to update the cut in `src/apps.ts`.

For compositions with a static window, `node render-full.mjs chef-digital-full "--browser-executable=C:/Program Files/Google/Chrome/Application/chrome.exe"` renders the title, window, captions, chapter cards and outro with Remotion. ffmpeg composites the recording at each segment's specified speed and writes the web-ready H.264 file to `out/`. Review the contact sheets before copying it to the site's `public/videos/` and setting `videoFull`.
