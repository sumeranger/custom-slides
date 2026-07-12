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
