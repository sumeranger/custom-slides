# Slidev 遷移（Phase 0 + Phase 1）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `template/presentation/` 從自製 React+Vite 簡報框架換成 Slidev（Vue），保留 Term tooltip / 多主題 / 截圖驗證三大招牌能力，並依 spec 留下 phase-2 音頻擴充縫。

**Architecture:** 混合式寫作模型（MD 骨架 + 專案內建 Vue 元件庫，複雜頁寫整頁畫布元件）；不發 npm 包，全靠 Slidev 專案級約定（`components/`、`layouts/`、`styles/`、`global-*.vue` 自動載入）。旁白 = presenter notes + `[click]` 標記；Term = floating-vue 包裝。Spec：`docs/superpowers/specs/2026-07-12-slidev-migration-design.md`。

**Tech Stack:** Slidev（`@slidev/cli` ^52.17.0）、Vue 3.5、floating-vue ^5、Playwright、vue-tsc。

## Global Constraints

- Slidev 鎖 `@slidev/cli@^52.17.0`；套件管理一律 npm（舊 template 目錄刪除時一併帶走未追蹤的 `bun.lock`）。
- headmatter `canvasWidth: 1920`——字級鐵則的 px 語意不變：最小字 ≥20px、body ≥26px、label/pill/眉題 ≥22px。
- 主題換皮機制不變：`themes/<id>/{tokens.css,extras.css}` 複製進專案；載入順序 fonts → tokens → base → 元件 css → animations → extras（extras 永遠最後）。
- `data-no-advance` 語意全域保留：帶此屬性的元素（及 button/a/input）點擊不推進。
- 所有文件與註解一律繁體中文；程式識別字英文。
- **執行環境**：先用 superpowers:using-git-worktrees 開隔離 worktree（分支名 `slidev-migration`）；Phase 1 第一個 task 先在遷移前的 HEAD 打 tag `react-final`；全部完成後 `git merge --no-ff` 回 main（使用者全域偏好）。
- 每個 task 結尾 commit；commit message 結尾加 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。
- 最終驗收**不替使用者起 dev server**：給啟動指令 + 網址 + 驗測重點清單。
- Phase 0 的 spike 專案放 `.spike-slidev/`（gitignored），Phase 0 結束即刪除；結論寫進 spec 的「Phase 0 Findings」addendum。
- **Phase 0 是 gate**：任一驗證翻車，停下來回報主線（監督者），修訂 spec 後才進 Phase 1。Phase 1 各 task 中標注「依 spike 結論」處，以 addendum 記載值為準。

---

## Phase 0 — Spike（半天級，驗證四個技術假設）

### Task 1: Spike 骨架 + `theme: none`/UnoCSS/canvasWidth 驗證

**Files:**
- Create: `.spike-slidev/package.json`
- Create: `.spike-slidev/slides.md`
- Create: `.spike-slidev/styles/index.ts`、`.spike-slidev/styles/probe.css`
- Create: `.spike-slidev/spike-check.mjs`
- Modify: `.gitignore`（加 `.spike-slidev/`）

**Interfaces:**
- Produces: spike dev server 慣例（port 3030）、`spike-check.mjs` 的檢查輸出格式（後續 task 沿用）；「theme 設定最終值」與「UnoCSS preflight 干擾清單」兩個結論，供 Task 3 addendum 與 Task 4 使用。

- [ ] **Step 1: 建 spike 專案**

```bash
cd /path/to/worktree   # slidev-migration worktree 根目錄
echo '.spike-slidev/' >> .gitignore
mkdir -p .spike-slidev/styles
```

`.spike-slidev/package.json`：

```json
{
  "name": "slidev-spike",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "slidev --open=false"
  },
  "dependencies": {
    "@slidev/cli": "^52.17.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "floating-vue": "^5.2.2",
    "playwright": "^1.60.0",
    "playwright-chromium": "^1.60.0"
  }
}
```

`.spike-slidev/slides.md`（**驗證點 1：`theme: none` 是否被 v52 接受**；若 dev server 報錯，改成 `theme: default` 並記錄——這就是 addendum 要寫的結論之一）：

```md
---
theme: none
canvasWidth: 1920
htmlAttrs:
  lang: zh-TW
colorSchema: light
---

# 中文字級探針

<p class="probe-body">body 字級應為 26px（舞台座標）</p>
<p class="probe-min">最小字級應為 20px（舞台座標）</p>

---

# 第二頁（逐步揭示探針）

<v-clicks>

- 第一拍
- 第二拍
- 第三拍

</v-clicks>
```

`.spike-slidev/styles/index.ts`：

```ts
import './probe.css'
```

`.spike-slidev/styles/probe.css`（模擬 base.css 的關鍵假設：自訂 :root token + px 字級 + 具體選擇器）：

```css
:root {
  --probe-accent: #b4552d;
}
.probe-body { font-size: 26px; color: var(--probe-accent); margin-top: 24px; }
.probe-min { font-size: 20px; }
h1 { font-size: 88px; font-weight: 700; }
```

- [ ] **Step 2: 起 dev server 確認可跑**

```bash
cd .spike-slidev && npm install && (npm run dev &> /tmp/spike-dev.log &) && sleep 8 && grep -E "localhost|error|ERR" /tmp/spike-dev.log
```

Expected: log 出現 `http://localhost:3030/`；若 `theme: none` 報錯，記下錯誤原文，改 `theme: default` 重試並記錄。

- [ ] **Step 3: 寫 `spike-check.mjs` 驗證 canvasWidth 與 UnoCSS 干擾**

```js
// spike-check.mjs — 驗證 canvasWidth=1920 的字級縮放與 UnoCSS preflight 干擾
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto("http://localhost:3030/1");
await page.waitForTimeout(2000);

const r = await page.evaluate(() => {
  const body26 = document.querySelector(".probe-body");
  const h1 = document.querySelector("h1");
  const cs = (el) => getComputedStyle(el);
  return {
    // 1920 視窗下舞台應 1:1，26px 字實測 rect 高度接近 26*line-height
    probeBodyFontSize: cs(body26).fontSize,
    probeBodyRectHeight: body26.getBoundingClientRect().height,
    probeAccentApplied: cs(body26).color,
    // UnoCSS preflight 干擾探針：h1 的 margin / font-weight 是否被 reset 歸零
    h1Margin: cs(h1).margin,
    h1FontSize: cs(h1).fontSize,
    h1FontWeight: cs(h1).fontWeight,
    // 頁面上有沒有非我方的 stylesheet 規則命中 h1（列出來源）
    sheets: [...document.styleSheets].map((s) => s.href ?? "inline").slice(0, 20),
  };
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
```

- [ ] **Step 4: 跑檢查並記錄結論**

```bash
node spike-check.mjs
```

Expected 判讀（全部記進工作筆記，Task 3 要用）：
- `probeBodyFontSize` = `"26px"` 且 `probeAccentApplied` 是磚紅色系 rgb → **canvasWidth 1920 + 自訂 css 生效**。
- `h1FontSize` = `"88px"` → 我方選擇器贏。若不是 88px，列出贏過我們的規則來源（UnoCSS shortcut / default theme css），記錄需要的反制（例如在 `styles/base.css` 保持同 specificity 但後載、或 uno.config 關 preflight）。
- `h1Margin` 若為 `0px` 而我們沒設 → UnoCSS preflight 有生效，記錄「base.css 必須自帶完整 margin/reset 假設」是否已滿足（base.css 本來就有自己的 reset，預期無礙，但要留證據）。

