// Records a scripted walk through a web app as a smooth 30 fps MP4.
// Frames come straight from Chrome (CDP screencast, JPEG q92) instead of Playwright's
// low-bitrate recordVideo; a fake cursor with a click ripple is drawn into the page,
// because headless Chrome has no visible pointer.
import { chromium } from "playwright-core";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

export const FFMPEG =
  process.env.FFMPEG ??
  "C:/Users/Edwin Rueda/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-essentials_build/bin/ffmpeg.exe";

const CURSOR = `
(() => {
  if (window.__cursor) return;
  const style = document.createElement('style');
  style.textContent = \`
    ::-webkit-scrollbar { display: none }
    html { scrollbar-width: none }
    #__cur { position: fixed; z-index: 2147483647; left: 0; top: 0; width: 22px; height: 22px; pointer-events: none;
      transform: translate(-100px,-100px); transition: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,.45)) }
    .__ripple { position: fixed; z-index: 2147483646; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.9); background: rgba(255,255,255,.18); pointer-events: none;
      animation: __rip .55s ease-out forwards }
    @keyframes __rip { from { transform: scale(.3); opacity: 1 } to { transform: scale(1.4); opacity: 0 } }\`;
  const cur = document.createElement('div');
  cur.id = '__cur';
  cur.innerHTML = '<svg viewBox="0 0 22 22" width="22" height="22"><path d="M3 2l15 8.5-6.6 1.6L8.2 18z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const mount = () => { document.head.append(style); document.body.append(cur); };
  document.body ? mount() : addEventListener('DOMContentLoaded', mount);
  addEventListener('mousemove', (e) => { cur.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)'; }, true);
  addEventListener('mousedown', (e) => {
    const r = document.createElement('div'); r.className = '__ripple';
    r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
    document.body.append(r); setTimeout(() => r.remove(), 600);
  }, true);
  window.__cursor = true;
})();`;

/** Opens a Chrome tab at `url` and records it (see recordPage). */
export async function record({ url, out, script, viewport = { width: 1440, height: 900 }, colorScheme = "dark" }) {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
  });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme, locale: "es-CO" });
  await context.addInitScript(CURSOR);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await recordPage({ page, out, script, viewport });
  await browser.close();
}

/** The cursor overlay, for pages opened elsewhere (e.g. an Electron window). */
export const installCursor = (page) => page.evaluate(CURSOR);

/**
 * Records an already open page (browser tab or Electron window) while `script` runs.
 * @param {{ page: import("playwright-core").Page, out: string, script: Function, viewport: {width:number,height:number} }} o
 */
export async function recordPage({ page, out, script, viewport }) {
  const frames = resolve(out + ".frames");
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });

  const cdp = await page.context().newCDPSession(page);
  const shots = [];
  let recording = true;
  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    if (!recording) return; // a late frame after stop
    const file = join(frames, `${String(shots.length).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(data, "base64"));
    shots.push({ file, t: metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  // Park the cursor so it is on screen from the first frame.
  const start = { x: viewport.width * 0.62, y: viewport.height * 0.7 };
  await page.mouse.move(start.x, start.y);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: viewport.width, maxHeight: viewport.height, everyNthFrame: 1 });

  await script(makeApi(page, start));

  await page.waitForTimeout(300);
  recording = false;
  await cdp.send("Page.stopScreencast");

  // Frames only arrive when something changes: give each one the time until the next.
  const lines = [];
  for (let i = 0; i < shots.length; i++) {
    const d = i + 1 < shots.length ? shots[i + 1].t - shots[i].t : 0.5;
    lines.push(`file '${shots[i].file.replace(/\\/g, "/")}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`);
  }
  lines.push(`file '${shots.at(-1).file.replace(/\\/g, "/")}'`);
  const list = join(frames, "list.txt");
  writeFileSync(list, lines.join("\n"));
  execFileSync(FFMPEG, [
    "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list,
    "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "16", out,
  ]);
  rmSync(frames, { recursive: true, force: true });
  const secs = shots.at(-1).t - shots[0].t;
  console.log(`${out}: ${shots.length} frames, ${secs.toFixed(1)} s`);
}

/** Small, human-paced helpers: eased mouse moves, pauses, clicks on text. */
function makeApi(page, start) {
  let pos = { ...start };
  const wait = (ms) => page.waitForTimeout(ms);
  const moveTo = async (x, y, ms = 650) => {
    const steps = Math.max(8, Math.round(ms / 16));
    const from = { ...pos };
    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // easeInOutCubic
      await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
      await wait(ms / steps);
    }
    pos = { x, y };
  };
  const center = async (locator) => {
    await locator.first().waitFor({ state: "visible", timeout: 15000 });
    await locator.first().scrollIntoViewIfNeeded();
    const b = await locator.first().boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const hover = async (locator, ms) => {
    const c = await center(locator);
    await moveTo(c.x, c.y, ms);
  };
  const click = async (locator, { ms, pause = 350 } = {}) => {
    await hover(locator, ms);
    await wait(pause);
    await page.mouse.down();
    await wait(90);
    await page.mouse.up();
  };
  const scroll = async (dy, ms = 900) => {
    const steps = Math.round(ms / 16);
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, dy / steps);
      await wait(16);
    }
  };
  return { page, wait, moveTo, hover, click, scroll, text: (t) => page.getByText(t, { exact: false }) };
}
