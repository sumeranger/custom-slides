// 跳到指定章節/步，等動畫完整跑完後截一張
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const URL = process.env.SNAP_URL ?? "http://localhost:5173/";
const CH = Number(process.env.SNAP_CH ?? 0);
const ST = Number(process.env.SNAP_ST ?? 0);
const OUT = process.env.SNAP_OUT ?? "./.snap/one.png";
mkdirSync(dirname(OUT), { recursive: true });
const SETTLE = Number(process.env.SNAP_SETTLE ?? 10000);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(URL);
await page.waitForTimeout(500); // 等 app 寫入 cursor key
await page.evaluate(([ch, st]) => {
  const key = Object.keys(localStorage).find((k) => k.startsWith("presentation-cursor"));
  localStorage.setItem(key ?? "presentation-cursor-v1", JSON.stringify({ chapter: ch, step: st }));
}, [CH, ST]);
await page.reload();
await page.waitForTimeout(SETTLE);
await page.screenshot({ path: OUT });
await browser.close();
console.log("done", OUT);