- [ ] **Step 5: 縮放行為驗證（非 1920 視窗）**

在 `spike-check.mjs` 尾端 `browser.close()` 前追加：

```js
const page2 = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page2.goto("http://localhost:3030/1");
await page2.waitForTimeout(2000);
const rectH = await page2.evaluate(
  () => document.querySelector(".probe-body").getBoundingClientRect().height,
);
console.log("1280 視窗下 probe-body 實高（應約為 1920 版的 2/3）:", rectH);
await page2.close();
```

Run: `node spike-check.mjs`。Expected: 1280 視窗實高 ≈ 1920 視窗實高 × 0.667（±5%）→ Slidev 舞台縮放取代 `useStageScale` 成立。

### Task 2: Spike export/CJK + URL clicks + floating-vue hover 驗證

**Files:**
- Modify: `.spike-slidev/slides.md`（加 tooltip 探針）
- Create: `.spike-slidev/setup/main.ts`
- Create: `.spike-slidev/components/ProbeTip.vue`
- Create: `.spike-slidev/spike-check2.mjs`

**Interfaces:**
- Consumes: Task 1 的 dev server（port 3030）。
- Produces: 「`?clicks=N` URL 可行性」「export CJK 品質」「floating-vue container 定位策略」三個結論，供 Task 3 addendum、Task 6/11 使用。

- [ ] **Step 1: 加 floating-vue 探針**

`.spike-slidev/setup/main.ts`：

```ts
import { defineAppSetup } from "@slidev/types";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

export default defineAppSetup(({ app }) => {
  app.use(FloatingVue, {
    themes: {
      term: { $extend: "tooltip", triggers: ["hover", "focus"], distance: 14 },
    },
  });
});
```

`.spike-slidev/components/ProbeTip.vue`（驗證點：popper 掛進 slide 容器、繼承舞台 scale）：

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";

const el = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | string>("body");
onMounted(() => {
  container.value =
    (el.value?.closest("#slide-content, .slidev-page") as HTMLElement) ?? "body";
});
</script>

<template>
  <VTooltip theme="term" :container="container">
    <span ref="el" class="probe-term" data-no-advance tabindex="0"
      style="border-bottom: 2px dotted #b4552d; cursor: help">CCR</span>
    <template #popper>
      <span style="font-size: 19px">Claude Code Router — 探針 tooltip，中文字。</span>
    </template>
  </VTooltip>
</template>
```

`slides.md` 第 1 頁 `probe-min` 段落後加一行：`<p class="probe-body">縮寫探針：<ProbeTip /></p>`

- [ ] **Step 2: 驗證 `?clicks=N` URL 與 hover**

`.spike-slidev/spike-check2.mjs`：

```js
// spike-check2.mjs — 驗證 ?clicks=N、hover tooltip、export 前置
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// (a) ?clicks=N：第 2 頁 3 拍，clicks=2 應顯示前 2 項
await page.goto("http://localhost:3030/2?clicks=2");
await page.waitForTimeout(1500);
const clickState = await page.evaluate(() => {
  const targets = [...document.querySelectorAll(".slidev-vclick-target")];
  return {
    total: targets.length,
    hidden: targets.filter((t) => t.classList.contains("slidev-vclick-hidden")).length,
  };
});
console.log("clicks=2 →", JSON.stringify(clickState), "（預期 total 3、hidden 1）");

// (b) hover tooltip：量測 popper 是否出現、字級是否隨舞台 scale
await page.goto("http://localhost:3030/1");
await page.waitForTimeout(1500);
await page.locator(".probe-term").hover();
await page.waitForTimeout(400);
const tip = await page.evaluate(() => {
  const p = document.querySelector(".v-popper__popper:not(.v-popper__popper--hidden)");
  if (!p) return null;
  const box = p.getBoundingClientRect();
  const inner = p.querySelector("span[style]");
  return { x: box.x, y: box.y, w: box.width, fontSizePx: inner.getBoundingClientRect().height };
});
console.log("tooltip →", JSON.stringify(tip), "（預期非 null 且在視窗內）");
await browser.close();
```

Run: `node spike-check2.mjs`
Expected: `clicks=2 → {"total":3,"hidden":1}`；tooltip 非 null。若 `?clicks=` 無效（hidden 數不對），改測 `page.keyboard.press("ArrowRight")` 推進法並記錄——這決定 Task 11 sweep 腳本的驅動方式。

- [ ] **Step 3: 驗證 export CJK**

```bash
cd .spike-slidev && npx slidev export --format png --with-clicks --output spike-snaps
ls spike-snaps/
```

Expected: 產出多張 PNG（第 2 頁應有 4 張：0~3 clicks）。用 Read 工具目測第 1 頁 PNG：中文不是豆腐字、26px/20px 探針文字清晰。若字體豆腐（export 環境載不到 Google Fonts），記錄結論「fonts 需在 export 前預載/自架」——這影響 Task 5 的 fonts.css 處理與 GUIDE §4。

### Task 3: Spike 結論 addendum + 清場（GATE）

**Files:**
- Modify: `docs/superpowers/specs/2026-07-12-slidev-migration-design.md`（文末加「## Phase 0 Findings（addendum）」）
- Delete: `.spike-slidev/`

**Interfaces:**
- Produces: addendum 段落，內含四個結論欄位（后續 task 引用）：`theme 設定值`、`UnoCSS 干擾與反制`、`clicks URL 驅動方式`、`export CJK 結論`。

- [ ] **Step 1: 寫 addendum**

在 spec 文末加：

```md
## Phase 0 Findings（addendum，YYYY-MM-DD）

