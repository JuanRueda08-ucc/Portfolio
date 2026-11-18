import { performance } from "node:perf_hooks";
import { withChef } from "./chef-app.mjs";
import { recordPage } from "./recorder.mjs";

await withChef(async ({ page, viewport }) => {
  await page.addStyleTag({ content: `
    .mi-cuenta .hola h1, .mi-cuenta .hola p, .mi-cuenta .fila small,
    figcaption, .credito { filter: blur(12px) }
  ` });
  await recordPage({
    page, viewport, out: "raw/chef-digital-full.mp4",
    script: async ({ click, hover, wait }) => {
      const start = performance.now();
      const mark = (title) => console.log(((performance.now() - start) / 1000).toFixed(2), title);
      const button = (name) => page.getByRole("button", { name, exact: typeof name === "string" });
      const press = (name) => click(button(name), { ms: 420 });
      const menu = async (name) => {
        await press("Abrir el menú");
        const item = page.getByRole("navigation", { name: "Menú" }).getByRole("button", { name });
        await hover(item);
        await item.click();
      };
      const ask = async (question) => {
        const chat = page.getByRole("dialog").filter({ has: page.getByRole("textbox") });
        const replies = chat.locator("p.chef");
        const before = await replies.count();
        await click(chat.getByRole("textbox"));
        await page.keyboard.type(question, { delay: 60 });
        await page.keyboard.press("Enter");
        await replies.nth(before).waitFor();
        await wait(3000);
        await click(chat.getByRole("button", { name: "Cerrar el chat" }));
      };
      mark("Welcome");
      await wait(2200);
      for (const name of ["Siguiente →", "Siguiente →", "¡A cocinar!"]) {
        await press(name);
        await wait(1600);
      }
      mark("Build your pantry");
      await press("¡Sí, vamos!");
      await press(/Pregúntale al chef/);
      await ask("Tengo pollo y arroz");
      for (const ingredient of ["Cebolla", "Tomate", "Pimiento rojo"]) {
        await click(page.getByText(ingredient, { exact: true }).first());
      }
      await press("Una porción menos");
      await press("Una porción menos");
      await wait(1800);
      await press("Buscar recetas");
      mark("Ask the chef");
      await wait(2500);
      await press("Pedir ideas al chef");
      const firstIdea = page.locator("button.tarjeta.idea").first();
      await click(firstIdea);
      await wait(3500);
      await press("Todas las recetas");
      await press(/Arroz con pollo/i);
      await wait(3200);
      mark("Cook all nine steps");
      await press("Cocinar esta receta");
      for (let step = 1; step <= 9; step++) {
        await page.getByText(`Paso ${step} de 9`, { exact: true }).waitFor();
        mark(`Rice step ${step}`);
        await wait(3500);
        if (step === 1) {
          await press("Escribir");
          await ask("¿Qué técnica uso para picar las verduras?");
          await page.locator(".pasos-tecnica").waitFor();
          await wait(3200);
          await press("Cerrar");
        }
        if (step === 3) {
          await press("Iniciar");
          await wait(4200);
          await click(page.locator("button.en-marcha").first());
          await press("Pausar");
          await wait(1300);
          await press("Seguir");
          await wait(1700);
          await press("Cerrar");
        }
        await press(step === 9 ? "Terminar receta" : "Listo, siguiente");
      }
      const finish = page.getByRole("heading", { name: "¡Listo! Que aproveche." });
      await finish.waitFor();
      await wait(3500);
      mark("Save a chef idea");
      await press("Cocinar otra receta");
      await press("Buscar recetas");
      await press("Pedir ideas al chef");
      await click(firstIdea);
      await press("Ver receta completa");
      await wait(2000);
      await press("Cocinar esta receta");
      await page.locator(".avance").waitFor();
      const steps = await page.getByRole("button", { name: /Ir al paso/ }).count();
      for (let step = 1; step <= steps; step++) {
        await page.getByText(`Paso ${step} de ${steps}`, { exact: true }).waitFor();
        await wait(2000);
        await press(step === steps ? "Terminar receta" : "Listo, siguiente");
      }
      await finish.waitFor();
      await press("Guardar en Mis recetas");
      await page.locator("#titulo-mi-receta").waitFor();
      await wait(1600);
      await press("Volver");
      await menu("Mis recetas");
      await click(page.locator(".lista li button").first());
      await page.locator("#titulo-mi-receta").waitFor();
      await wait(3000);
      mark("Make it yours");
      await menu(/Ver mi cuenta/);
      await page.locator(".mi-cuenta").waitFor();
      await wait(2800);
      await menu(/Oscuro/);
      await wait(1500);
      await page.getByRole("navigation", { name: "Menú" }).getByRole("button", { name: "Inicio" }).click();
      await button("¡Sí, vamos!").waitFor();
      await wait(3000);
      mark("End");
    },
  });
});
