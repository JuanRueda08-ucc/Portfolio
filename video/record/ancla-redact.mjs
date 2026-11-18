// Burn masks into the recording before passing it to Remotion. Times and boxes
// refer to the reviewed 1440×900 source, including screen entrance animations.
import { execFileSync } from "node:child_process";
import { FFMPEG } from "./recorder.mjs";

const masks = [
  { x: 512, y: 244, w: 410, h: 118, when: "between(t,11,20)" }, // Contact avatars and names.
  { x: 438, y: 422, w: 540, h: 129, when: "between(t,12,19)" }, // Demo contact fields.
  { x: 405, y: 327, w: 630, h: 570, when: "between(t,128,137)" }, // Earlier journal entries.
  { x: 429, y: 327, w: 287, h: 212, when: "between(t,142,156)" }, // Support contacts.
  { x: 546, y: 209, w: 348, h: 89, when: "between(t,152,160)" }, // Profile greeting and email.
  { x: 435, y: 469, w: 470, h: 89, when: "between(t,152,160)" }, // Display name.
];
const filters = [];
let input = "0:v";
for (const [i, m] of masks.entries()) {
  filters.push(`[${input}]split[base${i}][region${i}]`,
    `[region${i}]crop=${m.w}:${m.h}:${m.x}:${m.y},boxblur=18:4[blur${i}]`,
    `[base${i}][blur${i}]overlay=${m.x}:${m.y}:enable='${m.when}'[out${i}]`);
  input = "out" + i;
}
execFileSync(FFMPEG, ["-v", "error", "-y", "-i", "raw/ancla-calma-full.mp4", "-filter_complex_threads", "3",
  "-filter_complex", filters.join(";"), "-map", `[${input}]`, "-an", "-c:v", "libx264", "-threads", "3",
  "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", "public/clips/ancla-calma-full.mp4"]);