| 驗證項 | 結論 |
|---|---|
| `theme:` 設定 | （`none` 可用／改用 `default`+覆寫，附錯誤原文） |
| UnoCSS preflight 干擾 | （實測干擾清單與反制；無干擾也要寫「無」） |
| canvasWidth 1920 字級/縮放 | （26px/20px 探針與 1280 視窗縮放實測值） |
| `?clicks=N` URL | （可用／改鍵盤推進，sweep 腳本採用方式） |
| export CJK | （PNG 目測結論；fonts 是否需預載） |
| floating-vue container | （掛進 slide 容器的 selector 實測值） |
```

（表格內容填實測值，不留括號提示文字。）

- [ ] **Step 2: 清場 + commit**

```bash
kill %1 2>/dev/null; rm -rf .spike-slidev
git add docs/superpowers/specs/2026-07-12-slidev-migration-design.md .gitignore
git commit -m "docs(spec): Phase 0 spike findings addendum"
```

- [ ] **Step 3: GATE — 回報監督者**

任一結論偏離 spec 假設（尤其 `theme: none` 不可用、`?clicks=` 不可用、export 豆腐字），停下，把 addendum 內容回報主線，等 spec 修訂確認後才進 Phase 1。

---

## Phase 1 — 遷移本體

### Task 4: tag `react-final`、清舊 template、Slidev 骨架

**Files:**
- Delete: `template/presentation/`（舊 React 全部，含未追蹤的 `bun.lock`）
- Create: `template/presentation/package.json`、`slides.md`、`tsconfig.json`、`.gitignore`、`.theme`、`.npmrc`（不需要 npmrc 就不建）
- Create: `template/presentation/chapters/.gitkeep`（Task 10 前的占位）

**Interfaces:**
- Produces: 可 `npm run dev` 的空 Slidev 專案；headmatter 慣例（`canvasWidth: 1920`、theme 依 spike 結論）；npm scripts 名稱：`dev`/`build`/`typecheck`/`export`/`export-pdf`（Task 11 再加 snap/lint 系列）。

- [ ] **Step 1: 打 tag（在遷移前 HEAD）**

```bash
git tag react-final
git tag --list react-final   # 確認存在
```

- [ ] **Step 2: 刪舊、建骨架**

```bash
git rm -r template/presentation
rm -f template/presentation/bun.lock 2>/dev/null || true
mkdir -p template/presentation/chapters
```

`template/presentation/package.json`：

```json
{
  "name": "presentation",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "slidev --open=false",
    "build": "slidev build",
    "typecheck": "vue-tsc --noEmit",
    "export": "slidev export --format png --with-clicks --output snaps",
    "export-pdf": "slidev export --output presentation.pdf"
  },
  "dependencies": {
    "@slidev/cli": "^52.17.0",
    "floating-vue": "^5.2.2",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@slidev/types": "^52.17.0",
    "playwright": "^1.60.0",
    "playwright-chromium": "^1.60.0",
    "typescript": "~5.9.0",
    "vue-tsc": "^3.1.0"
  }
}
```

`template/presentation/slides.md`（`theme:` 值依 spike addendum）：

```md
---
theme: none
canvasWidth: 1920
aspectRatio: 16/9
title: Presentation
htmlAttrs:
  lang: zh-TW
colorSchema: light
drawings:
  persist: false
---

<!-- 封面骨架：真實簡報的第一章通常自帶 chapter-open 扉頁；
     本頁僅確保空專案可跑，做真實內容時可整頁替換。 -->

# Presentation

---
src: ./chapters/01-example.md
---
```

`template/presentation/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "jsx": "preserve",
    "types": ["@slidev/types", "vite/client"]
  },
  "include": ["components/**/*", "layouts/**/*", "setup/**/*", "*.vue", "shims.d.ts"],
  "exclude": ["node_modules", "dist", "scripts"]
}
```

`template/presentation/.gitignore`：

```
node_modules
dist
snaps
*.local
.slidev
```

`template/presentation/.theme`：內容一行 `paper-grid`。

- [ ] **Step 3: 裝依賴、dev 冒煙**

```bash
cd template/presentation && npm install
(npm run dev &> /tmp/mig-dev.log &) && sleep 8 && grep -E "localhost|error" /tmp/mig-dev.log && kill %1
```

Expected: `http://localhost:3030/` 出現、無 error。（`chapters/01-example.md` 還不存在會使 src 匯入報錯的話，先把 slides.md 的 src 區塊註解掉，Task 10 再打開——實測為準，記在 commit message。）

- [ ] **Step 4: Commit**

```bash
git add -A template/presentation .gitignore
git commit -m "feat(template): replace React template with Slidev skeleton (canvasWidth 1920)"
```

### Task 5: styles 全量移植 + scaffold.sh 改路徑 + 三主題冒煙

**Files:**
- Create: `template/presentation/styles/index.ts`
- Create: `template/presentation/styles/{fonts,tokens,base,animations,extras}.css`（自 tag 還原）
- Modify: `template/presentation/styles/base.css`（Slidev 化適配，見 Step 2）
- Modify: `scripts/scaffold.sh`（`src/styles` → `styles`）

**Interfaces:**
- Consumes: tag `react-final` 裡的舊檔。
- Produces: styles 載入順序契約 `fonts → tokens → base → term → phase-tag → progress-bar → example → animations → extras`（term/phase-tag/progress-bar/example 由 Task 6/7/9/10 各自加進 index.ts，位置固定在 base 之後、animations 之前）；`.stage-frame` class 由 layout 掛（Task 8 消費）。

- [ ] **Step 1: 從 tag 還原五個 css**

```bash
cd template/presentation && mkdir -p styles
for f in fonts tokens base animations extras; do
  git show react-final:template/presentation/src/styles/$f.css > styles/$f.css
done
```

`styles/index.ts`：

```ts
// 載入順序 = cascade 契約（見 references/THEMES.md）：
// tokens 先載（base 用 var() 消費）、extras 最後載（贏過一切同 specificity 規則）。
// 元件 css 固定插在 base 之後、animations 之前。
import "./fonts.css";
import "./tokens.css";
import "./base.css";
import "./animations.css";
import "./extras.css";
```

- [ ] **Step 2: base.css Slidev 化適配（讀完整份 base.css 再動手）**

規則（只動這些，其他一行不改）：
1. `.app-shell`、`.stage-fitter` 兩個選擇器的規則整塊刪除（Slidev 接管視口置中與縮放）。
2. `.stage-frame` 若有 `width: 1920px; height: 1080px`／`transform-origin` 之類尺寸宣告，改為 `width: 100%; height: 100%;`（尺寸由 Slidev 畫布給）；紙面底色、藍圖格線、陰影等視覺宣告全數保留。
3. 若 spike addendum 記載了 UnoCSS 反制（例如需補回 heading margin），在 base.css 頂部加註解區塊 `/* ── Slidev/UnoCSS 適配 ── */` 集中放置。
4. `body`/`html` 層級的規則檢視：與 Slidev 外層衝突者（如 `overflow: hidden`、body 背景）移到 `.stage-frame` 或刪除，逐條在 commit message 列出。

- [ ] **Step 3: scaffold.sh 改路徑**

`scripts/scaffold.sh` 兩處修改：
- 檢查目標：`if [[ ! -d "$TARGET/styles" ]]`（原 `$TARGET/src/styles`），錯誤訊息同步改。
- 複製目標：`cp ... "$TARGET/styles/tokens.css"`、`"$TARGET/styles/extras.css"`（原 `src/styles/`）。

- [ ] **Step 4: 三主題冒煙**

```bash
cd template/presentation && (npm run dev &> /tmp/mig-dev.log &) && sleep 8
for t in paper-grid midnight-press dbx-style; do
  bash ../../scripts/scaffold.sh . --theme=$t
  sleep 3
  npx playwright screenshot --viewport-size=1920,1080 "http://localhost:3030/1" /tmp/theme-$t.png
done
bash ../../scripts/scaffold.sh . --theme=paper-grid   # 復位預設
kill %1
```

