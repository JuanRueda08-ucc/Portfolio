// Chef Digital walk-through: welcome → home → pantry → chat fills the pantry → more ingredients
// and servings → recipe results → Arroz con pollo → cooking steps with the built-in timer.
// Runs on a throwaway profile with the fake AI provider (see chef-app.mjs).
import { recordPage } from "./recorder.mjs";
import { withChef } from "./chef-app.mjs";

// The fake provider shows a "test mode" note in the chat; it is not part of the real app.
const hideTestNote = (page) =>
  page.evaluate(() => {
    const hide = () =>
      document.querySelectorAll("p, span, div").forEach((el) => {
        if (el.childElementCount === 0 && /Modo de prueba/i.test(el.textContent ?? "")) el.style.visibility = "hidden";
      });
    new MutationObserver(hide).observe(document.body, { childList: true, subtree: true });
    hide();
  });

await withChef(async ({ page, viewport }) => {
  await hideTestNote(page);
  await recordPage({
    page,
    viewport,
    out: "raw/chef-digital.mp4",
    script: async ({ wait, click, hover, text, scroll, moveTo }) => {
      const btn = (name) => page.getByRole("button", { name, exact: true });
      await page.getByText("Saltar").waitFor({ timeout: 20000 });
      await wait(2200);
      await click(btn("Siguiente →"), { ms: 900 });
      await wait(1700);
      await click(btn("Siguiente →"), { ms: 400 });
      await wait(1700);
      await click(btn("¡A cocinar!"), { ms: 500 });
      await wait(1600);

      // Home: a look at today's ideas, then into the pantry.
      await moveTo(640, 800, 900);
      await moveTo(1250, 800, 1300);
      await wait(300);
      await click(btn("¡Sí, vamos!"), { ms: 1000 });
      await wait(1400);

      // Tell the chef what you have; it fills the pantry.
      await click(page.getByRole("button", { name: /Pregúntale al chef/ }), { ms: 1000 });
      await wait(900);
      const input = page.getByPlaceholder(/Tengo pollo y arroz/);
      await click(input, { ms: 700 });
      await page.keyboard.type("tengo pollo y arroz", { delay: 75 });
      await wait(400);
      await page.keyboard.press("Enter");
      await wait(2600);
      await click(page.getByRole("button", { name: "Cerrar el chat" }).last(), { ms: 800 });
      await wait(900);

      // A couple more by hand, and cook for two.
      await click(text("Cebolla"), { ms: 800 });
      await wait(350);
      await click(text("Tomate"), { ms: 600 });
      await wait(350);
      await click(text("Pimiento rojo"), { ms: 500 });
      await wait(600);
      await click(page.getByRole("button", { name: "Una porción menos" }), { ms: 900 });
      await wait(300);
      await click(page.getByRole("button", { name: "Una porción menos" }), { ms: 150 });
      await wait(900);
      await click(btn("Buscar recetas"), { ms: 800 });
      await wait(1800);

      // Results with photos and what is missing; open Arroz con pollo.
      await hover(text("Huevos pericos"), 900);
      await wait(300);
      await hover(text("Arroz con verduras"), 600);
      await wait(300);
      await click(text("Arroz con pollo").first(), { ms: 700 });
      await wait(2000);
      await moveTo(900, 560, 900);
      await scroll(260, 900);
      await wait(1200);
      await click(btn("Cocinar esta receta"), { ms: 900 });
      await wait(2400);

      // Cooking mode: step by step, with the chef's tips and timers.
      await click(btn("Listo, siguiente"), { ms: 900 });
      await wait(2000);
      await click(btn("Listo, siguiente"), { ms: 300 });
      await wait(1500);
      await click(btn("Iniciar"), { ms: 1000 });
      await moveTo(760, 640, 900);
      await wait(4000);
    },
  });
});
