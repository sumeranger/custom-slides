// 檢查 chapters/*.md：每張 slide 都要有 notes（HTML 註解旁白）；
// 印出各頁 [click] 計數表，供對照該頁 v-click 拍數（advisory）。
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

let bad = 0;
const dir = "chapters";
for (const f of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
  const raw = readFileSync(join(dir, f), "utf8");
  // slide 分隔：行首 `---`（frontmatter 區塊成對出現，簡化處理：
  // 以 `\n---\n` 切段後，凡含非 frontmatter 內容的段視為一張 slide）
  const chunks = raw.split(/^---$/m);
  let slideNo = 0;
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i].trim();
    if (!c) continue;
    if (/^(layout|chapter|chapterTitle|eyebrow|src|title):/m.test(c) && !/^#|^</m.test(c))
      continue; // frontmatter 段
    slideNo++;
    const notes = c.match(/<!--([\s\S]*?)-->\s*$/);
    const clicks = notes ? (notes[1].match(/\[click(?::\d+)?\]/g) ?? []).length : 0;
    if (!notes) {
      console.log(`✗ ${f} 第 ${slideNo} 張 slide 缺 notes 旁白`);
      bad++;
    } else {
      console.log(`  ${f} slide ${slideNo}: [click] × ${clicks}`);
    }
  }
}
if (bad) {
  console.log(`\n${bad} 張 slide 缺旁白`);
  process.exit(1);
}
console.log("\nNOTES COVERAGE OK（[click] 數請對照各頁 v-click 拍數）");