Expected: 用 Read 目測三張 PNG——三主題底色/字體明顯不同、無白底無樣式頁。再依 THEMES.md 的驗證法跑 `npm run build` 後 grep `dist/assets/*.css`，抽查 `--r-card` 最後一次出現值屬於當前主題。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(template): port styles pipeline + theme swap to Slidev project layout"
```

### Task 6: floating-vue + Term.vue + term.css

**Files:**
- Create: `template/presentation/setup/main.ts`
- Create: `template/presentation/components/Term.vue`
- Create: `template/presentation/styles/term.css`
- Create: `template/presentation/shims.d.ts`
- Modify: `template/presentation/styles/index.ts`（base 之後插 `import "./term.css";`）

**Interfaces:**
- Consumes: spike addendum 的「floating-vue container selector」結論；styles 載入順序契約（Task 5）。
- Produces: `<Term tip="…" kind="abbr|quote">觸發字</Term>`；富內容用 `<template #tip>`；tooltip 內部小標 class `.term-tip-t` / `.term-tip-q` / `.term-tip-src` 照舊（Task 10/12 消費）。

- [ ] **Step 1: setup/main.ts**

```ts
import { defineAppSetup } from "@slidev/types";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

export default defineAppSetup(({ app }) => {
  app.use(FloatingVue, {
    themes: {
      term: {
        $extend: "tooltip",
        triggers: ["hover", "focus"],
        delay: { show: 0, hide: 120 },
        distance: 14,
      },
    },
  });
});
```

- [ ] **Step 2: Term.vue**

```vue
<script setup lang="ts">
/**
 * Term — 縮寫全稱 / 引言出處 hover tooltip（floating-vue 包裝）。
 *
 * <Term tip="CCR — 全稱與一句話概念">CCR</Term>
 * <Term kind="quote"><template #tip>
 *   <span class="term-tip-q">"原文逐字"</span>
 *   <span class="term-tip-src">出處 · 日期</span>
 * </template>定價是本人訂的</Term>
 *
 * 相比 React 版：pos/align 退役——floating-vue 自動翻轉避邊；
 * popper 掛進 slide 容器（繼承舞台 scale、殲滅 stacking context 地雷）。
 */
import { ref, onMounted } from "vue";

withDefaults(defineProps<{ tip?: string; kind?: "abbr" | "quote" }>(), {
  kind: "abbr",
});

const el = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | string>("body");
onMounted(() => {
  // selector 依 Phase 0 addendum 實測值
  container.value =
    (el.value?.closest("#slide-content, .slidev-page") as HTMLElement) ?? "body";
});
</script>

<template>
  <VTooltip theme="term" :container="container">
    <span ref="el" class="term" :class="`term-${kind}`" data-no-advance tabindex="0">
      <slot />
    </span>
    <template #popper>
      <slot name="tip">{{ tip }}</slot>
    </template>
  </VTooltip>
</template>
```

`shims.d.ts`：

```ts
import type { Tooltip } from "floating-vue";

declare module "vue" {
  export interface GlobalComponents {
    VTooltip: typeof Tooltip;
  }
}
```

- [ ] **Step 3: term.css（視覺自 react 版 Term.css 移植）**

```bash
git show react-final:template/presentation/src/components/Term.css > /tmp/Term-react.css
```

新寫 `styles/term.css`，對映規則：
- 觸發字樣式照抄：`.term`（cursor: help、outline: none；**刪掉 position: relative**）、`.term-abbr`、`.term-quote`、`.term-quote::after`。
- `.term-tip` 的視覺（背景/邊框/陰影/字體/字級/max-width 560px/padding）搬到 `.v-popper--theme-term .v-popper__inner`。
- 箭頭：`.v-popper--theme-term .v-popper__arrow-outer { border-color: var(--rule); }`、`.v-popper--theme-term .v-popper__arrow-inner { border-color: var(--surface-2); }`。
- 行內化：`.v-popper--theme-term.v-popper { display: inline; }`。
- `.term-tip-t` / `.term-tip-q` / `.term-tip-src` 三個內部小標整段照抄（改掛在 `.v-popper--theme-term` 底下）。
- 舊檔的 `.term-align-*`、`.term-pos-*`、三角形 `::before/::after` 定位段**全部不搬**（floating-vue 接管）。

`styles/index.ts` 在 `import "./base.css";` 後插入 `import "./term.css";`。

- [ ] **Step 4: 冒煙驗證**

在 `slides.md` 封面頁暫加一行 `<p style="font-size:26px">探針：<Term tip="Term 元件冒煙測試——看得到我就通過">CCR</Term></p>`，起 dev：

```bash
cd template/presentation && npm run typecheck
(npm run dev &> /tmp/mig-dev.log &) && sleep 8
node -e '
import("playwright").then(async ({ chromium }) => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto("http://localhost:3030/1"); await p.waitForTimeout(1500);
  await p.locator(".term").hover(); await p.waitForTimeout(400);
  await p.screenshot({ path: "/tmp/term-hover.png" });
  await b.close();
});'
kill %1
```

Expected: `typecheck` 無錯；Read `/tmp/term-hover.png` 目測 tooltip 樣式正確（紙面底、rule 邊框、19px 中文）。**驗完把探針行刪掉。**

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(template): Term tooltip on floating-vue (auto-flip, slide-container mounted)"
```

### Task 7: PhaseTag.vue + MaskReveal.vue

**Files:**
- Create: `template/presentation/components/PhaseTag.vue`
- Create: `template/presentation/components/MaskReveal.vue`
- Create: `template/presentation/styles/phase-tag.css`（自 tag 照抄 `src/components/PhaseTag.css`）
- Modify: `template/presentation/styles/index.ts`（term 之後插 `import "./phase-tag.css";`）

**Interfaces:**
- Produces: `<PhaseTag kind="q|a">自訂標籤文字?</PhaseTag>`；`<MaskReveal :show="…" :delay="300" :duration="1000">…</MaskReveal>`（`show` 預設 true；canvas 元件內用 `$clicks` 餵）。

- [ ] **Step 1: PhaseTag.vue**

```vue
<script setup lang="ts">
/**
 * 問題(Q)/解法(A) 角色標記 — kind="q" 實心✕、kind="a" 描邊✓。
 * 不引入新色，只靠 solid↔outline + ✕↔✓ 區分（單一 accent 主題不破功）。
 */
defineProps<{ kind: "q" | "a" }>();
</script>

<template>
  <span class="phase-tag" :class="`phase-tag-${kind}`">
    <span class="phase-tag-mark mono">{{ kind === "q" ? "✕" : "✓" }}</span>
    <span class="phase-tag-label"><slot>{{ kind === "q" ? "問題" : "解法" }}</slot></span>
  </span>
</template>
```

- [ ] **Step 2: MaskReveal.vue**

```vue
<script setup lang="ts">
/**
 * clip-path 文字擦入。搭配 animations.css 的 .mask-reveal / .mask-reveal.in。
 * Slidev 版：靜態出場直接用（show 預設 true + delay）；
 * 逐步揭示在 canvas 元件內用 :show="$clicks >= N" 餵。
 */
withDefaults(
  defineProps<{ show?: boolean; delay?: number; duration?: number }>(),
  { show: true, delay: 0 },
);
</script>

<template>
  <span
    class="mask-reveal"
    :class="{ in: show }"
    :style="{
      display: 'inline-block',
      transitionDelay: show ? `${delay}ms` : '0ms',
      ...(duration ? { transitionDuration: `${duration}ms` } : {}),
    }"
  >
    <slot />
  </span>
