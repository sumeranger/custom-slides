// 逐步截圖：開頁 → 每步截一張（等動畫跑完）→ ArrowRight 推進
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.SNAP_URL ?? "http://localhost:5176/";
const STEPS = Number(process.env.SNAP_STEPS ?? 4);
const OUT = process.env.SNAP_OUT ?? "./.snap";
mkdirSync(OUT, { recursive: true });
const PREFIX = process.env.SNAP_PREFIX ?? "step";
const SETTLE = Number(process.env.SNAP_SETTLE ?? 5000);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(URL);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForTimeout(800);

for (let i = 0; i < STEPS; i++) {
  await page.waitForTimeout(SETTLE); // 等該步動畫播完
  await page.screenshot({ path: `${OUT}/${PREFIX}-${i}.png` });
  if (i < STEPS - 1) await page.keyboard.press("ArrowRight");
}
await browser.close();
console.log("done");
