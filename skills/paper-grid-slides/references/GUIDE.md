# GUIDE — paper-grid 簡報開發指南

> 給 AI agent 的操作手冊。目標：用這個模板，對任何主題快速產出與
> `2026-06-monthly-report` 同款（唯一視覺/互動基準）的「點擊驅動網頁簡報」——
> 暖紙編輯風 + 逐步揭示 + hover tooltip。技術棧：**Slidev**（Markdown 骨架 +
> Vue 元件），舞台 `canvasWidth: 1920`（Slidev 內建 `transform: scale()` 自動縮放）。
>
> 成功範例（卡住時去翻實際代碼）：`example/`（本 skill 內建的去識別化參考章節）

---

## 0. 內容流程（先內容、後代碼）

整條內容流程由本 skill 自帶的方法論規範，**不需要安裝任何外部 plugin**：
`references/TONE.md`（文風規範：所有產出文字的唯一真相來源）→
`references/SCRIPT.md`（寫稿心法：語氣定調、去 AI 腔、對抗式 critic 迴圈）→
`references/OUTLINE.md`（切章心法：敘事職責切分、SRT-informed 切 step）。
實際跑起來的步驟：

1. **`article.md`** — 素材庫：研究蒐證後把所有數字 / 引用 / 出處寫進去，
   分 §1 §2… 編號。畫面上的每個數字都必須能在這裡找到出處，**禁止捏造**。
   **動筆前先問使用者手上有沒有現成筆記 / 內部文件 / 過去紀錄可以參考**——
   不要只憑自己研究或既有知識空編內容。實測案例：技術能力盤點章節一開始
   只給每項能力一句話定義，內容單薄；使用者提供一份自己整理的筆記後，
   換成分層架構＋具體例子＋成熟度標註，資訊量與可信度明顯提升。使用者
   給的參考資料通常比 agent 自己空想的更貼合真實需求、更具體。
2. **`script.md`** — 口播稿：照 `SCRIPT.md` 寫（先定 `topic_definition` 語氣、
   寫稿、跑對抗式 critic 迴圈收斂）。**用字一律照 `TONE.md`**——禁用表達清單
   在 TONE.md §5、口播場景的反例與改法在 SCRIPT.md §2.1，不要在這裡另記一份
   會走樣的短清單。定稿前跑 `scripts/tone-lint.py`（SCRIPT.md §3.5）。
3. **`outline.md`** — 開發計劃：照 `OUTLINE.md` 切（敘事職責定章節、密度
   分級 + SRT-informed 判斷切 step）+ 每步一行屏幕內容 + 每章「信息池」
   （從 article 抽細節並標 `—— 來源 article §X`）。**不寫動畫**（動畫由實作
   章節時自由設計）。
4. **checkpoint：停下來給用戶對齊**：標題 / 稿子 / outline / 素材 / 開發
   模式，確認後才寫代碼。
5. **逐章開發**：見本文件 §1 起。

> 概念源自 video-podcast 類文稿工具（`web-video-presentation` skill）的
> 實戰經驗，但 `SCRIPT.md` / `OUTLINE.md` 已是完整、可獨立操作的版本——
> 不依賴、也不要求安裝該 skill。

## 1. 起專案

`<skill 根>` = 本 skill 安裝所在目錄（含 `SKILL.md` 的那層）。

```bash
cp -r "<skill 根>/template/presentation" <新專案>/presentation
cd <新專案>/presentation
npm install
# 換視覺主題才需要（預設就是 paper-grid，可跳過）：
bash "<skill 根>/scripts/scaffold.sh" . --theme=<id>
npm run dev            # Slidev dev server，port 3030
```

`npm run dev` 起在 **http://localhost:3030**（`slidev --open=false`，不自動開瀏覽器）。
確認 example 章節跑得起來後，做真實內容時**完整刪掉示範章節**——三個檔案 + 兩處接線：

```bash
rm chapters/01-example.md          # 示範章節本體
rm components/ExampleTitle.vue     # 示範標題卡元件
rm styles/example.css              # 示範章節樣式
```

- `styles/index.ts`：刪掉 `import "./example.css";` 那一行。
- `slides.md`：刪掉指向示範章節的 `--- src: ./chapters/01-example.md ---` 區塊。

樣式層疊順序（`styles/index.ts`，已接好勿動——見 §6.23 與 THEMES.md）：
`fonts → tokens(主題 token) → base → 元件 css(term/phase-tag/progress-bar…) → animations → extras(主題選擇器層 + 性格旋鈕 :root 覆寫，可選)`

模板預設就是 `paper-grid` 主題（暖紙視覺）。**不要改
`base.css`/`animations.css`/`fonts.css`**——那是所有主題共用的骨架。
要換視覺風格，看 `references/THEMES.md`，用
`bash <skill 根>/scripts/scaffold.sh <新專案>/presentation --theme=<id>`
切換 `tokens.css`/`extras.css`，不要手改這兩個檔案本身的內容（它們是
被 scaffold 覆蓋的產物，手改了下次切主題會被蓋掉）。

## 2. 章節開發鐵則

每章一份 Markdown：`chapters/0N-<id>.md`，在 `slides.md` 用
`--- src: ./chapters/0N-<id>.md ---` 掛進去。整頁 Vue 畫布元件放 `components/`
（Slidev 自動全域註冊，md 內直接 `<MyScene />`，**不需 import**）；章節專用
CSS 放 `styles/`（獨立前綴），在 `index.ts` 的 base 之後、animations 之前加
一行 import。參考 `example/01-service-flow/`（已示範全部慣例，含頂部「切分表」）。