</template>
```

- [ ] **Step 3: phase-tag.css 還原 + 掛載**

```bash
git show react-final:template/presentation/src/components/PhaseTag.css > template/presentation/styles/phase-tag.css
```

`styles/index.ts` 在 term.css 後插 `import "./phase-tag.css";`。

- [ ] **Step 4: 驗證 + Commit**

```bash
cd template/presentation && npm run typecheck
git add -A && git commit -m "feat(template): port PhaseTag + MaskReveal to Vue"
```

Expected: typecheck 過（視覺驗證併入 Task 10 示範章節）。

### Task 8: layouts（canvas / chapter-open）+ global-top 點擊推進

**Files:**
- Create: `template/presentation/layouts/canvas.vue`
- Create: `template/presentation/layouts/chapter-open.vue`
- Create: `template/presentation/global-top.vue`

**Interfaces:**
- Consumes: `.stage-frame` 視覺（Task 5 base.css）。
- Produces: layout 名 `canvas`（自由畫布）與 `chapter-open`（扉頁；frontmatter 欄位 `chapter`、`eyebrow`）；全域點擊推進（豁免 `button, a, input, [data-no-advance], .v-popper__popper` 與 Slidev 自身 UI）。

- [ ] **Step 1: canvas.vue**

```vue
<template>
  <!-- 自由畫布：掛 .stage-frame 讓 base.css 的紙面/格線/陰影生效 -->
  <div class="slidev-layout stage-frame scene">
    <slot />
  </div>
</template>
```

- [ ] **Step 2: chapter-open.vue（GUIDE §6.11「段落編號眉題 + 主題大標」）**

```vue
<script setup lang="ts">
import { useSlideContext } from "@slidev/client";

const { $frontmatter } = useSlideContext();
</script>

<template>
  <div class="slidev-layout stage-frame scene chapter-open">
    <span class="label-mono chapter-eyebrow">
      <span class="mono">{{ $frontmatter.chapter }}</span>
      <span v-if="$frontmatter.eyebrow"> · {{ $frontmatter.eyebrow }}</span>
    </span>
    <div class="chapter-open-body">
      <slot />
    </div>
  </div>
</template>

<style>
.chapter-open {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--stage-pad-y, 96px) var(--stage-pad-x, 120px);
}
.chapter-eyebrow {
  display: block;
  margin-bottom: 28px;
  color: var(--accent);
}
.chapter-open-body h1 {
  font-size: var(--t-display, 96px);
  line-height: 1.12;
}
</style>
```

- [ ] **Step 3: global-top.vue（click-driven UX）**

```vue
<script setup lang="ts">
/**
 * 點擊畫面任意處推進（保留 react 版 Stage 的 click-driven UX）。
 * 豁免：互動元素、data-no-advance、floating-vue popper、Slidev 自身 UI。
 * 只在正常放映路由生效（presenter / overview / print 不動）。
 */
import { onMounted, onUnmounted } from "vue";
import { useNav } from "@slidev/client";

const nav = useNav();

function onClick(e: MouseEvent) {
  if (nav.isPresenter.value) return;
  const t = e.target as HTMLElement;
  if (
    t.closest(
      'button, a, input, textarea, select, [data-no-advance], .v-popper__popper',
    )
  )
    return;
  nav.next();
}
onMounted(() => window.addEventListener("click", onClick));
onUnmounted(() => window.removeEventListener("click", onClick));
</script>

<template>
  <span style="display: none" />
</template>
```

（若 v52 的 `useNav` 無 `isPresenter`，以 `useIsPresenter` 或路由判斷替代——實測為準，維持「presenter 不推進」語意。Slidev 底部導覽列若非 button 元素導致誤觸，補對應 class 進豁免清單，逐項記在 commit message。）

- [ ] **Step 4: 冒煙 + Commit**

```bash
cd template/presentation && npm run typecheck
(npm run dev &> /tmp/mig-dev.log &) && sleep 8
node -e '
import("playwright").then(async ({ chromium }) => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto("http://localhost:3030/1"); await p.waitForTimeout(1500);
  const before = new URL(p.url()).pathname;
  await p.mouse.click(960, 540); await p.waitForTimeout(600);
  console.log("click:", before, "→", new URL(p.url()).pathname);
  await b.close();
});'
kill %1
git add -A && git commit -m "feat(template): canvas/chapter-open layouts + click-to-advance global layer"
```

Expected: click 後 pathname 從 `/1` 變 `/2`（或 clicks 前進——console 印出前後即可人工判讀）。

### Task 9: global-bottom 章節進度條

**Files:**
- Create: `template/presentation/global-bottom.vue`
- Create: `template/presentation/styles/progress-bar.css`
- Modify: `template/presentation/styles/index.ts`（phase-tag 之後插 `import "./progress-bar.css";`）

**Interfaces:**
- Consumes: 章節 frontmatter 慣例——每章第一張 slide 帶 `chapter: "NN"` + `chapterTitle: 短把手（≤8 全形字）`，該章後續 slide 不帶（自動歸入前一組）。
- Produces: 底部 pill 進度條：pill = 章、pip = 該章內各 slide、點擊跳頁；無 `chapterTitle` 的前置頁（封面）不顯示 pill。

- [ ] **Step 1: global-bottom.vue**

```vue
<script setup lang="ts">
/**
 * 章節 pill 進度條（react 版 ProgressBar 的 Slidev 移植）。
 * 資料來源：slides 的 frontmatter（chapter / chapterTitle 慣例見 OUTLINE.md §1.3）。
 * 寬度對齊舞台：ResizeObserver 量 #slide-container 實寬（取代 useStageScale）。
 */
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { useNav } from "@slidev/client";

const nav = useNav();

interface Group {
  num: string;
  title: string;
  pages: number[];
}

const groups = computed<Group[]>(() => {
  const gs: Group[] = [];
  for (const s of nav.slides.value) {
    const fm = (s.meta?.slide?.frontmatter ?? {}) as Record<string, string>;
    if (fm.chapterTitle) {
      gs.push({
        num: fm.chapter ?? String(gs.length + 1).padStart(2, "0"),
        title: fm.chapterTitle,
        pages: [],
      });
    }
    if (gs.length > 0) gs[gs.length - 1].pages.push(s.no);
  }
  return gs;
});

const activeGroup = computed(() =>
  groups.value.findIndex((g) => g.pages.includes(nav.currentPage.value)),
);

// 舞台實寬 → pill bar 寬度與格線尺寸
const stageW = ref(0);
let ro: ResizeObserver | null = null;
onMounted(() => {
  const el = document.getElementById("slide-container");
  if (!el) return;
  ro = new ResizeObserver(() => (stageW.value = el.clientWidth));
  ro.observe(el);
  stageW.value = el.clientWidth;
});
onUnmounted(() => ro?.disconnect());

const barStyle = computed(() => ({
  "--stage-w": `${stageW.value}px`,
  "--pb-grid": `${(48 * stageW.value) / 1920}px`,
}));

const activeRef = ref<HTMLElement[]>([]);
watch(activeGroup, () =>
  nextTick(() =>
    activeRef.value[0]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    }),
  ),
);
</script>

