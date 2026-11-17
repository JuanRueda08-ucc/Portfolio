// Vinyl Player walk-through: load demo tracks (synthesized, royalty-free, made with
// ffmpeg in raw/tracks) → play (the record spins) → next / shuffle → the linked-list view.
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { record } from "./recorder.mjs";

const tracks = readdirSync("raw/tracks").map((f) => resolve("raw/tracks", f));

await record({
  url: "https://vinyl-player-beryl.vercel.app/",
  out: "raw/vinyl-player.mp4",
  colorScheme: "light",
  script: async ({ page, wait, click, hover, moveTo, scroll }) => {
    await wait(1400);
    // "+ To end" opens the file picker; hand it the demo tracks.
    const chooser = page.waitForEvent("filechooser");
    await click(page.locator("#add-last"), { ms: 1000 });
    await (await chooser).setFiles(tracks);
    await wait(1800);

    await click(page.locator("#btn-play"), { ms: 900 });
    await moveTo(760, 620, 800);
    await wait(4200); // the record spins, the waveform moves

    await click(page.locator("#btn-next"), { ms: 600 });
    await wait(2600);
    await click(page.locator("#btn-shuffle"), { ms: 500 });
    await wait(700);
    await click(page.locator("#btn-repeat"), { ms: 400 });
    await wait(1200);

    // Scrub forward on the seek bar.
    const seek = await page.locator("#seek-bar").boundingBox();
    await hover(page.locator("#seek-bar"), 700);
    await page.mouse.down();
    await moveTo(seek.x + seek.width * 0.55, seek.y + seek.height / 2, 900);
    await page.mouse.up();
    await wait(1800);

    // The doubly linked list behind the playlist.
    await click(page.locator("#inspector-toggle"), { ms: 800 });
    await wait(700);
    await moveTo(720, 760, 600);
    await scroll(600, 1300); // the inspector opens below the fold
    await wait(1200);
    const nodes = page.locator("[class*=node], [class*=Node]").filter({ visible: true });
    const n = Math.min(4, await nodes.count());
    for (let i = 0; i < n; i++) {
      if (!(await nodes.nth(i).boundingBox())) continue;
      await hover(nodes.nth(i), 550).catch(() => {});
      await wait(350);
    }
    await wait(2200);
  },
});