| 鐵則 | 說明 |
|---|---|
| 混合式 MD/Vue | **預設寫 MD 骨架**（靜態 HTML + `<v-click>`，好讀好改）；只有需要**動態計算 / 置中疊放 / MaskReveal 擦入等絕對定位構圖**、或**複雜逐拍狀態機**時，才把該頁拆成整頁（或可重用）Vue 元件。判斷準則見 `example/README.md` 的切分表 |
| 拍點靠 v-click 不靠時間 | 敘事拍點 = 一個 `<v-click>`/`<v-clicks>` 項；**禁 setTimeout/setInterval**；避免延遲型 `@keyframes`（PNG 匯出會拍到「還沒進場」的空畫面）。環境迴圈動畫（無限 loop）才用 CSS keyframes |
| notes = 口播真相源 | 每張 slide 結尾一段 `<!-- … -->` HTML 註解 = 該頁口播稿；裡面的 `[click]` 標記數 **= 該頁 `v-click` 拍數**。`npm run lint-notes` 檢查每頁都有 notes，並印出各頁 `[click]` 計數表供對照（advisory，不強制相等） |
| 扉頁 frontmatter 契約 | 每章第一張 slide 一律 `layout: chapter-open`，frontmatter 帶 `chapter`（`"01"` 段落編號）、`chapterTitle`（進度條把手，**≤8 全形字，全 deck 必須唯一**——重複會撞進度條的 Vue `:key`，見 §6.17）、`eyebrow`（眉題，可省） |
| 逐步揭示 | 口播逐項唸的清單 = 一項一拍亮起（`<v-clicks>` 包住 `<li>`），禁一次全上 |
| 顏色字體走 token | 只用 `var(--accent/--text/--surface…)` 與 `var(--font-*)`；唯一例外：深色終端/代碼窗可用主題既定三色 `#2a2018 / #4a3a2e / #f4ecd8` |
| primitives | `.v-pill`（膠囊標）`.v-corners`（角括號卡）`.v-strike`（劃掉）為 paper-grid extras 專屬；`.v-seal`（朱砂印章）`.v-enso`（圓相）`.v-brush-rule`（毛筆掃痕線）`.v-mist`（霧靄橫帶）`.v-safe`（底圖頁的文字安全寬，見 §6.33 ④）為 mountain-ink extras 專屬（用法與各自的限制寫在該主題 `extras.css` 的註解裡）；`.v-serif-bold` + `.v-em`（標題主 pattern：`base.css` 給每個主題一個粗體襯線基線，主題用 `--headline-weight` 調字重、paper-grid extras 再美化成 serif-900；**v-em 上色只在 v-serif-bold 內生效**，其他地方自己補 `.xx-scene .v-em { color: var(--accent) }`）；base 另有 `.hero-num .kicker .mono .label-mono .serif-cn .serif-it .display-en` |
| CSS 前綴隔離 | 每章獨立前綴（`.sf-` `.bk-`…），不跨章共用；章節 css 放 `styles/`、在 `index.ts` base 之後 animations 之前 import |
| 視覺演示 | 每章至少 1–2 處「動起來的演示」（長條生長/格子點亮/連線自繪/數字對撞/打字機 steps()）；每步主導動作要不同；整章純文字 = 重做 |
| 畫面 > 口播 | 回 article 抽口播沒唸的細節掛成角標/副標/出處行（右下出處行 ≥20px） |
| 反 AI 味 | 禁紫粉漸變、emoji 當圖標、假 logo、假數據、頁眉頁腳；缺素材用 placeholder 卡不要 fake |
| 內容待在舞台內 | 所有內容留在 1920×1080 舞台範圍內——`#slide-content` 是 `overflow: visible`（見 §6.16），超界內容會溢到 letterbox，export PNG 會現形 |
| 字號（投影優先） | **一律從 `base.css` 的投影字級階挑**（`--t-display-1/2` `--t-h1/2/3` `--t-lead` `--t-body` `--t-label` `--t-micro`），**禁自創隨意 px**——散落 px 是讓 deck 階層糊掉、最大的可讀性殺手。硬地板（投影到大螢幕的最低）：最小字／出處行 ≥20px、body/描述 ≥26px、label/kicker/pill/眉題 ≥22px、頁面主標 ≥48px、hero/開場大標 ≥90px。白底灰字 contrast ≥4.5:1；左上 breadcrumb/眉題顏色要夠深，不能「一眼看不到」。詳見 §6.1 |

## 3. Term hover tooltip（本模板招牌互動）

元件：`components/Term.vue`（floating-vue 包裝，內建 `data-no-advance`，點擊不翻頁；
Slidev 自動註冊，md 內直接用不需 import）。

```html
<!-- 簡寫/術語（kind 預設 abbr）：磚紅虛線底，hover 顯示全稱 + 一句話概念。
     短內容用 tip prop： -->
<Term tip="CCR — Compress-Cache-Retrieve。可逆壓縮：原文存本地，LLM 隨時取回。">CCR</Term>

<!-- 需要富排版（分行、上出處）時用 #tip slot： -->
<Term><template #tip>
  <span class="term-tip-t">CCR — Compress-Cache-Retrieve</span>可逆壓縮：原文存本地。
</template>CCR</Term>

<!-- 原文出處：kind="quote"，灰虛線底 + 引號角標，hover 顯示逐字原文 + 出處 -->
<Term kind="quote"><template #tip>
  <span class="term-tip-q">"verbatim original…"</span>
  <span class="term-tip-src">媒體 · 2026.01.05</span>
</template>中文轉述句</Term>
```

API：`tip` prop（純文字，短內容用）或 `#tip` slot（富排版，二選一）；`kind="abbr"`
（預設，術語）或 `kind="quote"`（引言原文）。

**何時加**：(a) 所有非常識縮寫（CCR/AST/RAG/MCP/SRE/KV cache/benchmark 名）
→ 全稱 + 概念；(b) 畫面上是中文轉述、但查證過逐字原文的引言 → 原文 + 出處。
**原文必須逐字查證過才能放**，查不到就不要加 quote 型。

**避邊免手動設定**：floating-vue 會自動翻轉、避開視窗邊緣（popper 掛進 slide
容器、繼承舞台縮放；`overflowPadding: 64` 留邊），舊 React 版的 `pos`/`align`
手動防截斷已退役、不再需要。完成後仍必跑 `snap-sweep`（§4）當回歸保險。

> **Term 不要藏在還沒揭示的 `v-click` 拍後面**：Slidev 隱藏態是
> `pointer-events: none`，hover 不到、snap-sweep 會誤報 no-box——含 Term 的
> 內容要放在該頁的靜態部分（或該拍先揭示再掃）。見 §6.19 與 example 章節
> slide 6/11 的實作理由。

> 歷史：React 版 Term 為了穿透 stacking context、手動算 `pos`/`align` 防截斷，
> 有兩段專門的地雷說明；Slidev + floating-vue 把這兩類問題整批殲滅，故本節
> 刪去。要考古舊實作，看 git tag `react-final`。

## 4. 驗證（每章完成後必跑）

