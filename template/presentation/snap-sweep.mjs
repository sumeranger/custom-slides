// 掃描指定頁面全部 click 狀態的 .term：逐一 hover，量測 tooltip 是否超出安全邊界。
// SNAP_STEPS_JSON: [[頁碼, clicks總數], ...]（clicks總數 = 該頁 [click] 拍數，0 表示無揭示）
import { chromium } from "playwright";

const URL = process.env.SNAP_URL ?? "http://localhost:3030";
const STEPS = JSON.parse(process.env.SNAP_STEPS_JSON ?? "[[2,0],[3,0],[4,3]]");
const W = 1920;
const H = 1080;
const MARGIN = 60;

const browser = await chromium.launch();
// try/finally：中途任何一步拋錯（頁面等不到、locator 逾時…）都要確保
// browser.close() 有跑到，不讓 chromium process 孤兒殘留。
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const issues = [];

  for (const [no, clicks] of STEPS) {
    for (let c = 0; c <= clicks; c++) {
      await page.goto(`${URL}/${no}?clicks=${c}`);
      await page.waitForTimeout(1500); // 等入場動畫落定（URL 直達，無需舊版 9 秒）
      const terms = page.locator(".term");
      const n = await terms.count();
      for (let i = 0; i < n; i++) {
        const t = terms.nth(i);
        if (!(await t.isVisible())) continue;
        const label = (await t.innerText()).split("\n")[0].slice(0, 30);
        await t.hover();
        await page.waitForTimeout(350);
        const tip = page.locator(".v-popper__popper:not(.v-popper__popper--hidden)");
        const box = await tip.boundingBox().catch(() => null);
        if (!box) {
          issues.push({ no, c, label, problem: "no-box" });
          continue;
        }
        const probs = [];
        if (box.x < MARGIN) probs.push(`left ${Math.round(box.x)}`);
        if (box.x + box.width > W - MARGIN) probs.push(`right ${Math.round(box.x + box.width)}`);
        if (box.y < MARGIN) probs.push(`top ${Math.round(box.y)}`);
        if (box.y + box.height > H - MARGIN) probs.push(`bottom ${Math.round(box.y + box.height)}`);
        if (probs.length) issues.push({ no, c, label, problem: probs.join(", ") });
        await page.mouse.move(W - 5, H - 5);
        await page.waitForTimeout(150);
      }
    }
  }
  if (issues.length === 0) console.log("ALL TOOLTIPS OK");
  else for (const i of issues) console.log(`p${i.no} clicks${i.c} [${i.label}] → ${i.problem}`);
} finally {
  await browser.close();
}