<template>
  <div v-if="groups.length" class="pb-hover" :style="barStyle" data-no-advance>
    <div class="pb-chapters">
      <button
        v-for="(g, i) in groups"
        :key="g.num + g.title"
        :ref="i === activeGroup ? (el) => (activeRef = [el as HTMLElement]) : undefined"
        class="pb-chapter"
        :class="{ 'pb-current': i === activeGroup }"
        :aria-current="i === activeGroup ? 'step' : undefined"
        @click.stop="nav.go(g.pages[0])"
      >
        <span class="pb-num">{{ g.num }}</span>
        <span class="pb-title">{{ g.title }}</span>
        <span v-if="i === activeGroup && g.pages.length > 1" class="pb-pips">
          <span
            v-for="p in g.pages"
            :key="p"
            class="pb-pip"
            :class="{ 'pb-pip-on': p <= nav.currentPage.value }"
            role="button"
            :aria-label="`跳到第 ${p} 頁`"
            @click.stop="nav.go(p)"
          />
        </span>
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: progress-bar.css 還原適配**

```bash
git show react-final:template/presentation/src/components/ProgressBar.css > template/presentation/styles/progress-bar.css
```

適配規則：css 內引用 `--stage-half-h` 者改為以 `bottom` 錨定舞台下緣的等效寫法（`#slide-container` 置中已知，pill bar 用 `position: fixed; left: 50%; transform: translateX(-50%); width: var(--stage-w);` + 適當 `bottom`）；其餘視覺宣告照抄。實測對照 react 版截圖（`git show react-final` 的 GUIDE §5 有交付視覺基準；沒有就以三主題冒煙截圖對照協調性）。

- [ ] **Step 3: 冒煙 + Commit**

Task 10 的示範章節還沒進來時 groups 為空、bar 隱藏——先確認 typecheck 與 dev 無錯即可：

```bash
cd template/presentation && npm run typecheck
git add -A && git commit -m "feat(template): chapter pill progress bar as global-bottom layer"
```

### Task 10: 示範章節移植（chapters/01-example.md + ExampleTitle.vue）

**Files:**
- Create: `template/presentation/chapters/01-example.md`
- Create: `template/presentation/components/ExampleTitle.vue`
- Create: `template/presentation/styles/example.css`（自 tag 的 Example.css 適配）
- Modify: `template/presentation/styles/index.ts`（progress-bar 之後插 `import "./example.css";` 並註記「做真實內容時整行刪」）
- Modify: `template/presentation/slides.md`（確保 src 匯入行生效）

**Interfaces:**
- Consumes: Term/PhaseTag/MaskReveal（Task 6/7）、layouts（Task 8）、進度條 frontmatter 慣例（Task 9）。
- Produces: 示範全部慣例的可跑章節——混合式兩種寫法各一頁 + notes `[click]` 旁白範本；同時是 Task 11 驗證產線與 Task 14 gate 的測試對象。

- [ ] **Step 1: chapters/01-example.md**

```md
---
layout: chapter-open
chapter: "01"
chapterTitle: 示範
eyebrow: paper-grid 慣例展示
---

# 紙感編輯風，點擊驅動

<!--
這是 paper-grid 簡報模板的示範章節：扉頁用 chapter-open layout，
段落編號眉題 + 主題大標（GUIDE §6.11）。
-->

---
layout: canvas
---

<ExampleTitle />

<!--
這是示範標題卡，展示標題卡與兩種 hover tooltip 的用法。
-->

---
layout: canvas
---

<div class="ex-scene ex-pad">
  <div class="ex-head">
    <span class="v-pill">逐步揭示</span>
    <h2 class="ex-h2 v-serif-bold">一項 = 一個節拍，<span class="v-em">不要一次全上</span></h2>
  </div>
  <ul class="ex-list">
    <v-clicks>
      <li class="ex-item"><span class="mono ex-item-idx">01</span>先講這個</li>
      <li class="ex-item"><span class="mono ex-item-idx">02</span>再講這個</li>
      <li class="ex-item"><span class="mono ex-item-idx">03</span>最後這個</li>
    </v-clicks>
  </ul>
  <span class="ex-src label-mono">出處行慣例 · 右下角 · 16px 起</span>
</div>

<!--
清單要逐項揭示：講到哪一項，哪一項才亮起來。
[click] 先講這個——第一拍。
[click] 再講這個——第二拍。
[click] 最後這個——收尾拍。
-->
```

- [ ] **Step 2: ExampleTitle.vue（自 tag 的 Example.tsx step 0 移植）**

```vue
<script setup lang="ts">
/**
 * 示範標題卡 —「整頁 Vue 畫布元件」寫法的範本（混合式模型的複雜頁路徑）。
 * 展示：v-pill / v-corners / v-serif-bold / hero-num primitives、
 * 兩種 Term tooltip、MaskReveal 標題擦入。做真實內容前刪除本元件。
 */
</script>

<template>
  <div class="ex-scene ex-center">
    <div class="ex-title-inner">
      <span class="v-pill ex-pill">
        <Term>
          <template #tip>
            <span class="term-tip-t">Demo — 簡寫型 tooltip</span>
            hover 虛線字即可看到全稱與一句話概念；點擊不會翻頁（data-no-advance）。
          </template>
          Demo
        </Term>
        　· paper-grid
      </span>

      <h1 class="ex-h v-serif-bold">
        <MaskReveal :delay="300" :duration="1000">
          <span>紙感編輯風，<span class="v-em">點擊驅動</span></span>
        </MaskReveal>
      </h1>

      <div class="ex-card v-corners">
        <span class="label-mono ex-card-k">hero 數字示範</span>
        <span class="hero-num ex-card-num">60–95%</span>
        <span class="ex-card-d">
          <Term kind="quote">
            <template #tip>
              <span class="term-tip-q">"60-95% fewer tokens, same answers."</span>
              <span class="term-tip-src">引文出處示範 · 原文逐字 + 來源日期</span>
            </template>
            原文出處型 tooltip 長這樣
          </Term>
        </span>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: example.css 還原適配**

```bash
git show react-final:template/presentation/src/chapters/01-example/Example.css > template/presentation/styles/example.css
```

適配規則：
- `.ex-item` 原本靠 `animationDelay`（同一 step 內的節拍）——改 v-clicks 後每項一拍，把入場動畫改為 transition 形式跟 Slidev 的 vclick class 銜接：

```css
/* v-click 銜接：隱藏態下沉、顯示態升起（取代原 animationDelay 節拍） */
.ex-item.slidev-vclick-hidden {
  opacity: 0;
  transform: translateY(14px);
}
.ex-item {
  transition: opacity 500ms ease, transform 500ms ease;
}
```

原 `@keyframes` 入場段刪除，其他視覺宣告照抄。檔頭加註解：「示範用，做真實內容時整檔刪除並從 styles/index.ts 移除」。

- [ ] **Step 4: 全鏈冒煙**

```bash
cd template/presentation && npm run typecheck
(npm run dev &> /tmp/mig-dev.log &) && sleep 8
npx slidev export --format png --with-clicks --output /tmp/example-snaps
kill %1
ls /tmp/example-snaps/
```

Expected: typecheck 過；export 產出 ≥6 張（封面 + 扉頁 + 標題卡 + 列表頁 0~3 clicks）。Read 逐張目測：扉頁眉題、標題卡 hero 數字、列表逐拍揭示、底部進度條 pill「01 示範」出現。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(template): demo chapter in hybrid MD+Vue form with [click] notes"
```

