import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { createInterface } from "node:readline/promises";
import { installCursor, recordPage } from "./recorder.mjs";

export async function recordWalkthrough(page) {
  try {
    await recordDemo(page);
  } catch (error) {
    console.error(error.message);
    const input = createInterface({ input: process.stdin, output: process.stdout });
    const action = await input.question("Recording stopped. Enter retry to reload the script, or close to exit.\n");
    input.close();
    if (action.trim() !== "retry") throw error;
    const updated = await import("./ancla-calma-full.mjs?retry=" + Date.now());
    await updated.recordWalkthrough(page);
  }
}

async function recordDemo(page) {
  const origin = "https://ancla-calma.vercel.app";
  const go = async (route) => {
    await page.goto(origin + route);
    await installCursor(page);
    await page.waitForTimeout(1000);
    if (/\/(login|registro)/.test(new URL(page.url()).pathname)) throw new Error("Demo sign-in required.");
  };
  await go("/islas/faro");
  await page.getByRole("heading", { name: "Tu faro" }).waitFor();
  // Mask private fields in the page as well as in the reviewed video.
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = `
      #perfil-nombre, #perfil-email, #auxilio-nombre, #auxilio-telefono,
      li:has(a[href^="tel:"]) > span, li.w-20 a[href^="tel:"] { filter:blur(12px) }
    ` + (location.pathname === "/perfil" ? "h1, h1 + p { filter:blur(12px) }" : "");
    const attach = () => document.head.append(style);
    if (document.head) attach();
    else document.addEventListener("DOMContentLoaded", attach, { once: true });
  });
  await go("/");
  await recordPage({
    page, viewport: page.viewportSize(), out: "raw/ancla-calma-full.mp4",
    script: async ({ wait, hover, moveTo }) => {
      const start = performance.now();
      const mark = (chapter) => console.log(((performance.now() - start) / 1000).toFixed(2), chapter);
      const button = (name) => page.getByRole("button", { name, exact: typeof name === "string" });
      const tap = async (target) => {
        await hover(target, 350);
        await target.click();
        await wait(650);
      };
      const press = (name) => tap(button(name));
      mark("Choose your path");
      await wait(1600);
      await press("Comenzar");
      if (new URL(page.url()).pathname === "/idioma") await tap(page.getByText("Continuar en español"));
      await tap(page.getByText("Necesito ayuda", { exact: true }));
      await press(/Cambiar al tema de/);
      await wait(2000);
      await press(/Cambiar al tema de/);
      mark("Find support");
      await tap(page.getByText("Isla del Auxilio", { exact: true }));
      const addContact = button("Agregar contacto de confianza");
      if (await addContact.count()) {
        await press("Agregar contacto de confianza");
        await page.locator("#auxilio-nombre").fill("Contacto de ejemplo");
        await page.locator("#auxilio-telefono").fill("+12025550124");
        await press("Guardar");
        await page.locator('li.w-20 a[href^="tel:"]').first().waitFor();
      }
      await page.getByText("Líneas de apoyo profesional").scrollIntoViewIfNeeded();
      await wait(1800);
      mark("Breathe and ground yourself");
      await go("/islas/aire");
      await tap(page.getByText("Respira como las olas"));
      await moveTo(1180, 620);
      await wait(16500);
      await go("/islas/aire/puerto-seguro");
      for (const [name, steps, next] of [
        ["Ejercicios de grounding", 5, "Continuar"], ["Relajación muscular", 7, "Siguiente zona"],
        ["Ejercicios sensoriales", 4, "Continuar"],
      ]) {
        await tap(page.getByText(name, { exact: true }));
        for (let i = 1; i <= steps; i++) {
          await wait(1300);
          await press(i === steps ? "Finalizar" : next);
        }
        await page.getByRole("heading", { name: "Muy bien" }).waitFor();
        await wait(1200);
        await press("Finalizar");
      }
      mark("Build your lighthouse");
      await go("/islas/faro");
      await press(/Agregar herramienta/);
      await page.getByRole("textbox", { name: "Nombre de la herramienta" }).fill("Mirar las estrellas");
      await press("Agregar");
      await press(/Marcar Mirar las estrellas como favorita/);
      await wait(2000);
      mark("Keep a journal");
      await go("/bitacora");
      await press("Calma");
      await press("Siguiente");
      for (const line of ["Me siento en calma.", "Salí a caminar.", "Un descanso.", "Mirar el cielo."]) {
        await page.locator("textarea:visible").fill(line);
        await wait(800);
        await press("Siguiente");
      }
      // Pass a local spoken sample through the actual MediaRecorder, leaving the physical mic off.
      await page.evaluate((wav) => {
        navigator.mediaDevices.getUserMedia = async () => {
          const ctx = new AudioContext();
          await ctx.resume();
          const bytes = Uint8Array.from(atob(wav), (c) => c.charCodeAt(0));
          const source = ctx.createBufferSource();
          source.buffer = await ctx.decodeAudioData(bytes.buffer);
          const dest = ctx.createMediaStreamDestination();
          source.connect(dest);
          source.start();
          return dest.stream;
        };
      }, readFileSync("raw/ancla-note.wav").toString("base64"));
      await press(/Detalles adicionales/);
      await button("Detener grabación").waitFor();
      await wait(4300);
      await press("Detener grabación");
      await press("Guardar entrada");
      await page.getByText("Entrada guardada", { exact: true }).waitFor();
      await tap(page.getByRole("link", { name: "Ver historial" }));
      await page.getByRole("heading", { name: "Tu historial" }).waitFor();
      await wait(2000);
      mark("Recognise the signs");
      await go("/islas/senales");
      for (const name of ["Emocionales", "Físicas", "Cognitivas", "Conductuales"]) {
        await tap(page.getByText(name, { exact: true }).first());
        await wait(900);
      }
      mark("Support someone");
      await go("/acompanamiento");
      for (const name of ["Señales", "Guía", "Ahora"]) {
        await tap(page.getByRole("tab", { name }));
        await wait(1700);
      }
      mark("Your profile");
      await go("/perfil");
      await page.locator("#perfil-nombre").waitFor();
      await wait(2700);
      await go("/islas");
      await wait(2500);
      mark("End");
    },
  });
}
