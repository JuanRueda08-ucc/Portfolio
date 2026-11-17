// Lists the interactive elements of a page (to script a recording). Usage: node record/inspect.mjs <url>
import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(process.argv[2], { waitUntil: "networkidle" });
const els = await page.$$eval("a,button,input,select,[role=button],[onclick]", (els) =>
  els.map((e) => {
    const b = e.getBoundingClientRect();
    return `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.type ? "[" + e.type + "]" : ""}${e.accept ? "{" + e.accept + "}" : ""} "${(e.innerText || e.getAttribute("aria-label") || e.title || e.placeholder || "").trim().replace(/\s+/g, " ").slice(0, 40)}" @${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`;
  }),
);
console.log(els.join("\n"));
await browser.close();