### Task 11: 驗證產線（snap-sweep / snap-hover / lint-notes）

**Files:**
- Create: `template/presentation/snap-sweep.mjs`
- Create: `template/presentation/snap-hover.mjs`
- Create: `template/presentation/lint-notes.mjs`
- Modify: `template/presentation/package.json`（scripts 加 `snap-sweep`/`snap-hover`/`lint-notes`）

**Interfaces:**
- Consumes: spike addendum 的「clicks URL 驅動方式」；Task 10 示範章節。
- Produces: `SNAP_STEPS_JSON='[[頁碼,clicks總數],…]' npm run snap-sweep` → `ALL TOOLTIPS OK`；`npm run lint-notes` → 每頁 notes 覆蓋檢查 + `[click]` 計數表。

- [ ] **Step 1: snap-sweep.mjs（URL 驅動重寫）**

```js
// 掃描指定頁面全部 click 狀態的 .term：逐一 hover，量測 tooltip 是否超出安全邊界。
// SNAP_STEPS_JSON: [[頁碼, clicks總數], ...]（clicks總數 = 該頁 [click] 拍數，0 表示無揭示）
import { chromium } from "playwright";

const URL = process.env.SNAP_URL ?? "http://localhost:3030";
const STEPS = JSON.parse(process.env.SNAP_STEPS_JSON ?? "[[2,0],[3,0],[4,3]]");
const W = 1920;
const H = 1080;
const MARGIN = 60;

const browser = await chromium.launch();
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
await browser.close();
if (issues.length === 0) console.log("ALL TOOLTIPS OK");
else for (const i of issues) console.log(`p${i.no} clicks${i.c} [${i.label}] → ${i.problem}`);
```

（若 addendum 記載 `?clicks=` 不可用，改為 goto 頁面後以 `page.keyboard.press("ArrowRight")` 推進 c 次，其餘不變。）

- [ ] **Step 2: snap-hover.mjs（單點 hover 截圖，供逐案目測）**

```js
// 對指定頁/clicks/第 idx 個 .term hover 後截圖。
// 用法: SNAP_PAGE=4 SNAP_CLICKS=2 SNAP_TERM_IDX=0 node snap-hover.mjs out.png
import { chromium } from "playwright";

const URL = process.env.SNAP_URL ?? "http://localhost:3030";
const no = Number(process.env.SNAP_PAGE ?? 1);
const clicks = Number(process.env.SNAP_CLICKS ?? 0);
const idx = Number(process.env.SNAP_TERM_IDX ?? 0);
const out = process.argv[2] ?? "hover.png";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${URL}/${no}?clicks=${clicks}`);
await page.waitForTimeout(1500);
await page.locator(".term").nth(idx).hover();
await page.waitForTimeout(400);
await page.screenshot({ path: out });
await browser.close();
console.log(`saved ${out}`);
```

- [ ] **Step 3: lint-notes.mjs（旁白覆蓋 + [click] 計數）**

```js
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
```

- [ ] **Step 4: package.json scripts + 全跑**

`package.json` scripts 加：

```json
    "snap-sweep": "node snap-sweep.mjs",
    "snap-hover": "node snap-hover.mjs",
    "lint-notes": "node lint-notes.mjs"
```

```bash
cd template/presentation && (npm run dev &> /tmp/mig-dev.log &) && sleep 8
npm run lint-notes
SNAP_STEPS_JSON='[[2,0],[3,0],[4,3]]' npm run snap-sweep
kill %1
```

Expected: `NOTES COVERAGE OK` + 各頁 `[click]` 計數；`ALL TOOLTIPS OK`。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(template): verification pipeline (snap-sweep/snap-hover/lint-notes) on Slidev URLs"
```

### Task 12: example/01-service-flow 移植（Vue + MD）

**Files:**
- Create: `example/01-service-flow/01-service-flow.md`
- Create: `example/01-service-flow/ServiceFlow*.vue`（依內容拆檔，一頁一元件；只有 MD 骨架就不建元件）
- Create: `example/01-service-flow/service-flow.css`
- Delete: `example/01-service-flow/ServiceFlow.tsx`、`ServiceFlow.css`、`narrations.ts`
- Modify: `example/README.md`

**Interfaces:**
- Consumes: Task 6–10 的元件、layout、frontmatter、notes 慣例。
- Produces: 去識別化實戰參考——「卡住時去翻」的唯一範例，示範混合式判斷（哪些頁 MD 骨架、哪些頁整頁元件）。

- [ ] **Step 1: 讀舊檔、規劃頁面切分**

讀 `git show react-final:example/01-service-flow/ServiceFlow.tsx`（459 行）與 `narrations.ts`：每個 `if (step === N)` 分支 → 對映成一張 slide 或一個 click。切分原則：整屏換景 = 新 slide；同屏累加揭示 = 同 slide 的 `<v-click>`。narrations 逐句轉為對應 slide 的 notes（`[click]` 對齊拍點）。先把切分表寫成 md 檔頂部註解（頁 × 來源 step × 拍數），再動工。

- [ ] **Step 2: 逐頁移植**

規則同 Task 10：MD 骨架優先；絕對定位構圖頁寫 `.vue` 畫布元件（模板 `components/` 之外，放本目錄，md 內用相對路徑無法自動載入——故 md 檔頂部註解註明「使用時把 *.vue 複製進目標專案 components/、css 加進 styles/index.ts」，維持 example 目錄「參考文件」而非「可執行專案」的定位，與現況一致）。CSS 適配規則同 Task 10 Step 3（keyframes → vclick transition）。

- [ ] **Step 3: 借模板專案實跑驗證**

```bash
cd template/presentation
cp ../../example/01-service-flow/*.vue components/
cp ../../example/01-service-flow/service-flow.css styles/
# styles/index.ts 暫加 import；slides.md 暫加 src 指向 example md 的複本
npm run typecheck && (npm run dev &> /tmp/mig-dev.log &) && sleep 8
npx slidev export --format png --with-clicks --output /tmp/sf-snaps
kill %1
```

Expected: 逐張 Read 目測與 react 版語意等價（構圖、拍點、tooltip）。**驗完把暫加的複本全數還原**（`git checkout -- .` 範圍限模板目錄；確認 `git status` 乾淨）。

- [ ] **Step 4: 更新 example/README.md + Commit**

README 重點改動：檔案清單、 「怎麼用」（複製 .vue/css 進專案的步驟）、混合式切分表的閱讀方式。

```bash
git add -A && git commit -m "feat(example): port service-flow reference chapter to Vue + MD"
```

### Task 13: 文件改寫（GUIDE / OUTLINE / THEMES / SKILL / README）

