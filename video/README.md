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

For TickGo, use the isolated Wear OS AVD named `Portfolio_Watch` on port 5582. In a disposable copy of the app, set `voiceAvailable` to false in `CreateVoiceScreen.kt` and build its debug APK. This selects the built-in offline example, which runs through the same parser and event storage as a transcript. Install it on the demo watch, run `python record/tickgo-event.py` from PowerShell, then `python record/tickgo-event.py --routines` from the event list. Restore the original APK when finished. Normalize the project's `design/capturas/demo.mp4`, the event take and the routine take to 30 fps and concatenate them in that order as `public/clips/tickgo-full.mp4`. Align the chapter times to the new takes before rendering.

### Vigía (Android, phone frame)

Vigía needs a real face, so the owner drives the app himself on the `vigia_pixel` AVD, started with
`-camera-front webcam0 -gpu host -memory 4096` and the `qemu-system-x86_64` process at High priority.
Calibration needs ~10 analysed frames per second: the emulator's own recorder (`adb emu screenrecord`
or on-device `screenrecord`) took a third of them and calibration failed, so `record/vigia_session.py`
captures the emulator window from the desktop instead (ddagrab + Intel Quick Sync), plus every touch and
the engine log. Run `python record/vigia_session.py <name>` from PowerShell, do the flow, press Enter.

Prepare the clip (crop the 1080×2400 screen out of the window, ×2, blur the account email):

```powershell
ffmpeg -i raw/vigia-full2.mp4 -filter_complex "[0:v]crop=376:836:1:38,fps=30,scale=752:1672:flags=lanczos,split[a][b];[b]crop=560:240:110:230,boxblur=14:3[e];[a][e]overlay=110:230:enable='between(t,165.2,173.4)'[v]" -map "[v]" -an -c:v libx264 -crf 14 -pix_fmt yuv420p public/clips/vigia-full.mp4
```

Segments, zooms and taps live in `src/vigia.ts`; `src/PhoneDemo.tsx` draws the phone, the camera zoom,
the touch ripples and the chapter panel. Render with the Remotion CLI (`vigia-full`, `vigia`), not
`render-full.mjs`, which only pastes the footage under static plates.
