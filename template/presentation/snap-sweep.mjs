// 掃描全部 step 的 .term：逐一 hover，量測 tooltip 是否超出視窗邊界
import { chromium } from "playwright";

const URL = process.env.SNAP_URL ?? "http://localhost:5173/";
const STEPS = JSON.parse(process.env.SNAP_STEPS_JSON ?? "[[0,2]]"); // [[chapterIdx, stepCount], ...]
const W = 1920;
const H = 1080;
const MARGIN = 60;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const issues = [];

for (const [ch, count] of STEPS) {
  for (let st = 0; st < count; st++) {
    await page.goto(URL);
    await page.waitForTimeout(500);
    await page.evaluate(([c, s]) => {
      const key = Object.keys(localStorage).find((k) => k.startsWith("presentation-cursor"));
      localStorage.setItem(key ?? "presentation-cursor-v1", JSON.stringify({ chapter: c, step: s }));
    }, [ch, st]);
    await page.reload();
    await page.waitForTimeout(9000); // 等動畫全部落定
    const terms = page.locator(".term");
    const n = await terms.count();
    for (let i = 0; i < n; i++) {
      const t = terms.nth(i);
      if (!(await t.isVisible())) continue;
      const label = (await t.innerText()).split("\n")[0].slice(0, 30);
      await t.hover();
      await page.waitForTimeout(350);
      const tip = t.locator(".term-tip");
      const box = await tip.boundingBox();
      if (!box) {
        issues.push({ ch, st, label, problem: "no-box" });
        continue;
      }
      const probs = [];
      if (box.x < MARGIN) probs.push(`left ${Math.round(box.x)}`);
      if (box.x + box.width > W - MARGIN)
        probs.push(`right ${Math.round(box.x + box.width)}`);
      if (box.y < MARGIN) probs.push(`top ${Math.round(box.y)}`);
      if (box.y + box.height > H - MARGIN)
        probs.push(`bottom ${Math.round(box.y + box.height)}`);
      if (probs.length) issues.push({ ch, st, label, problem: probs.join(", ") });
      await page.mouse.move(W - 5, H - 5); // 移開
      await page.waitForTimeout(150);
    }
  }
}
await browser.close();
if (issues.length === 0) console.log("ALL TOOLTIPS OK");
else for (const i of issues) console.log(`ch${i.ch} step${i.st} [${i.label}] → ${i.problem}`);