dev server 跑著（`npm run dev`，port 3030；不同 port 就帶 `SNAP_URL`）：

```bash
npm run typecheck        # vue-tsc --noEmit，必須 0 錯誤
npm run export           # slidev export --format png --with-clicks --output snaps
npm run lint-notes       # 每頁有 notes + 印 [click] 計數表對照 v-click 拍數
SNAP_STEPS_JSON='[[2,0],[4,3]]' npm run snap-sweep   # 全 tooltip 超界掃描，要 ALL TOOLTIPS OK
SNAP_PAGE=4 SNAP_CLICKS=2 SNAP_TERM_IDX=0 npm run snap-hover -- out.png  # 單點 hover 目測
```

- **`npm run export`**：對每頁、每個 click 狀態各出一張 PNG 到 `snaps/`。**逐張
  目測**：版面平衡、無破版、字夠大、無內容溢出舞台、動畫完成態正確、CJK 襯線
  字形清晰（headless 若來不及載 webfont 會退回系統字甚至豆腐字，一定要肉眼覆核）。
  export 靠 playwright chromium——若報錯找不到瀏覽器執行檔，先跑
  `npx playwright install chromium` 再重試（見 §6.18）。
- **`npm run snap-sweep`**：`SNAP_STEPS_JSON='[[頁碼, clicks總數], …]'`（clicks 總數 =
  該頁 `[click]` 拍數，0 表無揭示）。腳本逐頁逐拍 hover 每個 `.term`，量 tooltip
  是否超出 60px 安全邊界，全過印 `ALL TOOLTIPS OK`。
- **`npm run snap-hover`**：`SNAP_PAGE` / `SNAP_CLICKS` / `SNAP_TERM_IDX` 指定頁、
  拍、第幾個 Term，hover 後截一張圖（預設 `hover.png`，或用位置參數指定檔名）目測。

## 5. 交付節奏

第 1 章先做完 → 給用戶驗收（風格錨點）→ 其餘章節依用戶選擇逐章 / 並行
（並行時每個 subagent 給：本指南路徑 + outline 對應章 + article 路徑 + 第 1 章
代碼當風格參考 + 各自的 CSS 前綴）。全部完成後跑 §4 全套驗證。

> **音頻**：SRT/TTS 工具隨模板保留在 `scripts/`（框架無關、未掛 npm scripts，
> 現況見 `scripts/README.md`）。`script-to-srt.sh` **今日可用**（OUTLINE §3.2 的
> SRT 校準）；逐段**合成**產線（`synthesize-audio.sh` + tts-providers）phase 2
> 再接——它的輸入 `audio-segments.json` 過去由已退役的 React 版 extractor 產出，
> phase 2 會重建一支讀 per-slide notes 的 extractor 接上它。notes 已是口播稿
> 真相源，直接餵它即可。

## 6. 實戰教訓（必讀）

以下從實際專案中踩過的坑整理，**建章節前先看完**：

### 6.1 投影字級階（這份簡報是投影用的，不是筆電上看的）

這是**投影片**——1920×1080 舞台縮放到會議室投影機，從後排看。
凡是在筆電上「剛好能讀」的字，投影出去就太小。所以模板的 type scale
（`base.css` :root）已經**全部按投影尺寸重定**，每個用途對應一個 token：

| token | 用途 | 值（固定 px） |
|------|------|----|
| `--t-display-1` | 滿版巨大數字／單字 | 150 |
| `--t-display-2` | （次）巨大數字 | 120 |
| `--t-h1` | 標題頁 · 章節開場主題大標 | 92 |
| `--t-h2` | 每步頁面主標 `<h2>` | 62 |
| `--t-h3` | 副標 / 大卡片標題 / 段落眉題 | 44 |
| `--t-lead` | deck / 副標句 / 領句 | 32 |
| `--t-body` | 內文 / 描述 | 26 |
| `--t-label` | 眉題 / kicker / pill / mono 標籤 | 22 |
| `--t-micro` | 最小字 / 出處行（**硬地板**） | 20 |

> 為什麼是**固定 px** 不是 vw-clamp：舞台是固定 1920×1080 畫布、由 Slidev
> `canvasWidth: 1920` 用 `transform: scale()` 縮放到視窗，畫布內的 `vw` 會對到
> 視窗寬而非 1920，clamp(vw) 會讓每個標題尺寸跑掉。一律用固定 px（縮放交給
> transform）。

**鐵則：章節 CSS 一律從這套階挑（`font-size: var(--t-xxx)`），不要自己寫 px。**
散落的隨意 px（本模板曾出現一份 deck 用到 ~38 種不同 px）是讓階層糊掉、
最難維護、最常「這字怎麼這麼小」的根源。需要中間尺寸時，挑相鄰的 token，
不要硬塞一個新數字。

> 章節開場「坑 N / 段落編號」這種**段落軸眉題**要更醒目，可直接給 `~44px`
> （比 `--t-label` 大、但仍小於 `--t-h1` 主題大標）——見 §6.11。

### 6.2 圖表必須有數字

長條圖 / 比較圖**每條都要在尾端標注具體數字**（分數、百分比、年份）。
沒有數字的長條圖 = 沒有說服力，觀眾不知道比較基準。

壞：四條灰紅長條，沒標數字
好：FastAPI **95** vs NestJS **30** vs Go **15** vs Rust **15**

### 6.3 一頁一個重點

不要把多個比較維度擠在同一頁。拆成多頁，每頁一個 WIN/重點：
- 每頁有明確的結論（✓ 勝出 / 弱項 · 可接受）
- 旁邊放**證據**支撐結論（不是只有圖表，要有解釋 WHY）
- 觀眾不該需要猜「所以你想說什麼？」

### 6.4 證據 > 評分

給框架打分（95/30/15）而不解釋為什麼 = 沒有說服力。
每個評分頁面旁邊都要有**證據面板**：
- AI 生態評分 → 旁邊放 Python vs JS 庫對照表
- 成熟度評分 → 旁邊放年資 timeline + 社群活躍度
- DX 評分 → 旁邊放具體 DX 優勢清單

### 6.5 說服邏輯：先工具優勢，再語言紅利

