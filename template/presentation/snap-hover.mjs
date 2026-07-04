// 跳到指定步，hover 指定文字，截圖驗證 tooltip
import { chromium } from "playwright";

const URL = process.env.SNAP_URL ?? "http://localhost:5173/";
const CH = Number(process.env.SNAP_CH ?? 0);
const ST = Number(process.env.SNAP_ST ?? 0);
const TEXT = process.env.SNAP_TEXT ?? "";
const OUT = process.env.SNAP_OUT ?? "/home/hank/.claude/jobs/515d8840/tmp/hover.png";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(URL);
await page.waitForTimeout(500); // 等 app 寫入 cursor key
await page.evaluate(([ch, st]) => {
  const key = Object.keys(localStorage).find((k) => k.startsWith("presentation-cursor"));
  localStorage.setItem(key ?? "presentation-cursor-v1", JSON.stringify({ chapter: ch, step: st }));
}, [CH, ST]);
await page.reload();
await page.waitForTimeout(Number(process.env.SNAP_SETTLE ?? 6000));
const term = page.locator(".term", { hasText: TEXT }).first();
await term.hover();
await page.waitForTimeout(600);
await page.screenshot({ path: OUT });
await browser.close();
console.log("done", OUT);
