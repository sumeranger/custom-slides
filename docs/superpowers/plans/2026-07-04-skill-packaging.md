# 打包成 self-contained skill（Plan A）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把本 repo 重構成一個**可給別人標準安裝的 self-contained skill**：SKILL.md + references/ + template/ + example/，切斷所有 `/home/hank` 絕對路徑與 hank 專屬指涉，安裝＝把此目錄複製進使用者的 skills 路徑。

**Architecture:** 就地重構（本 repo 即最終 skill 本體，見 spec §A.1、目標「repo 載體淘汰」）。搬 `presentation/`→`template/presentation/`、`GUIDE-FOR-AI.md`→`references/GUIDE.md`，新增自足 `SKILL.md`，以去識別化的 2026-06 章節建 `example/`，並掃除所有絕對路徑/個人指涉。

**Tech Stack:** Markdown（SKILL/GUIDE/README）+ 既有 Vite/React 模板；驗證用 `tsc --noEmit`、`vite build`、`grep`。

**Testing approach（誠實揭露）:** 無單元測試框架。各 task 的「測試」＝ 對應的 `grep`（絕對路徑/專屬名清零）、`tsc --noEmit` + `npm run build`（模板從新路徑仍可建）、以及乾淨路徑複製後可建的 install 驗證。

## Global Constraints

- **不動 `docs/`**：`docs/superpowers/specs|plans` 是開發設計文件、**不隨 skill 發佈**，其中的絕對路徑不需清理。
- **shipped skill 檔案**（`SKILL.md`、`references/`、`template/`、`example/`）**零 `/home/hank` 絕對路徑、零 hank 個人指涉**（不得出現 "hank"、寫死的 `~/repo/...`）。
- **不改樣式主題規則**：`template/presentation/src/styles/` 既有規則不動。
- **SCRIPT.md / OUTLINE.md 屬 Plan C，不在本計劃**。本計劃的 `SKILL.md` / `GUIDE.md` 內容流程**暫指向 GUIDE 既有 §0**，並保留對 `web-video-presentation` 的既有指涉；Plan C 再吸收替換。
- **example 去識別化硬規**：`example/` 內**不得出現任何真實客戶/內部名**——包含但不限於：`ecs-ten`、`ecscore`、`ECS`、`doc-ai`、`約讀通`、`innovue`、`晶耀半導體`、`光寶`、`大同`、`寶島陽光`、任何內部 commit 數/issue 號。全部換成通用 placeholder。
- **example 發佈閘門**：去識別化後的 `example/` 必須經 hank 目視確認無殘留，才算可發佈（記為驗收項，非自動可判）。
- Node 20+/既有 `package.json` 版本底不變。

---

### Task 1: 搬 `presentation/` → `template/presentation/`

**Files:**
- Move: `presentation/` → `template/presentation/`（整個目錄，git mv）

**Interfaces:**
- Produces: 模板新根為 `template/presentation/`；後續 SKILL.md/GUIDE.md/README 以此路徑指涉。

- [ ] **Step 1: git mv 整個 presentation 目錄**

```bash
git mv presentation template/presentation 2>/dev/null || { mkdir -p template && git mv presentation template/presentation; }
```
（`node_modules` 為 gitignore、不受 git mv 影響；若殘留舊 `presentation/node_modules` 空殼，忽略即可。）

- [ ] **Step 2: 確認模板從新路徑仍可建**

