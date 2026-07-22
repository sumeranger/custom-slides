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
        // Term 若躺在「還沒揭示的 v-click」祖先裡（GUIDE §6.19）：Slidev 把
        // `.slidev-vclick-hidden { opacity:0 !important; pointer-events:none !important }`
        // 蓋在那個祖先 element 上，不是蓋在 Term 自己身上——opacity 不會讓後代
        // 的「自己的」computed opacity 跟著變 0，所以 Playwright 的
        // `isVisible()`（只看元素自身）量不到，會誤判成「看得到」，接著對一個
        // pointer-events:none 祖先擋住的元素硬 hover，卡滿 30s timeout 把整支
        // 腳本炸掉（而不是照 GUIDE 說的「誤報 no-box」）。這裡用
        // `closest('.slidev-vclick-hidden')` 補一層祖先檢查，該拍本來就還沒
        // 揭示的 Term 直接跳過，不算 issue、也不去戳一個注定 hover 不到的元素。
        const hiddenByAncestor = await t.evaluate(
          (el) => el.closest(".slidev-vclick-hidden") !== null,
        );
        if (hiddenByAncestor) continue;
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
