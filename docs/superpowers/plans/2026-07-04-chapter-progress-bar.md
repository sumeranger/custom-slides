# 章節進度條（改造 ProgressBar 就地演進）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把既有 `ProgressBar` 從「hover 才出現的深色細條」演進成「常駐、亮色暖紙、投影可讀」的底部章節進度條，對齊參考圖，並移除殘留的第三方 GitHub 連結。

**Architecture:** 不新增元件（DRY）。`ProgressBar.tsx` 已是點擊跳章的章節 bar（章節膠囊 + 高亮 + `onJumpChapter` + 步驟 pips + 溢出橫捲 + 自動捲入視野），只改「可見性 / 樣式 / 字級 / 去品牌化」。改動集中在 `components/ProgressBar.tsx` 與 `components/ProgressBar.css` 兩檔，不動 `styles/`。

**Tech Stack:** React 19 + Vite 8 + TypeScript；驗證用 `tsc --noEmit`、`vite build`、`playwright`（`snap-one.mjs`）。

**Testing approach（誠實揭露）:** 本 repo 無單元測試框架（`package.json` 無 vitest/jest），既有驗證模式為 type-check + 嚴格 build + playwright 截圖目測。故本計劃每個 task 的「測試」= 先截「缺陷現況」圖 → 改 → 截「修正後」圖比對 + `tsc`/`build` 為零錯誤閘，忠於既有慣例。

## Global Constraints

- 只改 `presentation/src/components/ProgressBar.tsx` 與 `ProgressBar.css`；**不動 `src/styles/` 任何檔案**。
- 顏色**一律走 token**（`--surface-2`/`--surface-3`/`--text-2`/`--accent`/`--accent-soft`/`--text-faint`），**禁硬寫色碼**（拔掉現況的 `rgba(0,0,0,0.85)`）。
- 字級守**投影地板**：章名/編號用 `var(--t-label)`（22px），不得 <22px（拔掉現況 `11px`）。
- **去品牌化**：移除寫死的 `ConardLi/garden-skills` GitHub 連結（DOM + 樣式 + prop）。
- **不** bump `useStepper` 的 `STORAGE_KEY`（不改章節/步數結構）。
- 跳章互動保留不動：容器 `data-no-advance` + 各按鈕 `e.stopPropagation()`（翻頁不誤觸）。
- 執行前置：worktree 已 `npm install`；dev server 已起（`npm run dev`，預設 port 5173，不同則帶 `SNAP_URL`）；example 章節（`01-example`，2 步）在。

---

### Task 1: 去品牌化 — 移除 garden-skills GitHub 連結

**Files:**
- Modify: `presentation/src/components/ProgressBar.tsx`
- Modify: `presentation/src/components/ProgressBar.css`

**Interfaces:**
- Consumes: `App.tsx` 目前呼叫 `<ProgressBar chapters={CHAPTERS} cursor={stepper.cursor} onJumpChapter={stepper.jumpToChapter} />`——**未傳 `githubUrl`**，故移除該 prop 不影響 `App.tsx`。
- Produces: `ProgressBar` 的 `Props` 僅剩 `{ chapters: ChapterDef[]; cursor: { chapter: number; step: number }; onJumpChapter(idx: number, step?: number): void }`。

- [ ] **Step 1: 截現況圖確認 GitHub 圖示存在（缺陷現況）**

Run（先 hover 觸發才看得到，暫時用既有 hover 行為截）:
```bash
cd presentation && SNAP_CH=0 SNAP_ST=0 SNAP_SETTLE=1200 node snap-one.mjs
```
Expected: 產出截圖；bar 右下角有 GitHub 貓圖示（待移除的品牌殘留）。

- [ ] **Step 2: 從 `ProgressBar.tsx` 移除 GitHub 連結相關程式**

移除以下四處：

1. 常數（原 16–17 行）：
```tsx
const DEFAULT_GITHUB_URL =
  "https://github.com/ConardLi/garden-skills";
```
2. `Props` 內的 `githubUrl` 欄位與其上方註解（原 9–13 行的 `/** Optional GitHub link ... */` 與 `githubUrl?: string | null;`）。
3. 解構參數 `githubUrl = DEFAULT_GITHUB_URL,`（原 35 行）。
4. 整段 GitHub `<a>` 區塊（原 84–106 行的 `{githubUrl && ( ... )}`）。

