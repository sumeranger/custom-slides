# example/ — 去識別化參考章節

這裡的 `01-service-flow/` 是從真實月報去識別化而來的**參考章節**，供開發新章節時
對照閱讀——「卡住時去翻」的唯一實戰範例。它直接 bundle 在這個 skill 裡，不依賴任何
人機器上的絕對路徑。

## 這不是一個可獨立執行的 app

`01-service-flow.md` 裡以相對路徑寫的 `<SfLanes>`、`<Term>` 等元件，只在完整的
presentation 專案樹（`template/presentation/`）下才載得到。單獨對這個資料夾跑
`slidev` 或 `tsc` 一定會失敗——這是預期行為，不代表檔案壞掉。要實跑請照下面「怎麼用」
把檔案複製進專案。

## 檔案清單

| 檔案 | 角色 |
|------|------|
| `01-service-flow.md` | 章節本體：per-slide frontmatter（`layout: chapter-open`/`canvas`）、逐頁 notes 旁白、頂部「切分表」註解。 |
| `SfTitle.vue` | 整頁 Vue 畫布 — 開場標題卡（roadmap「四件事」+ MaskReveal 大標）。 |
| `SfExtract.vue` | 整頁 Vue 畫布 — 抽離母題（Before/After + SVG 箭頭）。 |
| `SfHook.vue` | 整頁 Vue 畫布 — 轉場鉤子（按鈕 + 游標 + 問句）。 |
| `SfLanes.vue` | 可重用 Vue 元件 — 四道泳道列，高亮與連線弧線由 props 動態算出，跨頁共用。 |
| `service-flow.css` | 章節樣式，全部用 `.sf-` 前綴（物理隔離），配色吃 theme token。 |

## 這裡示範了什麼

`01-service-flow` 講一個通用情境：使用者觸發「讀取/摘要一份文件」的功能時，資料如何
在兩套系統（一個既有主系統、一個新拆出來的文件 AI 微服務）之間流動、彼此如何互不信任
地簽發短效票證。內容已完全去識別化——不含任何真實公司、產品、內部代號或人名。

同時它示範了 Slidev 版 paper-grid 章節的幾個慣例，這些是寫新章節時該抄的樣板：

- **混合式（HYBRID）判斷 — MD 骨架 vs 整頁 Vue 畫布**：能用「靜態 HTML + `<v-click>`」
  表達的頁，直接寫在 `.md` 裡（骨架優先，好讀好改）；需要動態計算、置中疊放、
  MaskReveal 擦入等**絕對定位構圖**的頁，才拆成 `.vue` 元件。本章 12 頁裡 8 頁是
  MD 骨架、4 頁動用 Vue（3 頁整頁畫布 + 1 個跨頁共用的 `SfLanes`）——判斷依據見下方切分表。
- **`Term` tooltip**：技術詞（如 `attachmentId`、`sub`、`TDD`）用 `<Term>` 包起來，
  hover 才顯示解釋，正文維持乾淨。新版 `Term` 自動翻轉避邊，不需 `pos`/`align`。
- **逐步揭示靠 `v-click`（不靠時間）**：舊 React 版用 `@keyframes` + `animation-delay`
  排「時間節拍」；Slidev 版改成敘事拍點對應 `v-click`（隱藏態 transition 揭示），
  其餘靜態。整章不留 `@keyframes`（無環境迴圈動畫），也避免延遲型動畫在 PNG 匯出時
  被拍到「還沒進場」的空畫面。
- **notes 逐頁對齊拍點**：每張 slide 結尾的 `<!-- -->` 註解就是口播稿，內含的
  `[click]` 標記數 = 該頁 `v-click` 拍數（`npm run lint-notes` 會印出對照表）。

## 怎麼用（把它接進 presentation 專案實跑）

`01-service-flow/` 是「散裝零件」，不是一個 chapters 子目錄；照下列步驟把零件歸位：

```bash
cd template/presentation   # 或你自己的 presentation 專案

# 1. Vue 元件 → components/（Slidev 自動載入此目錄）
cp ../../example/01-service-flow/*.vue components/

# 2. 章節樣式 → styles/
cp ../../example/01-service-flow/service-flow.css styles/

# 3. 章節本體 → chapters/
cp ../../example/01-service-flow/01-service-flow.md chapters/
```

再手動接兩個地方：

- `styles/index.ts`：在 `base.css` 之後、`animations.css` 之前加一行
  `import "./service-flow.css";`（前綴 `.sf-` 與其他章節物理隔離）。
- `slides.md`：加一個外部章節區塊指向它——

  ```md
  ---
  src: ./chapters/01-service-flow.md
  ---
  ```

視覺樣式（顏色、字體）全部來自當前 theme，章節本身不寫死配色，細節見
`references/GUIDE.md` 與 `template/presentation/styles/`。

## 怎麼讀切分表

`01-service-flow.md` 頂部有一段大註解，核心是一張**切分表**（頁 × 來源 step × 拍數）。
它記錄「舊 React 章節的每個 `if (step === N)` 分支，被移植成第幾張 slide、用 MD 還是
Vue、揭示幾拍」。讀法：

- **一列 = 一張 slide**。「來源 step」對回舊 React 版的步驟編號，方便對照語意有沒有走鐘。
- **切分原則**：整屏換景 = 新 slide；同屏累加揭示 = 同 slide 的 `<v-click>`。
- **型態欄**（`MD` / `Vue` / `MD+Vue`）就是混合式判斷的結果，後面附一句為什麼這頁這樣切。
- 表格下方的「關鍵適配」記錄與 React 版的刻意差異（例如帶 `Term` 的頁為何全靜態——
  因為 Slidev 的 `.slidev-vclick-hidden` 是 `pointer-events:none`，藏在 click 後的
  `Term` 會 hover 不到）。

寫自己的新章節時，建議也在 `.md` 頂部留一張同格式的切分表，當作「這章怎麼被切出來的」
設計備忘。