當說服團隊採用某框架時，**不要以語言開頭**（「Python 好所以用 FastAPI」）。
正確順序：
1. 框架本身的殺手特性（auto OpenAPI、Pydantic、async…）
2. 框架對決（具體分數 + 證據）
3. 「而且因為是 [語言]，你還額外獲得 [生態系紅利]」
4. 結論：前提先出（如 vibe coding），再推出結論

### 6.6 技術藍圖要完整

第一章的架構圖必須包含**所有**後續會提到的技術。如果 CH2 會講
pytest / SQLAlchemy / Pydantic，CH1 藍圖就必須先亮相，否則觀眾
會覺得「這東西從哪冒出來的？」。

對於「框架原生自帶」的功能（如 FastAPI 內建 Pydantic），用 accent
邊框大容器包住，裡面放虛線小標籤，視覺上清楚區分「原生自帶」vs
「獨立搭配」。

### 6.7 避免行話

畫面上的文字要假設觀眾不是該技術的專家：
- ✗「schema 可演化」→ ✓「隨時靈活新增不用改 DB」
- ✗「不需 migration」→ ✓「加新欄位不用動資料庫」
- 非常識術語一律加 `<Term>` tooltip

這條是投影片場域對 `TONE.md` 的**加碼**，不是牴觸：TONE.md §3 要保留必要的
技術概念（不要為了通俗而模糊掉真正的對象），這裡要求的是把行話換成白話之後
**用 `<Term>` 把原詞掛回去**——兩件事一起做，畫面好讀、術語也沒有丟失。

### 6.9 連結不翻頁 = global-top 的點擊豁免清單

點擊推進由 `global-top.vue` 統一處理：只有點在 `#slide-content`（1920×1080
畫布本體）上才推進，且會**豁免**這些選擇器——
`button, a, input, textarea, select, [data-no-advance], .v-popper__popper`。
所以：

- 外部連結（YouTube demo 等）用 `<a>` 就自動不翻頁；仍建議
  `target="_blank" rel="noopener noreferrer"`。
- 自訂的可互動元素（不在上面清單裡的），自己補 `data-no-advance` 屬性。
- `Term` 的觸發字與 popper 已內建豁免（`data-no-advance` + `.v-popper__popper`），
  不必額外處理。
- presenter / print·export 模式下 global-top 直接 return，不攔點擊（交給
  Slidev 原生的左右半頁 pointerdown）。

### 6.10 冗餘檢查

每次重新設計前面章節後，**必須 review 後續章節**是否有因此變得
重複的內容。特別是：
- 結尾章節容易重複前面的結論
- 部署/架構圖容易跟 CH1 藍圖重複
- 技術名稱介紹只需要一次

### 6.11 章節開場 = 段落扉頁（主題當主標，別把主題藏在小眉題）

每章第一張 slide 用 `layout: chapter-open`（`layouts/chapter-open.vue`）：它讀
frontmatter 的 `chapter`/`eyebrow` 渲染眉題，`#` H1 就是主題大標。這是**段落
分隔頁**，要讓觀眾一眼知道「現在進到第幾段、這段在講什麼」。階層由大到小：

1. **眉題**（accent 色，`chapter` + `eyebrow`）：段落軸標記，如 `01 · 資料流`。
   是報告的骨架，要醒目。
2. **主題大標**（最大，H1）：這段的**主題名**（如「base 的預設」），
   關鍵字包 `.v-em`。這是主角。
3. **副標 deck**（`--t-lead`，`--text-2` 弱化）：一句生動鉤子/痛點。
4. （可選）小註 + 該頁內容。

**反例（別做）**：把主題名塞進小眉題、卻讓一句金句當巨大主標——主副顛倒，
觀眾不知道這段叫什麼。**眉題是標籤、主題才是標題。**

**主標的下筆方式照 `TONE.md` §4.1**，其中對簡報最致命的一條：**不要為了顯得
有觀點、有節奏或有態度，在冒號、逗號、破折號後面自行添加行動建議、轉折判斷、
對仗句或口號。**

- ✗「主流 AI Coding Agent：先選工作方式」→ ✓「主流 AI Coding Agent 的工作方式」
- ✗「單檔 HTML 的結構：簡單，但不隨意」→ ✓「單檔 HTML 的基本結構」

除非素材確實支持那個結論，否則不要加「先……」「簡單，但……」「不只是……」
「關鍵在於……」這類後半句。這條跟上面的「眉題是標籤、主題才是標題」方向
一致：標題是內容標籤，不是文案。第 3 層的副標 deck 可以有鉤子，但那是**副標**
的職責，不要把鉤子搬進主標。

### 6.12 問題(Q) / 解法(A) 標記（報告骨架是「痛點 → 解法」時必用）

若簡報骨架是「N 個坑 / 痛點，各配一個解法」，**每一步要讓人掃過去就知道
這拍是問題還是解法**。用共用元件 `components/PhaseTag.vue`（自動註冊，直接用）：

```html
<PhaseTag kind="q">★ 根因</PhaseTag>            <!-- 問題：紅實心 ✕ -->
<PhaseTag kind="a">解法 · 寫進 prompt</PhaseTag>  <!-- 解法：橘外框 ✓ -->
```

- 問題側（痛點 / 根因 / 後果 / 症狀 / 成本）= `kind="q"`，純背景鋪陳或收尾
  金句這種中性步保留普通 `.v-pill`、不硬塞。
- 解法側（正確做法 / 對策）= `kind="a"`。
- 只吃單一 accent，靠 **實心↔外框 / ✕↔✓** 區分，不引入新顏色。
- 收尾「總結表」的問題欄/解法欄表頭也用同一組標記，當全篇總綱。

### 6.13 產品 UI 怎麼放上投影片：真截圖 vs 在地化重建

要展示某個產品／功能的畫面時，**別直接貼原始截圖**——清一色白底的 app UI 跟暖紙風
會撞得很突兀。兩種正解，按 deck 類型選：

- **(a) 在地化重建**：用主題 token **重畫**那個介面（視窗框 + 標題列 + 麵包屑路徑 +
  假清單／對話框／表格）。因為是重畫的，才貼合暖紙風、還能逐步揭示與動畫。畫面的
  「狀態」本身就是圖示——把 disabled／錯誤／空狀態**直接畫出來**，而不是用文字描述。
- **(b) 真截圖 + 瀏覽器框**：放真實截圖，外面套一個假瀏覽器 chrome（三個點 + mono
  網址列），用 `object-fit: cover` + `object-position` 只框出要講的那一區（像相機
  取景），不裁掉整張圖；標一句「實際畫面」表明是真的。