```bash
cd template/presentation && npm install && npx tsc --noEmit && npm run build
```
Expected: install/tsc/build 皆 0 錯誤（vite/tsconfig 內部路徑皆相對於 `presentation/`，整體搬移不破壞）。

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "refactor(skill): 搬 presentation/ → template/presentation/（skill 目錄結構）"
```

---

### Task 2: 遷移 `GUIDE-FOR-AI.md` → `references/GUIDE.md` + 去絕對路徑

**Files:**
- Move: `GUIDE-FOR-AI.md` → `references/GUIDE.md`
- Modify: `references/GUIDE.md`（去絕對路徑 + 去個人指涉）

**Interfaces:**
- Consumes: Task 1 的 `template/presentation/` 路徑。
- Produces: `references/GUIDE.md`（skill 相對），供 SKILL.md 指向。

- [ ] **Step 1: git mv + 建 references/**

```bash
mkdir -p references && git mv GUIDE-FOR-AI.md references/GUIDE.md
```

- [ ] **Step 2: 去絕對路徑與個人指涉（精確替換）**

在 `references/GUIDE.md` 做下列替換（原文見遷移前內容）：

1. 開頭段（原述「與 `may-monthly-report`、`headroom-slides` 同款」）→ 改為「與 `2026-06-monthly-report` 同款（唯一視覺/互動基準）」。
2. 成功範例行 `> 成功範例（卡住時去翻實際代碼）：` `/home/hank/repo/headroom-slides/` → 改為 `` `example/`（本 skill 內建的去識別化參考章節） ``。
3. §1 起專案的 `cp -r /home/hank/repo/paper-grid-slides-template/presentation <新專案>/presentation` → 改為（skill 相對，`GUIDE.md` 在 `references/`，模板在 `../template/`）：
   ```bash
   cp -r "<skill 根>/template/presentation" <新專案>/presentation
   ```
   並加一行說明：「`<skill 根>` = 本 skill 安裝所在目錄（含 `SKILL.md` 的那層）。」
4. §0 對 `web-video-presentation` skill 的指涉：**保留不動**（Plan C 再處理）。

- [ ] **Step 3: 驗證無絕對路徑/個人指涉殘留**

```bash
grep -n "/home/hank\|headroom-slides\|may-monthly-report\|\bhank\b" references/GUIDE.md
```
Expected: 無輸出（`web-video-presentation` 指涉允許保留，不在此 grep 內）。

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "refactor(skill): GUIDE-FOR-AI → references/GUIDE.md + 去絕對路徑/個人指涉"
```

---

### Task 3: 去絕對路徑 — `snap*.mjs` 的 `SNAP_OUT` 預設

**Files:**
- Modify: `template/presentation/snap.mjs`、`snap-one.mjs`、`snap-hover.mjs`

**Interfaces:**
- Produces: snap 腳本預設輸出改為相對/暫存路徑，別人機器可用。

- [ ] **Step 1: 找出各檔的絕對路徑預設**

```bash
grep -n "/home/hank" template/presentation/snap*.mjs
```
Expected: 三檔各一行，形如 `const OUT = process.env.SNAP_OUT ?? "/home/hank/.claude/jobs/515d8840/tmp/one.png";`（各檔檔名可能不同：one.png / 或其序列輸出目錄）。

- [ ] **Step 2: 改為相對預設**

把每個 `?? "/home/hank/.claude/jobs/.../<name>"` 改為 `?? "./.snap/<name>"`（相對於 `template/presentation/`），並在檔案開頭建立該目錄，例如 snap-one.mjs：
```js
import { mkdirSync } from "node:fs";
const OUT = process.env.SNAP_OUT ?? "./.snap/one.png";
mkdirSync(new URL("./.snap/", import.meta.url), { recursive: true });
```
（其餘 snap 檔比照：多步截圖的輸出目錄預設改 `./.snap/`。）把 `.snap/` 加入 `template/presentation/.gitignore`。

- [ ] **Step 3: 驗證**

```bash
grep -n "/home/hank" template/presentation/snap*.mjs   # 期望：無輸出
grep -n ".snap" template/presentation/.gitignore        # 期望：命中
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "refactor(skill): snap 腳本 SNAP_OUT 預設改相對路徑（去絕對路徑）"
```

---

### Task 4: 建 `example/` — 去識別化的 01-doc-ai 參考章節

**Files:**
- Create: `example/01-doc-ai/`（`.tsx` / `.css` / `narrations.ts`，去識別化自 `/home/hank/repo/2026-06-monthly-report/presentation/src/chapters/01-doc-ai/`）
- Create: `example/README.md`（說明這是「參考章節、供閱讀」，非可獨立執行的 app）

**Interfaces:**
- Produces: `example/` 供 GUIDE/SKILL 指向，取代舊 headroom-slides 絕對路徑。

