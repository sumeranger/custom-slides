// 對指定頁/clicks/第 idx 個 .term hover 後截圖。
// 用法: SNAP_PAGE=4 SNAP_CLICKS=2 SNAP_TERM_IDX=0 node snap-hover.mjs out.png
import { chromium } from "playwright";

const URL = process.env.SNAP_URL ?? "http://localhost:3030";
const no = Number(process.env.SNAP_PAGE ?? 1);
const clicks = Number(process.env.SNAP_CLICKS ?? 0);
const idx = Number(process.env.SNAP_TERM_IDX ?? 0);
const out = process.argv[2] ?? "hover.png";

const browser = await chromium.launch();
// try/finally：確保就算 goto/hover/screenshot 中途拋錯，browser 仍會被關閉。
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`${URL}/${no}?clicks=${clicks}`);
  await page.waitForTimeout(1500);
  await page.locator(".term").nth(idx).hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: out });
  console.log(`saved ${out}`);
} finally {
  await browser.close();
}
