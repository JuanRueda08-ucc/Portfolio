// Screenshots of Chef Digital's first screens + their buttons, to plan the recording.
import { mkdirSync } from "node:fs";
import { withChef } from "./chef-app.mjs";

const out = "raw/chef-explore";
mkdirSync(out, { recursive: true });

const clicks = process.argv.slice(2).filter((a) => !a.startsWith("--"));
await withChef(async ({ page }) => {
  const shot = async (name) => {
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${out}/${name}.png` });
    const els = await page.$$eval("button,a,input,textarea,[role=button],[role=tab]", (els) =>
      els
        .filter((e) => e.getBoundingClientRect().width > 0)
        .map((e) => (e.innerText || e.getAttribute("aria-label") || e.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 40))
        .filter(Boolean),
    );
    console.log(`[${name}]`, els.join(" · "));
  };
  await shot("00");
  // Follow a path of button texts given on the command line.
  for (const [i, label] of clicks.entries()) {
    const target = label.startsWith("type:")
      ? null
      : page.getByRole("button", { name: label }).or(page.getByText(label, { exact: true })).first();
    if (label.startsWith("type:")) {
      await page.keyboard.type(label.slice(5), { delay: 30 });
      await page.keyboard.press("Enter");
    } else await target.click({ timeout: 20000 });
    await shot(String(i + 1).padStart(2, "0"));
  }
});
