import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";
import { record } from "./recorder.mjs";

await record({
  url: "https://vinyl-player-beryl.vercel.app/",
  out: "raw/vinyl-player-full.mp4",
  colorScheme: "light",
  script: async ({ page, click, hover, wait, moveTo, scroll }) => {
    const start = performance.now();
    const mark = (chapter) => console.log(((performance.now() - start) / 1000).toFixed(2), chapter);
    const control = (id) => page.locator("#" + id);
    const press = (id) => click(control(id));
    const tracks = page.locator("#playlist li");
    const add = async (id, names) => {
      const chooser = page.waitForEvent("filechooser");
      await press(id);
      await (await chooser).setFiles(names.map((name) => resolve("raw/tracks", name + ".mp3")));
      await wait(2300);
    };
    mark("Build the queue");
    await wait(2200);
    await add("add-last", ["Midnight Drive", "Paper Planes"]);
    await add("add-first", ["Lo-fi Sunrise"]);
    await click(control("add-at-index"));
    await control("add-at-index").fill("2");
    await wait(1200);
    await add("add-at", ["Ocean Static"]);
    for (const [index, name] of ["Lo-fi Sunrise", "Ocean Static", "Midnight Drive", "Paper Planes"].entries()) {
      assert.ok((await tracks.nth(index).innerText()).includes(name));
      await hover(tracks.nth(index), 450);
    }
    mark("Play a record");
    await press("btn-play");
    await moveTo(355, 356);
    await wait(4000);
    await press("btn-next");
    await wait(2200);
    await press("btn-prev");
    await wait(1800);
    await click(control("seek-bar"));
    await wait(2500);
    await click(control("vol-bar"));
    await press("btn-mute");
    await wait(1600);
    await press("btn-mute");
    mark("Shuffle and repeat");
    await press("btn-shuffle");
    await wait(1900);
    await press("btn-next");
    await wait(2000);
    await press("btn-shuffle");
    for (let mode = 0; mode < 3; mode++) {
      await press("btn-repeat");
      await wait(2200);
    }
    mark("Inspect the linked list");
    if (await page.locator(".spinning").count()) await press("btn-play");
    await press("inspector-toggle");
    await moveTo(1050, 760);
    await scroll(570);
    const nodes = page.locator("#list-inspector .ins-node");
    assert.equal(await nodes.count(), 4);
    for (let i = 0; i < 4; i++) {
      await hover(nodes.nth(i), 650);
      await wait(1600);
    }
    await click(tracks.nth(2));
    await moveTo(720, 760);
    await wait(2000);
    if (await page.locator(".spinning").count()) await press("btn-play");
    mark("Edit the playlist");
    await hover(tracks.nth(1));
    await click(tracks.nth(1).getByTitle("Remove"));
    await wait(2000);
    assert.equal(await nodes.count(), 3);
    await hover(nodes.nth(1));
    await wait(2500);
    await click(tracks.first());
    await moveTo(720, 760);
    await wait(2300);
    await press("inspector-toggle");
    await moveTo(800, 480);
    await scroll(-650);
    if (await page.locator(".spinning").count()) await press("btn-play");
    await wait(3000);
    mark("End");
  },
});