- [ ] **Step 1: 複製來源章節到 example/**

```bash
mkdir -p example/01-doc-ai
cp /home/hank/repo/2026-06-monthly-report/presentation/src/chapters/01-doc-ai/{DocAi.tsx,DocAi.css,narrations.ts} example/01-doc-ai/
```

- [ ] **Step 2: 全面去識別化（Global Constraints 的硬規清單）**

在 `example/01-doc-ai/` 的三個檔案裡，把所有真實/內部名替換為通用 placeholder（一致對應）：
- `ecs-ten` → `系統 A`；`doc-ai` → `文件 AI 服務`；`約讀通` → `文件助手`（按語境選）；`ecscore`/`ECS`/`innovue` → 通用詞或移除。
- 任何客戶名（`晶耀半導體`/`光寶`/`大同`/`寶島陽光`）→ 通用（`某客戶`/移除）。
- 內部 commit 數/issue 號 → 通用示意值或移除。
逐檔通讀 narration 與畫面文字，確保語義仍通順且是**通用架構流程示範**。

- [ ] **Step 3: 寫 example/README.md**

內容說明：這是從真實月報去識別化而來的**參考章節**，示範 paper-grid 的章節慣例（step 純函數、Term tooltip、逐步揭示、CSS 動畫）；供開發時對照閱讀（等同舊 headroom-slides 的角色）；要實際跑，把它放進 `template/presentation/src/chapters/` 並註冊。

- [ ] **Step 4: 驗證去識別化清零**

```bash
grep -rniE "ecs-ten|ecscore|\bECS\b|doc-ai|約讀通|innovue|晶耀半導體|光寶|大同|寶島陽光|hank" example/
```
Expected: **無輸出**。（本 grep 為機器閘；最終仍需 hank 目視確認——見發佈閘門。）

- [ ] **Step 5: Commit**

```bash
git add example/ && git commit -m "feat(skill): 加入去識別化的 example 參考章節（取自 2026-06 01-doc-ai）"
```

---

### Task 5: 自足 `SKILL.md`（repo 根）

**Files:**
- Create: `SKILL.md`（repo 根）

**Interfaces:**
- Consumes: `references/GUIDE.md`（Task 2）、`template/presentation/`（Task 1）、`example/`（Task 4）。
- Produces: skill 進入點。

- [ ] **Step 1: 寫 SKILL.md（完整內容，skill 相對、去個人化）**

```markdown
---
name: paper-grid-slides
description: Use when asked to make a slide deck / presentation / 簡報 / slides for any topic, especially the paper-grid style (warm cream paper + terracotta + editorial serif + blueprint grid), click-driven web presentations with step-by-step reveal, or hover tooltips for terms and source quotes.
---

# paper-grid-slides

點擊驅動網頁簡報的標準產線：暖紙編輯風（paper-grid）+ 逐步揭示 + hover tooltip
（術語全稱 / 引言原文出處）。本 skill 自足，安裝後不需其他外掛。

## 怎麼做

1. **讀完整手冊**：`references/GUIDE.md` —— 內容流程、章節鐵則、Term tooltip 規範、
   驗證腳本，全部在那裡。
2. **起專案**：複製 `template/presentation/` 到新 repo（GUIDE §1），
   `npm install && npm run dev`。不要重新 scaffold、不要改 `styles/`。
3. **參考範例**：`example/`（去識別化的實作章節，示範全部慣例，卡住時去翻）。

## 硬性提醒

- **這是投影片，不是筆電上看的**：字級一律從 `base.css` 投影字級階挑
  （`--t-display/h1/h2/h3/lead/body/label/micro`），禁自創隨意 px；最小字 ≥20px、
  body ≥26px、label/pill/眉題 ≥22px。章節開場用「段落編號眉題 + 主題大標」。
  痛點→解法型簡報用 `PhaseTag`（問題✕/解法✓）。詳見 GUIDE §6.1/6.11/6.12。
- 畫面上每個數字都要有 `article.md` 出處，禁捏造；引言原文須逐字查證。
- 非常識縮寫與查證過的原文一律加 `<Term>` hover tooltip；靠舞台邊緣記得
  `align="start"/"end"`，完成後跑 `snap-sweep.mjs` 要 ALL TOOLTIPS OK。
- 第 1 章先做完給使用者驗收再繼續；每章完成跑 `tsc --noEmit` + 逐步截圖目測。
```

- [ ] **Step 2: 驗證無個人化/絕對路徑**

```bash
grep -niE "/home/hank|\bhank\b|headroom-slides|may-monthly-report" SKILL.md
```
Expected: 無輸出。

- [ ] **Step 3: Commit**

```bash
git add SKILL.md && git commit -m "feat(skill): 自足 SKILL.md（skill 相對路徑、去個人化 description）"
```

---

### Task 6: 更新 `README.md`

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces: 人類視角的 skill 說明（非 template repo）。

- [ ] **Step 1: 改寫 README（人類向）**

把「模板 repo」框架改為「skill」：
- 開頭視覺描述的「沿襲 may-monthly-report / headroom-slides」→「沿襲 2026-06-monthly-report」。
- 「給 AI agent」段指向 `references/GUIDE.md`（原指 GUIDE-FOR-AI.md）。
- 「給人類」的複製指令改 `cp -r template/presentation ~/repo/<my-slides>/presentation`。
- 「內含」表路徑更新：`presentation/` → `template/presentation/`；新增 `SKILL.md`、`references/`、`example/` 列。

- [ ] **Step 2: 驗證**

```bash
grep -niE "/home/hank|headroom-slides|may-monthly-report" README.md   # 期望：無輸出
```

- [ ] **Step 3: Commit**

```bash
git add README.md && git commit -m "docs(skill): README 改為 skill 框架 + 路徑/參考更新"
```

---

### Task 7: 乾淨安裝驗證

**Files:**
- （無檔案改動；純驗證）

- [ ] **Step 1: 複製 skill 到乾淨路徑並建模板**

```bash
DEST=$(mktemp -d)/paper-grid-slides
mkdir -p "$DEST"
# 只複製 shipped skill 檔（排除 docs/、.git、node_modules、.claude）
rsync -a --exclude='.git' --exclude='docs' --exclude='node_modules' --exclude='.claude' ./ "$DEST"/
cd "$DEST/template/presentation" && npm install && npx tsc --noEmit && npm run build
echo "install-check OK at $DEST"
```
Expected: 從乾淨路徑複製後，模板仍 install/tsc/build 0 錯誤。

- [ ] **Step 2: 掃描 shipped 檔零絕對路徑/個人化/內部名**

```bash
grep -rniE "/home/hank|\bhank\b|headroom-slides|may-monthly-report" SKILL.md references/ README.md
grep -rniE "ecs-ten|ecscore|\bECS\b|doc-ai|約讀通|innovue|晶耀半導體|光寶|大同|寶島陽光" example/ SKILL.md references/
```
Expected: 兩者皆**無輸出**（`references/GUIDE.md` 對 `web-video-presentation` 的指涉允許存在，不在此二 grep 命中範圍）。

- [ ] **Step 3: 發佈閘門（人工）**

請 hank 目視 `example/` 去識別化結果，確認無任何殘留真實客戶/內部名，才算可發佈。此為人工驗收，不可由 grep 完全取代。

- [ ] **Step 4: 清理暫存**

```bash
rm -rf "$(dirname "$DEST")"
```

---

## Self-Review

**Spec coverage（對照 spec §A）:**
- A.1 目錄結構（SKILL.md + references/ + template/ + example/）→ Task 1/2/4/5 建齊。✓
- A.2 去絕對路徑（GUIDE 2 處、snap、headroom→example、web-video→C）→ Task 2/3 + Global Constraints（web-video 留 C）。✓
- A.3 安裝＝複製進 skills 路徑；marketplace 二階段（不做）→ Task 7 install 驗證；marketplace 未列入。✓
- A.4 起專案流程 → GUIDE.md（Task 2）+ SKILL.md（Task 5）描述。✓
- 目標「repo 載體淘汰、skill 唯一存活」→ 就地重構；退役時機屬整合後決定（不在本計劃硬做）。✓
- example 從 2026-06 取一章 + 去識別化 → Task 4 + 發佈閘門。✓

**Placeholder scan:** 無 TBD/TODO。SKILL.md 給完整內容；GUIDE/README/snap 給精確 old→new 替換點；example 給來源路徑 + 去識別化硬規清單 + 雙重閘（grep + 人工）。唯一「非死程式碼」處：example 去識別化的實際替換字是內容判斷，已給明確對應規則與 placeholder 命名，非空泛占位。

**Type/path consistency:** `template/presentation/`（Task 1）在 GUIDE(2)、SKILL(5)、README(6)、install 驗證(7) 一致；`references/GUIDE.md`（Task 2）在 SKILL(5)、README(6) 一致；`example/`（Task 4）在 GUIDE(2)、SKILL(5) 一致。

**依賴/風險:**
- Task 1 的大目錄搬移後，其餘 task 皆以新路徑操作——順序不可顛倒。
- 遷移期間 hank 現有 live install（`~/.claude/skills/paper-grid-slides/SKILL.md`，指向舊絕對路徑）會失效；**合併後需以本 skill 取代 live install**（整合步驟，不在本計劃 task 內）。
- SCRIPT.md/OUTLINE.md 缺席：SKILL/GUIDE 暫用既有 §0 內容流程；Plan C 補齊並更新指涉。
