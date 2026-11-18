// Runs Chef Digital for a recording without touching the owner's setup:
// - the app's own out/ build, with runtime overrides (the main process reads process.env first):
//   CHEF_SUPABASE_* empty → no-account mode (decision 0018), CHEF_API_URL → our backend on :8799;
// - backend with the fake AI provider (no network, no Gemini key), started outside the repo so it
//   does not read the owner's .env;
// - Electron with its own --user-data-dir (empty profile) and CHEF_SIN_SONIDO=1 (silent).
import { _electron as electron } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { installCursor } from "./recorder.mjs";

export const CHEF = "D:/dev/assistant-chef-desktop";
const PORT = 8799;
const PROFILE = resolve("raw/chef-profile");
const SERVER_CWD = resolve("raw/chef-server");

export async function withChef(fn, { viewport = { width: 1440, height: 900 }, fresh = true } = {}) {
  mkdirSync(SERVER_CWD, { recursive: true });
  if (fresh) rmSync(PROFILE, { recursive: true, force: true });
  const server = spawn(
    process.execPath,
    [`${CHEF}/node_modules/tsx/dist/cli.mjs`, "--tsconfig", `${CHEF}/tsconfig.server.json`, `${CHEF}/server/src/principal.ts`],
    { cwd: SERVER_CWD, env: { ...process.env, PROVEEDOR_IA: "falso", SERVIDOR_PUERTO: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] },
  );
  await new Promise((ok, fail) => {
    const t = setTimeout(() => fail(new Error("backend did not start")), 30000);
    const on = (d) => {
      process.stdout.write(`[server] ${d}`);
      if (String(d).includes("Backend del chef")) (clearTimeout(t), ok());
    };
    server.stdout.on("data", on);
    server.stderr.on("data", on);
  });

  const app = await electron.launch({
    executablePath: `${CHEF}/node_modules/electron/dist/electron.exe`,
    args: [CHEF, `--user-data-dir=${PROFILE}`, "--force-device-scale-factor=1"],
    cwd: CHEF,
    env: {
      ...process.env,
      CHEF_SIN_SONIDO: "1",
      CHEF_API_URL: `http://localhost:${PORT}`,
      CHEF_SUPABASE_URL: "",
      CHEF_SUPABASE_CLAVE_PUBLICA: "",
    },
  });
  app.process().stderr.on("data", (d) => process.stderr.write(`[app] ${d}`));
  try {
    const userData = await app.evaluate(({ app }) => app.getPath("userData"));
    if (resolve(userData) !== PROFILE) throw new Error(`refusing to record: userData is ${userData}`);
    const page = await app.firstWindow();
    await app.evaluate(({ BrowserWindow }, { width, height }) => {
      const w = BrowserWindow.getAllWindows()[0];
      w.setContentSize(width, height);
      w.center();
    }, viewport);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    await installCursor(page);
    return await fn({ app, page, viewport });
  } finally {
    await app.close().catch(() => {});
    server.kill();
  }
}