改完後 `ProgressBar.tsx` 的回傳結構為（完整）：
```tsx
  return (
    <div className="pb-hover" data-no-advance>
      <div className="pb">
        {chapters.map((c, i) => {
          const isActive = i === cursor.chapter;
          return (
            <button
              key={c.id}
              ref={isActive ? activeRef : undefined}
              className={`pb-chapter ${isActive ? "pb-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onJumpChapter(i, 0);
              }}
            >
              <span className="pb-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="pb-title">{c.title}</span>
              {isActive && (
                <div className="pb-pips">
                  {Array.from({ length: c.narrations.length }, (_, s) => (
                    <span
                      key={s}
                      className={`pb-pip ${s <= cursor.step ? "pb-pip-on" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpChapter(i, s);
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
```
且 `Props` 改為：
```tsx
interface Props {
  chapters: ChapterDef[];
  cursor: { chapter: number; step: number };
  onJumpChapter(idx: number, step?: number): void;
}
```
函式簽名改為：
```tsx
export function ProgressBar({ chapters, cursor, onJumpChapter }: Props) {
```

- [ ] **Step 3: 從 `ProgressBar.css` 移除 `.pb-github*` 規則**

刪除四條規則（原 93–122 行）：`.pb-github`、`.pb-github:hover`、`.pb-hover:hover .pb-github`、`.pb-github svg`。

- [ ] **Step 4: type-check + 嚴格 build（抓未使用 import / 殘留符號）**

Run:
```bash
cd presentation && npx tsc --noEmit && npm run build
```
Expected: 兩者皆 0 錯誤（`build` 比 tsc 嚴格，會抓出任何殘留的未使用符號）。

- [ ] **Step 5: 截圖確認 GitHub 圖示已消失**

Run:
```bash
cd presentation && SNAP_CH=0 SNAP_ST=0 SNAP_SETTLE=1200 node snap-one.mjs
```
Expected: bar 右下角不再有 GitHub 圖示；章節膠囊與跳章仍在。

- [ ] **Step 6: Commit**

```bash
git add presentation/src/components/ProgressBar.tsx presentation/src/components/ProgressBar.css
git commit -m "refactor(progressbar): 移除殘留的 garden-skills GitHub 連結（去品牌化）"
```

---

### Task 2: 常駐 + 亮色暖紙 + 投影字級

**Files:**
- Modify: `presentation/src/components/ProgressBar.css`

**Interfaces:**
- Consumes: token（`--surface-2 #fbf6e8`/`--surface-3 #ece1c5`/`--text-2 #3d2f25`/`--accent #b53d22`/`--accent-soft`/`--text-faint #b3a78e`）與字級（`--t-label 22px`）、動效（`--dur-quick`）皆已定義於 `styles/`，直接引用。
- Produces: 常駐、亮色、投影可讀的章節 bar；無新增 props / 匯出。

- [ ] **Step 1: 截現況圖確認缺陷（hover 才現、深色、字太小）**

Run:
```bash
cd presentation && SNAP_CH=0 SNAP_ST=0 SNAP_SETTLE=1200 node snap-one.mjs
```
Expected: 非 hover 狀態下 bar **看不到**（`opacity:0`）；hover 下為深色小字（11px）——即待修缺陷。

- [ ] **Step 2: 改寫 `ProgressBar.css`（常駐 + 亮色 + 22px）**

把 `.pb-hover` 到 `.pb-pip-on` 之間的規則整段替換為（`.pb-github*` 已於 Task 1 移除，不應存在）：
```css
.pb-hover {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: auto;
}
.pb {
  background: var(--surface-2);
  border: 1px solid var(--surface-3);
  border-bottom: none;
  padding: 10px 20px;
  border-radius: 12px 12px 0 0;
  display: flex;
  gap: 8px;
  /* 常駐：不再 hover 才顯示。溢出時橫向捲動而非擠壓。 */
  max-width: calc(100vw - 32px);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--text-faint) transparent;
  box-shadow: 0 -2px 12px rgba(26, 19, 16, 0.08);
}
.pb::-webkit-scrollbar {
  height: 4px;
}
.pb::-webkit-scrollbar-track {
  background: transparent;
}
.pb::-webkit-scrollbar-thumb {
  background: var(--text-faint);
  border-radius: 2px;
}

.pb-chapter {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-2);
  padding: 6px 14px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: var(--t-label);
  cursor: pointer;
  transition: color var(--dur-quick), background var(--dur-quick),
    border-color var(--dur-quick);
}
.pb-chapter:hover {
  color: var(--accent);
}
.pb-active {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.pb-num {
  color: var(--accent);
  font-weight: 600;
}

.pb-pips {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  margin-left: 8px;
}
.pb-pip {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-faint);
  cursor: pointer;
  transition: background var(--dur-quick);
}
.pb-pip-on {
  background: var(--accent);
}
```

要點：移除了 `.pb` 的 `opacity:0` / `transform: translateY(100%)` / `backdrop-filter` 與 `.pb-hover:hover .pb` 規則（→ 常駐）；深色底改 `--surface-2`；字級 `11px → var(--t-label)`；固定 `height:60px` 從 `.pb-hover` 移除（改由內容高度撐開）；顏色全走 token。

- [ ] **Step 3: type-check + build**

Run:
```bash
cd presentation && npx tsc --noEmit && npm run build
```
Expected: 0 錯誤。

- [ ] **Step 4: 截圖目測（常駐 / 亮色 / 22px / 當前章高亮）**

Run（step 0 與 step 1 各截一張，確認高亮隨當前章走）:
```bash
cd presentation && SNAP_CH=0 SNAP_ST=0 SNAP_SETTLE=1200 node snap-one.mjs
cd presentation && SNAP_CH=0 SNAP_ST=1 SNAP_SETTLE=1200 node snap-one.mjs
```
逐張確認：
- bar **無需 hover 即常駐**於底部；
- 亮色暖紙底、字為深色、章名 ≥22px 清晰可讀；
- 當前章膠囊 terracotta 高亮（accent 邊框 + soft 底 + accent 字）；
- 步驟 pips 隨 step 亮起（step 1 圖應比 step 0 多一顆亮 pip）；
- **bottom 常駐 bar 未遮住畫面底部內容**（尤其右下出處行）。若被遮，記為後續調整項（例如給 stage 內容底部留白），不在本 task 修。

- [ ] **Step 5: 驗證跳章不誤翻頁**

用 playwright 點一顆非當前章膠囊，確認跳到該章 step 0、且沒有因點擊而多前進一步（`data-no-advance` + `stopPropagation` 生效）。可用既有 `snap-hover.mjs` 或臨時 playwright 片段；核對截圖游標所在章成為 active 且 step=0。

- [ ] **Step 6: Commit**

```bash
git add presentation/src/components/ProgressBar.css
git commit -m "feat(progressbar): 常駐 + 亮色暖紙 + 投影字級（對齊參考圖章節 bar）"
```

---

## Self-Review

**Spec coverage（對照 spec §B）:**
- B.0 探勘修正（改造而非新建）→ 全計劃基於此，Task 1+2 就地改 ProgressBar。✓
- B.1 常駐 / 點章跳轉 / pips 保留 → Task 2 常駐、Task 1 保留跳章、pips 於 Task 2 改亮色。✓
- B.2 資料來源不變、無新 props → Task 1 只減不加 props。✓
- B.3 只改 ProgressBar.css、走 token、字級地板、移除 github → Task 1（github）+ Task 2（token/字級/常駐）。✓
- B.4 不 bump STORAGE_KEY → Global Constraints 明列，無 task 觸及。✓

**Placeholder scan:** 無 TBD/TODO；CSS/TSX 均給完整內容；命令均具體且有 Expected。占位風險：Step 5 的跳章驗證未給死程式碼（因 repo 無現成點擊腳本）——已註明「用既有 snap-hover.mjs 或臨時 playwright 片段」並給出核對標準，非空泛占位。

**Type consistency:** `onJumpChapter(idx: number, step?: number)` 於 Props、`App.tsx` 呼叫、button `onClick` 三處一致；`cursor: { chapter: number; step: number }` 與 `useStepper` 的 `Cursor` 一致。✓

**已知風險（交付時留意）:** 22px × 6–7 章可能超出 1920 寬 → 橫捲 + 自動捲入視野（既有行為承接）；常駐 bar 可能遮擋 stage 底部內容 → Task 2 Step 4 列為目測項，若發生記後續。
