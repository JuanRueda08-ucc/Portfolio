// Full demos have static chapter cards and a fixed window. Render each layout once
// with Remotion and composite the real footage with ffmpeg at the composition's fps.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CHAPTER, FPS, INTRO, OUTRO, WINDOW, segmentFrames, timeline } from "./src/apps.ts";
import { FFMPEG } from "./record/recorder.mjs";

const [id, chrome] = process.argv.slice(2);
if (!/^[a-z0-9-]+-full$/.test(id) || !chrome?.startsWith("--browser-executable=")) {
  throw new Error("Usage: node render-full.mjs <slug>-full --browser-executable=<path>");
}
const browserExecutable = chrome.slice("--browser-executable=".length);
const dir = resolve("out", id + "-parts");
mkdirSync(dir, { recursive: true });
const serveUrl = await bundle({ entryPoint: resolve("src/index.ts"), outDir: resolve(dir, "bundle"), publicDir: null });
const browser = await openBrowser("chrome", { browserExecutable });
const segments = [];
try {
  const options = { serveUrl, browserExecutable, puppeteerInstance: browser };
  const composition = await selectComposition({ ...options, id, inputProps: {} });
  const demo = composition.props;
  if (!demo.outro || demo.segments.some((s) => s.zoom)) throw new Error("Use the Remotion CLI for animated zooms or previews.");
  const { parts, outroStart } = timeline(demo);
  async function add(frame, frames, source) {
    const index = String(segments.length).padStart(2, "0");
    const plate = resolve(dir, index + ".png");
    const output = resolve(dir, index + ".mp4");
    await renderStill({
      ...options, composition: { ...composition, props: { ...demo, clip: "" } },
      inputProps: { ...demo, clip: "" }, frame, output: plate, imageFormat: "png",
    });
    const args = ["-loop", "1", "-framerate", String(FPS), "-i", plate];
    if (source) {
      const { width, height, x, y } = WINDOW;
      args.push("-ss", String(source.from), "-t", String(source.to - source.from), "-i", resolve("public", demo.clip),
        "-filter_complex_threads", "2", "-filter_complex",
        `[1:v]setpts=(PTS-STARTPTS)/${source.rate},fps=${FPS},scale=${width}:${height}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x111111[clip];[0:v][clip]overlay=${x}:${y}[v]`,
        "-map", "[v]");
    }
    console.log(index, source?.chapter ?? source?.from ?? "Card", frames);
    execFileSync(FFMPEG, ["-v", "error", "-y", ...args, "-frames:v", String(frames), "-an", "-c:v", "libx264",
      "-threads", "3", "-preset", "fast", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output]);
    segments.push(`file '${index}.mp4'`);
  }
  await add(18, INTRO);
  for (const { s, cardStart, start } of parts) {
    if (s.chapter) await add(cardStart + 1, CHAPTER);
    const frames = segmentFrames(s);
    await add(start + Math.min(30, frames - 1), frames, s);
  }
  await add(outroStart, OUTRO);
  const list = resolve(dir, "segments.txt");
  writeFileSync(list, segments.join("\n"));
  execFileSync(FFMPEG, ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list,
    "-c", "copy", "-movflags", "+faststart", resolve("out", id + ".mp4")]);
} finally {
  await browser.close({ silent: true });
}