**選型準則**：
- **工作報告型 → (b)**——觀眾要看到「實際長怎樣」，如實呈現。
- **概念講解 / prototype 型 → (a)**——重畫成主題風、不受真實 UI 醜化、可動畫。

**（可選）用 Playwright MCP 抓圖**：若產品是網頁、環境又連得到，可用 Playwright MCP
驅動它截下真實畫面——再拿去 (b) 直接嵌框，或當 (a) 重建時的參考。這是**可選增強**，
不是必要步驟；沒有 MCP 也能手動截圖或直接重建。

### 6.14 獨佔式大字短句一律手動斷行，不要交給瀏覽器自動換行

金句卡、章節收束句、章開場主標這類**獨佔一屏、字級 `--t-h2` 以上**的短句，
換行位置絕對不能交給瀏覽器自動換行決定——自動換行只看空白與容器寬度，不懂
中文的詞語／成語邊界，容易把固定搭配從中間斬斷（實測踩過的例子：「商業價值
站不站得住腳」被斷成「…站不站得｜住腳」；「真實維運壓力」斷成「真實維｜
運壓力」），讀起來非常刺眼。

**規則**：
- 這類短句一律手動插入 `<br />` 控制斷點，斷在標點（逗號、句號）或至少是
  完整詞語／子句的邊界之後，絕不讓瀏覽器自己算。
- 只有本來就是多句、句號／逗號天然分隔、行數本就會隨內容量變動的長段落
  （例如卡片內的 body 說明文字）才適合放心交給自動換行——因為斷點多、
  單一斷點斷壞的風險被稀釋掉了。
- 寫完之後仍要截圖檢查：換一個舞台縮放比例或字級微調，斷點位置可能跟著
  移動，尤其是視窗尺寸與 export 截圖預設不同的情況下（見 §6.15 也是
  同類「渲染環境差異」的坑）。

### 6.15 MaskReveal 的 `clip-path` 動畫會裁掉斜體字尾，加安全緩衝

`MaskReveal`（`clip-path: inset()` 左到右遮罩動畫）用在英文斜體大標題（serif
italic）時，斜體字母的筆畫會向右傾斜、視覺邊界超出 inline-block 計算出的
盒子寬度。動畫終值 `clip-path: inset(0 0 0 0)` 理論上「完全不裁切」，但斜體
字尾貼著或超出這個盒子右緣時，仍可能在某些瀏覽器 / 字型渲染下被削掉最後一
兩個字母（實測案例：`Can AI solve my problem?` 的 "my" 被截斷）。

**修法**（已內建於本模板 `styles/animations.css` 的 `.mask-reveal`，新專案
複製 template 即可直接繼承，不需重複修）：給 `.mask-reveal` 加一點右側緩衝，
用等量負 margin 抵消掉對外部排版的影響：

```css
.mask-reveal {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 700ms var(--ease-quart);
  padding-right: 0.15em;
  margin-right: -0.15em;
}
```

若用了自訂的文字揭示動畫（非本模板內建的 `MaskReveal`），套用同樣原則：
任何靠 `clip-path` 或 `overflow: hidden` 做左右向動畫的容器，只要內容可能是
斜體或帶連字（ligature）的字型，都該抓一點安全邊界，不要讓終值裁切框完全
貼齊文字視覺邊界。

### 6.16 `#slide-content` 是 `overflow: visible`——內容要自律待在舞台內

模板刻意把 `#slide-content` 設成 `overflow: visible`（不是 `hidden`），這樣
`Term` 的 tooltip 才能延伸到舞台邊緣外的留白。代價是：**超大或絕對定位的內容
會直接溢出 1920×1080 舞台、爬進 letterbox 黑邊**，dev 模式下常看不出來（視窗剛好
夠大），但 `npm run export` 出來的 PNG 會把違規現形。所以構圖時要主動守住舞台
邊界，別依賴容器裁切——這是為了 tooltip 換來的 tradeoff，不是 bug。

### 6.17 `chapterTitle` + `chapter` 全 deck 必須唯一

進度條（`global-bottom.vue`）用每章的 `chapterTitle`+`chapter` 當 Vue `:key`。
兩章給了相同的 `chapterTitle`+`chapter` 值 → `:key` 撞在一起 → 進度條膠囊
渲染錯亂。章節把手（handle）務必各章唯一；完整描述性標題放該頁自己的主標，
把手只要短而不撞（見 OUTLINE §1.3）。

### 6.18 `slidev export` 需要 playwright chromium

export 走 headless chromium。全新機器若 `playwright-chromium` 的 postinstall
沒跑到（例如快取缺失），`npm run export` 會報找不到瀏覽器執行檔。修法：手動
`npx playwright install chromium` 後重試。

### 6.19 藏在 `v-click` 後的內容 hover 不到——Term 要放靜態區

Slidev 未揭示的 `v-click` 內容是 `pointer-events: none`（`.slidev-vclick-hidden`）。
含 `<Term>` 的元素若還在「尚未揭示的拍」裡，就 hover 不到，`snap-sweep` 會誤報
`no-box`。做法：把帶 Term 的內容放在該頁**靜態**部分（不包 v-click），或確保
sweep 時該拍已揭示（`SNAP_STEPS_JSON` 的 clicks 數要涵蓋到）。見 example 章節
slide 6（全靜態）與 slide 11（只把不含 Term 的區塊設 v-click）的處理理由。

### 6.20 `FloatingVue` 由 Slidev 預裝——絕不再 `app.use`

Slidev 內部（shiki twoslash）已 `app.use(FloatingVue)`；Vue 的 `app.use` 用物件
身分去重，`setup/main.ts` 再 `app.use(FloatingVue, …)` 會被**靜默去重、完全不
生效**——自訂 `term` 主題從未註冊，`<VTooltip theme="term">` mount 時丟
`TypeError`，還會打斷整個 SPA 的 reactivity flush（相鄰頁的 `<v-clicks>` 一起掛）。
**正解：直接 mutate 已裝實例的設定** `FloatingVue.options.themes.term = {…}`
（模板 `setup/main.ts` 已這樣做），不要呼叫 `app.use`。

### 6.21 升級 Slidev 要重新核對 `shims-slidev-client.d.ts`