**Files:**
- Modify: `references/GUIDE.md`（大改）
- Modify: `references/OUTLINE.md`（§3 與產出物段）
- Modify: `references/THEMES.md`（路徑與載入順序段）
- Modify: `SKILL.md`
- Modify: `README.md`
- 不動: `references/ALIGN.md`、`references/SCRIPT.md`

**Interfaces:**
- Consumes: Task 4–12 的全部慣例與指令。
- Produces: 與新模板一致的完整手冊；AI 依文件即可從零起一份新簡報。

- [ ] **Step 1: GUIDE.md 逐節改寫**

- §1 起專案：`cp -r template/presentation <target>` → `npm install` → `bash scripts/scaffold.sh <target> --theme=<id>` → `npm run dev`（port 3030）。刪 registry/chapters.ts 相關；示範章節的刪法改為「刪 `chapters/01-example.md` + `components/ExampleTitle.vue` + `styles/example.css` 及 index.ts 對應 import + slides.md 的 src 行」。
- §2 章節鐵則：改寫為混合式判斷準則——「MD 骨架 + 元件庫」為預設；整頁 Vue 畫布元件的觸發條件（絕對定位構圖、複雜逐拍狀態機）；每章第一張 slide 的 `chapter`/`chapterTitle`/`eyebrow` frontmatter 契約；扉頁一律 `layout: chapter-open`；旁白 notes + `[click]` 鐵則（`[click]` 數 = 該頁拍數）。
- §3 Term：新 API（`tip` prop / `#tip` slot、`kind`）；**刪除** stacking context 與 pos/align 兩個地雷段（floating-vue 已殲滅），改為一句歷史註記指向 git tag；保留 `data-no-advance` 說明。
- §4 驗證：`npm run typecheck`、`npm run export`（逐 click 截圖目測）、`npm run lint-notes`、`SNAP_STEPS_JSON=… npm run snap-sweep` 要 `ALL TOOLTIPS OK`、`npm run snap-hover` 單點目測。
- §5 交付節奏：指令名對齊新 scripts。
- §6 實戰教訓逐條審視：6.1/6.2/6.3/6.4/6.5/6.6/6.7/6.9/6.10/6.11/6.12/6.13/6.14/6.15 內容框架無關、保留（6.9「連結不翻頁」改述為 global-top 豁免清單；6.11 補 chapter-open layout 用法；6.15 MaskReveal 保留）；6.8「Tooltip 溢出設定」刪除（floating-vue 自動避邊），註記 snap-sweep 仍為回歸保險。
- 新增 §7 「Slidev 慣例速查」：clicks 系統（`v-click`/`v-clicks`/`at`/`$clicks`）、frontmatter 欄位表、presenter mode（`?clicks=` URL、notes 高亮）、export 用法。

- [ ] **Step 2: OUTLINE.md §3 改寫**

產出物從「各章 `narrations.ts`」改為「各章 md 的 per-slide notes（`[click]` 對齊拍點）」；SRT-informed 切 step 流程不變（`scripts/script-to-srt.sh` 仍在，phase 2 前手動使用）；§1.3 pill 短把手規範改指向 frontmatter `chapterTitle`。

- [ ] **Step 3: THEMES.md 路徑更新**

`src/styles/` → `styles/`；載入順序段補上元件 css 位置（base 之後、animations 之前、extras 永遠最後）；「唯一可靠驗證方式」段的 build 產物路徑照 Slidev 輸出（`dist/assets/*.css`）核對後更新。原理段（cascade 兩理由、14 個地雷屬性）一字不動。

- [ ] **Step 4: SKILL.md + README.md**

SKILL.md：步驟 4 起專案指令更新（port 3030）；步驟 6 音頻段改為「phase 2 待接，scripts/ 保留但 npm scripts 未掛」；硬性提醒的驗證指令名對齊。README.md：技術棧描述 React→Slidev/Vue、目錄樹更新。

- [ ] **Step 5: 交叉核對 + Commit**

grep 全 repo 殘留舊詞：

```bash
grep -rn "useStepper\|useStageScale\|registry/chapters\|narrations.ts\|snap.mjs\|snap-one\|5174\|src/styles\|\.tsx" --include="*.md" . | grep -v docs/superpowers | grep -v node_modules
```

Expected: 無輸出（specs/plans 歷史文件除外）。

```bash
git add -A && git commit -m "docs: rewrite GUIDE/OUTLINE/THEMES/SKILL/README for Slidev workflow"
```

### Task 14: 整合驗證 GATE + 交付

**Files:**
- 無新檔（全鏈驗證 + 回報）

**Interfaces:**
- Consumes: 全部前置 task。
- Produces: 綠燈證據包 + 使用者自行驗測指引；等使用者驗收後才 merge。

- [ ] **Step 1: 乾淨環境全鏈驗證**

```bash
cd template/presentation && rm -rf node_modules && npm install
npm run typecheck
npm run build
(npm run dev &> /tmp/mig-dev.log &) && sleep 8
npm run lint-notes
SNAP_STEPS_JSON='[[2,0],[3,0],[4,3]]' npm run snap-sweep
npx slidev export --format png --with-clicks --output /tmp/final-snaps
kill %1
for t in paper-grid midnight-press dbx-style; do bash ../../scripts/scaffold.sh . --theme=$t && npm run build; done
bash ../../scripts/scaffold.sh . --theme=paper-grid
git status   # 必須乾淨（除預期改動）
```

Expected: typecheck/build 零錯、`NOTES COVERAGE OK`、`ALL TOOLTIPS OK`、export 全張目測通過、三主題 build 過。

- [ ] **Step 2: 回報主線 + 使用者自行驗測指引（不替使用者起 dev server）**

回報內容必含：

```
啟動：cd <worktree>/template/presentation && npm run dev
網址：http://localhost:3030/
驗測重點：
  1. 封面點擊任意處推進；扉頁「01 · paper-grid 慣例展示」眉題 + 大標
  2. 標題卡 hover「Demo」與「原文出處型 tooltip」——樣式、避邊、點擊不翻頁
  3. 列表頁三拍逐項揭示；底部進度條 pill「01 示範」與 pip 跳頁
  4. 按 p 進 presenter mode：notes 旁白隨 click 高亮
  5. bash scripts/scaffold.sh template/presentation --theme=midnight-press 換皮後重整
```

- [ ] **Step 3: 使用者驗收後收尾（由主線執行）**

superpowers:finishing-a-development-branch 流程；merge 一律 `git merge --no-ff slidev-migration`。

---

## Self-Review 紀錄

- Spec 覆蓋：§1 架構（Task 4/5）、§2 clicks + 點擊推進（Task 8/10）、§3 主題（Task 5）、§4 驗證（Task 11）、§5 旁白（Task 10/11/13）、§6 Term（Task 6）、§7 文件（Task 12/13）、§8 Phase 0（Task 1–3）／tag（Task 4）——全數對應。
- Phase 2（音頻/影片）明確不在本計畫；`scripts/` 目錄保留、npm scripts 不掛（Task 4/13）。
- 已知不確定 API（`theme: none`、`?clicks=`、`useNav` 欄位、popper container selector）全部收斂到 Phase 0 spike 或標注「實測為準 + 記錄於 commit message」，不留隱性假設。
