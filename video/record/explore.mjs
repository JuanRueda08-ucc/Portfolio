// Screenshots every route of a site, to plan a recording. Usage: node record/explore.mjs <baseUrl> <outDir> <route...>
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const [base, out, ...routes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const r of routes) {
  await page.goto(base + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const name = r.replace(/\W+/g, "_") || "home";
  await page.screenshot({ path: `${out}/${name}.png` });
  const buttons = await page.$$eval("a,button", (els) =>
    els.map((e) => (e.innerText || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ")).filter(Boolean),
  );
  console.log(r, "→", page.url(), "|", buttons.slice(0, 14).join(" · "));
}
await browser.close();
