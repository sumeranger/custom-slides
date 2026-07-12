---
date: 2026-07-12
topic: paper-grid-slides — 簡報引擎遷移到 Slidev（Vue 化）
status: draft
---

# paper-grid-slides：簡報引擎遷移到 Slidev（Vue 化）

## 背景與動機

現行 `template/presentation/` 是自製 React + Vite 簡報框架：自製 stepper
（`useStepper`）、自製舞台縮放（`useStageScale`）、自製截圖驗證腳本
（`snap*.mjs`）。使用者拍板遷移到 [Slidev](https://github.com/slidevjs/slidev)
（`@slidev/cli` v52.x），元件改用 Vue 實作。動機（已確認）：

1. **Slidev 生態與工具鏈**：presenter mode、講者備註、overview、
   PDF/PNG/PPTX 匯出、錄影等現成能力。
2. **降低自製框架維護負擔**：stepper／縮放／逐 step 截圖等底層設施退役，
   交給活躍的開源專案。
3. **技術棧統一到 Vue**。
4. **表現力標竿**：https://talks.ayaka.io/nekoayaka/2024-08-21-kubecon-hk/
   證明 Slidev 撐得起「重客製」美術強度——走「Slidev 當底盤 +
   自製元件/layout」路線，不是純 Markdown 輕量路線。

## 已拍板的決策

| 決策點 | 結論 |
|---|---|
| 寫作模型 | **混合式**：多數頁面 Markdown 骨架 + 元件庫組裝；複雜頁面才寫整頁 Vue 畫布元件 |
| 打包形態 | **專案內建，免打包**：用 Slidev 專案級約定（`components/`、`layouts/`、`styles/` 自動載入），不發 npm theme/addon 包；template 照舊整包複製起專案 |
| v1 必保能力 | Term hover tooltip 全套、多主題系統、截圖驗證產線 |
| 音頻自動播放 | **延到 phase 2**（使用者實務上未合成過音頻），v1 只留擴充縫；未來有做成影片的可能 |
| 旁白約定 | **Presenter notes + `[click]` 標記**（Slidev 原生），取代 `narrations.ts` |
| Term 實作 | **floating-vue 包裝**，取代純 CSS 手動定位 |

## §1 架構總覽

`template/presentation/` 整包換成 Slidev 專案：

```
template/presentation/
├── slides.md              # headmatter + 各章用 src: 匯入
├── chapters/
│   └── 01-example.md      # 一章一個 md（對應現在的 src/chapters/01-example/）
├── components/            # Slidev 自動載入：Term.vue、PhaseTag.vue、MaskReveal.vue、
│                          #   複雜章節的整頁畫布元件（如 Example.vue）
├── layouts/               # chapter-open.vue（章節扉頁）、canvas.vue（自由畫布）
├── styles/                # tokens/base/extras/fonts/animations —— 大致原封搬過來
├── global-bottom.vue      # 章節 pill 進度條（取代 ProgressBar.tsx；Slidev global layer）
├── global-top.vue         # 點擊推進處理器（保留 click-driven UX；尊重 data-no-advance）
├── snap-hover.mjs / snap-sweep.mjs   # 改打 Slidev URL（見 §4）
└── scripts/               # extract-narrations / synthesize-audio（phase 2 再接）
```

**關鍵設定**：headmatter `canvasWidth: 1920`。Slidev 預設畫布 980px 寬，
不改的話 `base.css` 整套「最小字 ≥20px」投影字級階的 px 語意全部失真；
設 1920 後現有字級規則原封沿用，GUIDE §6.1 幾乎不用改。

**退役的自製件**：`useStageScale`（Slidev 原生縮放）、`useStepper`
（Slidev clicks）、`Stage.tsx`（layout 取代）、`useAutoMode`／`AutoToggle`／
`AutoStartGate`／`useAudioPlayer`（phase 2 重新以 addon 形態評估）。

## §2 逐步揭示：step → clicks

- MD 骨架頁用 `<v-click>`／`<v-clicks>`；整頁 Vue 畫布元件內部用
  `$clicks` 或 `<v-click at="N">`（Slidev click 系統在自訂元件內同樣可用）。
- **點擊畫面推進**：Slidev 預設滑鼠點擊畫布不翻頁。以 `global-top.vue`
  加薄的點擊處理器保留 click-driven UX，沿用 `data-no-advance` 屬性讓
  Term 等互動元件的點擊不觸發推進。

## §3 主題系統：機制原封沿用

- `themes/*/{theme.json,tokens.css,extras.css}` 換皮機制**完全不動**。
  Slidev 專案 `styles/` 同樣由我們控制載入順序（tokens → base → extras），
  THEMES.md 的 cascade 分析（含 `base.css` `:root` 撞名地雷）原理成立，
  文件只改路徑。
- **待 Phase 0 驗證**：Slidev 內建 UnoCSS + default theme 的 CSS 與
  `base.css` 的 cascade 互動。計畫用最薄的 `theme: none`（或 default
  theme + 全面覆寫，以 spike 結果為準），確保自家 styles 是唯一視覺來源。

## §4 驗證產線

| 現在 | 之後 |
|---|---|
| `snap.mjs` 逐 step 截圖 | 內建 `slidev export --format png --with-clicks`，刪腳本 |
| `snap-one.mjs` 單頁截圖 | 同上（export 支援頁範圍） |
| `snap-hover.mjs`／`snap-sweep.mjs` | 保留 Playwright 腳本但大幅簡化：Slidev URL 原生支援 `/{頁碼}?clicks={N}`，現行 localStorage hack + reload + 等 9 秒整段移除 |
| `tsc --noEmit` | `vue-tsc --noEmit` |

snap-sweep 在 floating-vue 化之後降級為**回歸保險**（自動避邊後理論上
不再是每章必修關卡），但仍保留在每章驗證清單中。

## §5 旁白約定（phase-2 擴充縫）

採 Slidev 原生 **presenter notes + `[click]` 標記**：

- 旁白寫在每頁 md 末尾的 HTML 註解（講者備註），`[click]` 標記與 click
  進度同步高亮——presenter mode 免費得到「講到哪句亮哪句」。
- 鐵則從「narrations 陣列長度 = step 數」變成「每頁 `[click]` 標記數 =
  該頁 click 數」；寫一支 lint 腳本驗證。
- Phase 2 的 TTS／自動播放 addon 從 notes 解析文字；`extract-narrations`
  改讀 md。

## §6 Term tooltip：floating-vue 包裝

- API 面維持 `<Term tip="…" kind="abbr|quote">`；`pos`／`align` 退役
  （floating-vue 自動翻轉／平移避邊）。
- Tooltip teleport 到 body → 現行 GUIDE §3 記載的 **stacking context
  蓋 tooltip** 與**邊緣手動 align** 兩大慣性地雷直接消失，對應段落刪除。
- 樣式透過 floating-vue 的 theme 機制寫，視覺規格照搬現行 `Term.css`
  （虛線底、quote 角標等）。
- 代價：多一個依賴；已接受。

## §7 文件重寫範圍（遷移主成本）

- **不動**：`ALIGN.md`、`SCRIPT.md`（純內容心法，框架無關）；
  `THEMES.md` 原理段（只改路徑與範例）。
- **改寫**：
  - `GUIDE.md`：§1 起專案、§2 章節鐵則、§3 Term、§4 驗證全換；
    §6 實戰教訓逐條審視——框架無關者保留（如 6.15 clip-path 裁字尾）、
    React 專屬者移除或改寫。
  - `OUTLINE.md` §3：narrations.ts 產出 → notes `[click]` 約定。
  - `SKILL.md`：流程與指令更新。
  - `example/`：整章移植成 Vue + MD，兼當遷移驗收品。
- 舊 React 模板打 git tag（如 `react-final`）留檔；既有簡報 repo 都是
  複製出去的獨立專案，不受影響。

## §8 分期

- **Phase 0（spike，先做，半天級）**：空 Slidev 專案驗證四件事——
  1. `theme: none`／UnoCSS reset 與 `base.css` 的相容性；
  2. `canvasWidth: 1920` 下字級與版面表現；
  3. `export --with-clicks` 的 CJK 字體與輸出品質；
  4. `?clicks=N` URL 驅動 sweep 腳本可行性。
  任何一項翻車即回頭修訂本設計。
- **Phase 1**：template 重建 + 元件移植（Term/PhaseTag/MaskReveal/
  進度條/點擊推進）+ 三主題適配 + example 章節移植 + 驗證產線 +
  文件重寫。
- **Phase 2（另案，本設計不含）**：音頻 addon（notes → TTS → 自動推進，
  沿用 edge-tts 預設）、影片輸出調查（export PNG 序列 + ffmpeg 為最直
  路徑）。

## 風險

1. **Slidev major 版本迭代快**（現 52.x）：鎖版本、定期升級。
2. **文件重寫量大**：references/ 共 1400+ 行，GUIDE/OUTLINE/example
   是主工作量，不是元件程式碼。
3. **UnoCSS／default theme 干擾 `base.css`**：Phase 0 專門驗證，
   是全案最大技術不確定性。
4. **表現力回退**：混合式寫法下，過往「絕對定位 + per-step CSS 狀態」
   的編輯級構圖仍由整頁 Vue 畫布元件承接，不應回退；example 移植
   即為驗收基準。

## Phase 0 Findings（addendum，2026-07-12）

Spike 環境：`.spike-slidev/`（Slidev v52.17.0，`theme: none`，`css engine unocss`），Task 1／Task 2 兩份報告的實測結果彙整如下。結論：**四項 Phase 0 驗證項目全部通過，spec 原有假設成立，可進 Phase 1**；但過程中發現三項 brief 未預期、對後續 task 有直接影響的地雷，一併記錄於表格與下方補充說明。

| 驗證項 | 結論 |
|---|---|
| `theme:` 設定 | `theme: none` 在 v52.17.0 被直接接受，dev server banner 印出 `theme none`／`css engine unocss`，無報錯、無 warning。不需要 fallback 成 `theme: default` 覆寫。 |
| UnoCSS preflight 干擾 | 有干擾但可控：UnoCSS preflight 對 `h1`（及 `blockquote,dl,dd,hr,figure,p,pre`）套用 `margin: 0`；我方 `probe.css` 的 `h1 { font-size: 88px; font-weight: 700 }` 仍勝出（實測 `h1FontSize` = `88px`、`h1FontWeight` = `700`），原因是 cascade **載入順序**晚於 preflight，不是靠 specificity。`base.css` 遷移時必須自帶完整 margin/reset（涵蓋上述元素全集），不可假設「沒設就是瀏覽器預設值」。 |
| canvasWidth 1920 字級/縮放 | 1920×1080 viewport 下探針 `probeBodyFontSize` = `26px`（對應 spec 的 body 26px 假設）、`probeBodyRectHeight` = `39px`；1280×720 viewport 同探針 `getBoundingClientRect().height` = `26px`。縮放比 `26/39 = 0.6667`，與 `1280/1920 = 0.6667` 完全吻合（誤差 0%）。`canvasWidth: 1920` 的舞台縮放機制可完全取代舊架構 `useStageScale`，無需額外縮放邏輯。 |
| `?clicks=N` URL | 可用，不需 fallback 成鍵盤（ArrowRight）推進。`/2?clicks=2`（3 項 `<v-clicks>`）正確渲染 `total:3, hidden:1`，且以 DOM 逐項核對 `slidev-vclick-prior`/`slidev-vclick-current`/`slidev-vclick-hidden` 三種 class 對應第 1/2/3 項。Task 11 的 sweep 腳本可直接用 `?clicks=N` URL 驅動，不必改鍵盤模擬。 |
| export CJK | `npx slidev export --format png --with-clicks` 產出 5 個 PNG（page 1 一張、page 2 四張對應 0–3 clicks），目測全部 CJK 字形清晰、無豆腐字，磚紅色 accent（`#b4552d`）正確套用，四張 click-state 圖彼此可見差異、逐步新增一行。**但此次 spike 未使用 Google Fonts／自訂 `@font-face`**，故「webfont 是否需預載才能在 export headless 環境正常顯示」這個問題未被驗證（見下方補充 4）。 |
| floating-vue container | `el.value.closest("#slide-content, .slidev-page")` 實測命中 `.slidev-page.slidev-page-1`（`.slidev-page` 是較近的祖先，先於 `#slide-content` 被 `closest()` 選中）。Popper 掛載後 `popperParentClass === "slidev-page slidev-page-1"`，位置 `{x:747, y:233, w:427}`（1920×1080 viewport），`data-popper-placement="top"`，因掛在 `.slidev-page` 內而非 `<body>` 下，會自動繼承舞台的 CSS transform 縮放——對 `canvasWidth` 縮放的簡報是期望行為。 |

### 補充說明（四項表格之外，Task 5/6/10 需直接依賴的地雷）

1. **FloatingVue 全域安裝地雷（Task 6 必讀）**：Slidev 透過 `@shikijs/vitepress-twoslash` 已經在 `@slidev/client/setup/main.ts` 內呼叫過 `app.use(TwoslashFloatingVue, { container: '#twoslash-container' })`，其 `install()` 內部又呼叫了 `app.use(FloatingVue, { strategy: 'fixed', themes: {...} })`——也就是說 **FloatingVue 已被 Slidev 全域安裝過一次**。Vue 的 `app.use()` 用物件身分（`installedPlugins.has(plugin)`）去重，我方 `setup/main.ts` 裡再寫一次 `app.use(FloatingVue, { themes: { term: {...} } })` 會被**靜默去重、完全不生效**——`"term"` 主題從未被註冊。此時若元件寫 `<VTooltip theme="term">`，`Popper.init()` 會因為讀不到該主題設定而丟出 `TypeError: Cannot read properties of undefined (reading 'length')`，發生在 `mounted` hook 內；由於 Slidev SPA 會同時掛載相鄰投影片，這個未捕捉例外會**打斷整個 app 的 reactivity flush**，導致其他頁面（例如另一頁的 `<v-clicks>`）也一併渲染失敗（實測 `total:0` 而非預期的 `3`）。**Task 6 的方向**：不要用 `app.use(FloatingVue, {...})` 註冊自訂主題，改成直接 mutate 已安裝實例的設定——`FloatingVue.options.themes.term = {...}`（寫在 `setup/main.ts`，不呼叫 `app.use`）。若此法仍有相容性問題，**fallback 方案**是放棄自訂主題名稱，改用內建 `theme="tooltip"` 搭配 `popper-class` 做外觀客製（本次 spike 為了量出可用數據，即採用此 fallback：`theme="tooltip"` + `:distance="14"` + `:triggers="['hover','focus']"` 直接寫在 `<VTooltip>` props 上，繞過自訂主題註冊）。
2. **UnoCSS 勝出靠載入順序，非 specificity（Task 5 必讀）**：本次驗證只在 **dev server**（Vite dev mode，所有 CSS 皆以 inline `<style>` 注入，`document.styleSheets` 33 個、全部 `href` 為 `inline`）下進行，證實我方 CSS 贏是因為 Slidev 對 `styles/index.ts` 的自動載入順序天然晚於 UnoCSS preflight 注入。**Task 5 必須在正式 production build 下重新驗證這個順序**（例如 `grep` `dist/assets/*.css` 檢查我方規則是否仍排在 UnoCSS preflight 之後），不能只憑 dev 模式的觀察外推到 build 產物；production 打包（如 CSS chunk 合併/tree-shake/plugin 順序）有可能改變注入順序。
3. **`playwright-chromium` postinstall 在全新機器可能不會執行**：兩次 spike（`npm install` 與 `npx slidev export`）都因為系統快取 `~/.cache/ms-playwright/` 已有 `chromium-1223`/`chromium-1228`/`chromium_headless_shell-1228`，所以即使 npm 印出 postinstall script 未執行的 warning，export 仍順利跑通，**未真正驗證過從零開始（無快取）的機器**。之後寫 `GUIDE.md` 的 export 章節時，建議加一行提醒：若 export 時找不到瀏覽器執行檔，先手動跑 `npx playwright install chromium` 再重試。
4. **Webfont export 未驗（Task 10 必讀）**：本次 spike 全程沒有使用 Google Fonts 或任何 `@font-face`，export 出的 PNG 之所以 CJK 清晰無豆腐字，測的是「export pipeline 本身可用」而非「自訂字型在 headless export 環境下會正確載入」。正式模板一旦接上 `fonts.css`（真正的中文襯線字），**Task 10 的 export 步驟必須肉眼覆核襯線體 CJK 字形品質**，才能排除「headless 瀏覽器來不及載入 webfont 就截圖，退回系統預設字型（甚至豆腐字）」的風險——這是本次 spike 唯一沒有覆蓋到的 export 面向。