`@slidev/client` 以原始 `.ts` 發佈，一 import 就把整包原始碼拉進 vue-tsc 檢查
範圍、在本專案 flags 下必炸；模板用 tsconfig `paths` 指到手寫的
`shims-slidev-client.d.ts` 替身隔離。這份替身只鏡射用到的 API 面（`useNav` /
`useSlideContext` 等），**逐欄對照 v52.17.0 原始碼核實**。升級 Slidev 時型別可能
悄悄漂移（stub 不會自己更新），務必重新核對簽名再信任 typecheck 的綠燈。

### 6.22 `lint-notes` 的 slide 切分只認 ``` 圍欄，不認 ~~~ / 縮排圍欄

`lint-notes.mjs` 會把 ` ``` ` 圍欄內的內容中和掉，避免裡面的裸 `---` 被誤判成
slide 分隔線。但它**不認** `~~~` 圍欄或縮排式 code block——這些奇葩圍欄裡若出現
裸 `---` 行，會被切出不存在的假 slide、報缺 notes。避免在章節 md 的 `~~~`/縮排
圍欄裡放裸 `---`（它會 fail loud，不是靜默出錯，看到假 slide 報錯先想到這條）。

### 6.23 樣式層疊靠「載入順序」贏過 UnoCSS preflight，不是靠 specificity

Slidev 用 UnoCSS，其 preflight 會對 `h1`/`p`/`blockquote`… 套 `margin:0` 等 reset。
模板的 CSS 能贏，是因為 `styles/index.ts` 的自動載入順序**晚於** UnoCSS preflight，
**不是靠 specificity**。所以：**永遠不要重排 `styles/index.ts` 的 import 順序**，
`base.css` 也必須自帶完整 reset（別假設「沒設就是瀏覽器預設」）。動過主題或樣式
後，用 THEMES.md 的「grep 建出來的 css」方法驗證順序仍正確。

### 6.24 `backdrop-filter` 在 headless export 下會不定時整頁白屏——改半透明底色＋hairline border

headless chromium（`slidev export`）對「單頁多顆大面積 `backdrop-filter`」的合成結果
不穩定：實測同一頁兩次 export，分別在不同 clicks 狀態整片白屏，其他頁正常、
dev 模式肉眼也看不出問題（合成路徑不同）。只要某頁有多顆玻璃感卡片、又要跑
export，就先假設會踩到。**修法**：整章關掉 blur，`card-glass` 類元件改用
半透明底色（`background: rgba(…)`）＋ 1px hairline border 撐視覺近似，玻璃感
只靠底色透明度與框線，肉眼幾乎無差；`backdrop-filter`/`-webkit-backdrop-filter`
一律設 `none`，不要留著賭它不白屏。

### 6.25 出處行要跟著內容走 flex 流，不要 absolute 貼底——進度條佔了舞台底部 ~70px

底部章節進度條（`global-bottom.vue`）`fixed` 貼在 viewport 下緣，佔掉舞台底部
一條約 70px 高的帶狀空間。若某頁的右下出處行用 `position: absolute` +
`bottom: 0` 直接貼舞台下緣，會被進度條 pill 蓋住（見 §6.17 的進度條、實測
踩過）。**修法**：出處行放進該頁本來的 flex 版面裡跟著內容走（例如當卡片
流的最後一個 flex 子項），不要獨立 `absolute` 貼死底部；密度較高的頁也可
把上方內容收緊一級，讓出處行有位置自然排進去（見 §6.1 字級鐵則挑相鄰
token，不要硬塞新數字）。

### 6.26 md 縮排 HTML 前不要留空行——會被 markdown-it 當成縮排 code block

Markdown 規則：一個空行之後、緊接著 ≥4 個空格縮排的內容，markdown-it 會判成
「縮排式 code block」，原樣輸出成 `<pre><code>` 純文字，不會被解析成
HTML/Vue 樣板。章節 md 裡若某段 HTML 前面留了空行、那段 HTML 本身又剛好縮排
到 ≥4 格，Vue 編譯直接壞掉（拿到一串逸出的純文字而非模板，畫面整頁不對）。
**修法**：縮排 HTML 前不要留空行；或乾脆貼齊左邊界、不縮排。§6.22 的
` ``` ` 圍欄坑是「假 slide」，這條是「假 code block」，兩種都是 markdown-it
解析順序踩到的地雷，遇到「怎麼這段整個沒渲染」先想到這兩條。

### 6.27 code fence 的 shiki 主題要顯式設定——`colorSchema: light` 會讓 shiki 選到 light 變體

`colorSchema: light` 是 paper-grid headmatter 的既定慣例（§7），但一旦章節
用到 code fence（含下面 §7 的 ` ```md magic-move ``` `），Slidev 會依
`colorSchema` 幫 shiki 挑 `{ light, dark }` 主題對裡的 `light` 那顆——若想要
固定的深色終端風 code 窗（貼合 §2「深色代碼窗可用主題既定三色」的例外），
會被 `colorSchema` 蓋過去、選錯邊。**修法**：`setup/shiki.ts` 用**單一字串
主題**（如 `"github-dark"`），而不是 `themes: { light, dark }` 物件——單一
字串會讓 shiki 把顏色直接 inline 進 token、背景固定，不受 `colorSchema`
影響：

```ts
import { defineShikiSetup } from "@slidev/types";

export default defineShikiSetup(() => ({
  theme: "github-dark",
  langs: ["sql"], // 依實際用到的語言增減
}));
```

### 6.28 開了 `transition:` 之後 export 要加 `--wait`，避免抓到轉場中間幀

headmatter 開了頁面轉場（如 `transition: fade`）之後，`npm run export` 偶爾會
在轉場動畫進行到一半時截圖，拍到「上一頁淡出、下一頁淡入都不完整」疊在一起
的 ghost frame，且不是每次都重現（合成時機的競態）。**保險做法**：轉場相關
的 export 額外帶 `--wait`，多留時間給轉場落定再截圖：

```bash
npx slidev export --wait 1200
```

### 6.29 export 出現「內容擠進單一象限」時，帶 `--scale 1`

首份實戰 deck（dbx-slides-v2，Slidev v52.17）實測：`slidev export` 在某些
deck 組合下（該 deck 有 `transition:` + `canvasWidth: 1920`）以預設 scale
匯出會把整頁內容擠進畫面的一個象限、其餘留黑，全數頁面壞版。帶
`--scale 1` 即恢復正常。模板 demo 章節未重現此問題，成因尚未定位——
所以不動 `npm run export` 的預設；規則是**看到象限擠壓就加 `--scale 1`**：

