// Ancla Calma walk-through: lighthouse entrance → language → "I need help" → island map
// → box breathing → Signals island. Public routes only (no account, no personal data).
import { record } from "./recorder.mjs";

await record({
  url: "https://ancla-calma.vercel.app/",
  out: "raw/ancla-calma.mp4",
  script: async ({ wait, click, hover, text, page, moveTo, scroll }) => {
    await wait(2200); // the lighthouse beam sweeping
    await click(page.getByRole("button", { name: "Comenzar" }).or(page.getByRole("link", { name: "Comenzar" })), { ms: 900 });
    await wait(1500);

    await click(text("Continuar en español"), { ms: 800 });
    await wait(1400);

    await hover(text("Quiero ayudar"), 700);
    await wait(500);
    await click(text("Necesito ayuda"), { ms: 600 });
    await wait(1600);

    // Island map: glide past each island, then into the Air island.
    await hover(text("Isla del Auxilio"), 700);
    await wait(250);
    await hover(text("Isla del Faro"), 700);
    await wait(250);
    await click(text("Isla del Aire"), { ms: 700 });
    await wait(1400);

    await click(text("Respira como las olas"), { ms: 800 });
    await moveTo(1180, 620, 900); // move out of the way of the breathing circle
    await wait(6500);

    // Back to the map and into the Signals island.
    await click(page.getByRole("button", { name: /volver/i }).or(page.getByRole("link", { name: /volver/i })), { ms: 900 });
    await wait(1100);
    await click(page.getByRole("button", { name: /volver/i }).or(page.getByRole("link", { name: /volver/i })), { ms: 500 });
    await wait(1200);
    await click(text("Isla de las Señales"), { ms: 800 });
    await wait(1400);
    await click(text("Emocionales"), { ms: 800 });
    await wait(1600);
    await scroll(320, 1100);
    await wait(1800);
  },
});
