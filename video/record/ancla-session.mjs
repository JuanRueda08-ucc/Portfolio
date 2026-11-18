// The owner signs in before recording. Keep the demo session in this temporary
// browser context and never export cookies, tokens, traces or a storage state.
import { chromium } from "playwright-core";
import { createInterface } from "node:readline/promises";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

mkdirSync("raw", { recursive: true });
execFileSync("powershell.exe", ["-NoProfile", "-Command", `
  $ErrorActionPreference = 'Stop'
  Add-Type -AssemblyName System.Speech
  $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
  try {
    $voice.SetOutputToWaveFile([IO.Path]::GetFullPath('raw/ancla-note.wav'))
    $voice.Speak('Today I took a short walk and wrote in my journal.')
  } finally { $voice.Dispose() }
`]);

const browser = await chromium.launch({ channel: "chrome", headless: false });
const terminal = createInterface({ input: process.stdin, output: process.stdout });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-CO" });
  const page = await context.newPage();
  await page.goto("https://ancla-calma.vercel.app/islas/faro");
  await page.bringToFront();
  console.log("Demo browser ready. Recording is off.");
  await terminal.question("Press Enter after the owner confirms the demo account is signed in.\n");
  const { recordWalkthrough } = await import("./ancla-calma-full.mjs");
  await recordWalkthrough(page);
} finally {
  terminal.close();
  await browser.close();
}