```bash
npx slidev export --scale 1 --wait 1200
```

### 6.30 深色主題必須 `colorSchema: dark`——否則 Slidev chrome 白底白 icon

`colorSchema` 是 Slidev headmatter（per-deck），主題檔只帶 CSS，兩者互不相通。
深色主題（`dbx-style` / `midnight-press`，`theme.json` 的 `mood` 含 `dark`）若
沿用 paper-grid base 的 `colorSchema: light`，Slidev 內建 chrome（左下工具列、
overview 總覽、goto 框、presenter）會用**淺色變體＝白底**；而工具列 icon 用
`currentColor`、繼承深色舞台的近白文字色——**白 icon 疊白底幾乎全隱形**（只有
「啟用中」狀態的 icon 因有明確高亮色而看得到）。首份實戰 deck（dbx-slides-v2）
就是這樣中招的。

- **修法**：深色 deck 的 headmatter 設 `colorSchema: dark`。
- **已自動化**：`scripts/scaffold.sh` 套用主題時，會依 `theme.json` 的
  `colorSchema` 欄位自動 patch `slides.md` 的 `colorSchema:` 行（light 主題→light、
  dark 主題→dark）。用 scaffold 換主題就不必手動改；只有手刻 headmatter 或
  自訂主題漏填 `theme.json.colorSchema` 時要自己留意。
- **與 §6.27 的關係**：翻 `colorSchema` 也會牽動 shiki 選主題——深色 deck 的 code
  窗請照 §6.27 用單一字串主題（如 `github-dark`）固定，不受 `colorSchema` 影響。

### 6.31 Slidev 原生導覽列與章節進度條在左下角重疊——base 已把工具列上抬

Slidev 的 dev/放映工具列固定在 `#slide-container` 左下角；章節進度條
（`global-bottom.vue` 的 `.pb-hover`）橫跨舞台底部、`z-index: 10`。兩者在左下角
**實體重疊**，章節列膠囊 z-index 較高，會蓋住工具列最左那幾顆（全螢幕/翻頁）
吃掉點擊。`progress-bar.css`（base）已用 `:has()` 結構選擇器把工具列整條抬到
章節列正上方（`bottom: 88px`），兩者不再重疊、皆可點；不動 z-index 免反過來蓋
住膠囊。此規則 theme-agnostic，放 base（非 per-theme 的 `extras.css`）。工具列
僅 hover 浮現、且不進 export 產出，純現場操作用。

### 6.32 舞台底部覆蓋層在 `#slide-content` 縮放層內——量寬度要用畫布單位，不要量視窗

**這是 `.pb-hover` 章節列寬度 bug 的通則。** `#slide-content` 帶
`transform: scale(--slidev-slide-scale)`，把 16:9 畫布縮放進視窗；任何掛在它
**之內**的 `position: fixed` 覆蓋層（章節列就是），其 containing block 會變成這個
縮放層、座標與寬度單位都是**畫布（`canvasWidth` 1920）**，且整個元素會**被一起
縮放**。所以：

- `width: 100%` = 畫布寬 1920 → 被父層自動縮到螢幕實寬、**永遠貼齊內容**，任何
  視窗比例皆然，**無需 JS 量測**。
- **反例（舊 bug）**：用 `ResizeObserver` 量 `#slide-container`（= 未縮放的
  viewport）餵給 `--stage-w`，等於在縮放座標系內又乘一次視窗寬——非 16:9 視窗
  下 bar 就比內容寬。同理 `max-width: 100vw` 也錯（`vw` 永遠是視窗、不隨縮放）。
- **驗證**：非 16:9 視窗下開 dev，量 `.pb-hover` 與 `#slide-content` 的
  `getBoundingClientRect()` 左右緣應完全一致。

要新增類似的舞台底部/角落覆蓋層時，記得：尺寸用畫布 px（1920 座標系）表達，
別去量 viewport。

### 6.33 舞台底圖（背景插畫）只能掛 `--surface-vignette`，且 `::before` 必須 `z-index:-1`

主題想在舞台上鋪一張插畫底圖（`mountain-ink` 的山水就是），有三個非顯而易見的
約束，全部踩過：

**① 不能用 `--surface-pattern`——那組 token 被進度條共用。**
`base.css` 有兩個裝飾層插槽，看起來都能掛圖：

| 插槽 | 消費者 | 能掛底圖？ |
|---|---|---|
| `--surface-pattern`（+`-size`/`-blend`/`-opacity`） | `.stage-frame::after` **與** `progress-bar.css` 的 `.pb-chapters::before` | **不行** |
| `--surface-vignette` | 只有 `.stage-frame::before` | 可以 |

`.pb-chapters::before` 那條規則的用途是「把 paper-grid 的藍圖網格延伸進底部進度條
footer，讓舞台+footer 讀成同一張卡」，它用 `background-size: var(--pb-grid, 48px)`
**覆寫尺寸**——一張插畫掛上去會在進度條裡被縮成 48×48 並平鋪成一排碎圖。而那條
規則是 theme-agnostic 在 base 層，主題無法只關掉自己那半。所以底圖走
`--surface-vignette`（`background` 是 shorthand，吃得下 `url()` 與多層逗號串接）。

**② `.stage-frame::before` 預設的 `z-index: 1` 會蓋住扉頁文字。**
它是**定位**子元素（繪製順序 step 7），而 `chapter-open.vue` 的眉題與 `<h1>` 是
**非定位 in-flow**（step 3–5）→ 裝飾層畫在文字**之上**。paper-grid 的 vignette 幾乎
全透明所以肉眼看不出來，但掛上有實體內容的底圖就會直接洗掉大標。修法是在主題的
`extras.css` 加：

```css
.stage-frame::before { z-index: -1; border-radius: inherit; }
```

負 z-index 子元素畫在「元素自身背景之後、in-flow 內容之前」，正是底圖該在的位置。
**安全前提**：`.stage-frame` 自成 stacking context——它同時帶 `.scene`（`z-index:2`
+ `position:absolute`），兩個內建 layout 都符合。若未來加了只掛 `.stage-frame`
不掛 `.scene` 的 layout，底圖會掉到 letterbox 後面消失。**不要改 `base.css`**
（那會影響全部主題）。

**③ 濃淡靠「疊紙色 scrim」，不是 opacity。** `--surface-vignette` 沒有配套的
opacity 插槽（那組綁在 pattern 上）。做法是在同一個 `background` 值裡把一層
`--surface` 色的漸層疊在圖之上：在沒有圖的區域等於隱形，在有圖的區域等於降不透
明度，還能順手做出「一側實、另一側透」的分佈。

**每頁切換不同氣壓 = frontmatter 的 `class`。** `class` 不是 Slidev 的保留
frontmatter 欄位，會經 props fallthrough 落到 layout 單根（＝`.stage-frame`），
所以主題可以用 `.stage-frame.xxx` 覆寫該頁的 `--surface-vignette`
（`(0,2,0)` 勝過 `:root` 的 `(0,1,0)`，而 `::before` 讀 originating element 的值）。
`mountain-ink` 的實作：內容頁＝`:root` 預設（極淡）、扉頁靠 `.chapter-open` 自動
命中（中景）、封面/結尾寫 `class: v-art-full`、要乾淨寫 `class: v-art-none`。

**④ 底圖頁的文字要有「安全區」，而且安全區寬度該由主題提供、不是每頁自己猜。**
掛了底圖之後，文字不能無限往右長。注意這**不只是對比度問題**——`mountain-ink`
實測 `v-art-full` 頁到 81% 寬都還有 4.5:1，但字壓在山的紋理上仍然「讀起來髒」。
可讀性與版面清爽是兩件事，後者要靠限制文字寬度。

做法：主題掃描自己的底圖、量出墨線起點，把結果寫成一個繼承用的 token 加一個
class（`mountain-ink` 的 `--v-safe-w` + `.v-safe`）：

```css
:root          { --v-safe-w: 72%; }   /* 內容頁（底圖最淡） */
.v-art-full    { --v-safe-w: 44%; }   /* 封面（墨線自 42% 起） */
.chapter-open  { --v-safe-w: 58%; }   /* 扉頁（墨線自 68% 起） */
.v-safe { max-width: var(--v-safe-w); }
```

`--v-safe-w` 宣告在 `.stage-frame` 上（跟氣壓 class 同一顆元素），`.v-safe` 是它的
後代 → 自訂屬性正常繼承，同一個 class 在不同氣壓的頁面自動得到不同寬度，章節
作者只要記一個 `.v-safe`。**數值要從實際圖量**（逐欄掃描、以中墨為門檻），不要
憑目測。卡片/表格/圖表這類自帶不透明背景的區塊不需要它。

**主題自帶的圖檔放哪**：見 `THEMES.md`「主題自帶靜態資源」——`themes/<id>/assets/`，
由 `scaffold.sh` 複製到 `<target>/styles/assets/`，主題 CSS 用相對
`url("./assets/x")` 引用。

## 7. Slidev 慣例速查

模板已把 Slidev 接成 paper-grid 的樣子，日常寫章節只會用到這幾組慣例：

### clicks 系統（逐步揭示的核心）

| 寫法 | 作用 |
|---|---|
| `<v-click>…</v-click>` | 包一段內容，成為「下一拍才出現」的一個 beat |
| `<v-clicks><li>…</li>…</v-clicks>` | 包一個清單，每個子項各佔一拍逐項揭示 |
| `<div v-click="2">` / `v-click.at="2"` | 指定在第 2 拍出現（絕對）；`v-click="'+1'"` 相對前一拍 |
| `<div v-click.hide="3">` | 反向：第 3 拍時**隱藏** |
| `$clicks` | 當前 click 數（可寫在模板表達式裡，如 `:class="{ on: $clicks >= 2 }"`） |
| `v-mark="{ at, type, color, strokeWidth, padding }"` | 手繪圈選標記（rough-notation），`color` 走 `var(--accent)`；**實戰已驗證可用**（見 example 章節） |

一頁的「拍數」= 該頁所有 v-click beat 的總數；notes 裡的 `[click]` 標記數要對齊它。

` ```md magic-move ``` `：markdown code fence 內包多個 ` ```<lang> ``` ` 區塊，
逐版形變成程式碼變化動畫（shiki-magic-move）；**markdown-only，無法嵌進
`.vue`**，一旦頁面需要 magic-move 就得整頁走 MD 骨架。**實戰已驗證可用**，
用了記得處理 shiki 主題（§6.27），不然深色/淺色主題會打架。

### 常用 frontmatter 欄位

| 欄位 | 位置 | 作用 |
|---|---|---|
| `theme: none` / `canvasWidth: 1920` / `aspectRatio: 16/9` | headmatter（`slides.md` 第一段） | 全 deck 設定，已設好勿動 |
| `colorSchema` | headmatter | 淺色主題 `light`、深色主題 `dark`（scaffold 換主題時自動 patch，見 §6.30）。手刻 headmatter 時：深色 deck 一定要 `dark`，否則 Slidev chrome 白底白 icon |
| `layout` | 每頁 | `chapter-open`（扉頁）/ `canvas`（自由畫布，掛 `.stage-frame`）/ `default` |
| `chapter` / `chapterTitle` / `eyebrow` | 章首頁 | 進度條與扉頁資料源（見 §2、§6.17） |
| `class` | 每頁 | 加到該頁 layout 根元素（＝`.stage-frame`）的 class。Slidev 不把 `class` 當保留欄位，會經 props fallthrough 落到 layout 單根上。主題用它切換每頁的舞台裝飾——如 mountain-ink 的 `class: v-art-full`（見 §6.33） |
| `src: ./chapters/0N-x.md` | `slides.md` 分隔區塊 | 掛入外部章節檔 |

### presenter / export

- **presenter mode**：`http://localhost:3030/presenter`——講者視窗，notes 會隨 click
  高亮對應段落（`[click]` 標記讓 notes 逐拍走）。
- **`?clicks=N` URL**：直達某頁某拍，如 `/4?clicks=2`（第 4 頁、揭示到第 2 拍）。
  snap 腳本就是靠這個驅動，不需鍵盤模擬。
- **export**：`npm run export`（PNG，每頁每拍一張 → `snaps/`）、`npm run export-pdf`
  （單一 PDF）。兩者都走 playwright chromium（見 §6.18）。
