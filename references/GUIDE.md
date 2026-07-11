# GUIDE — paper-grid 簡報開發指南

> 給 AI agent 的操作手冊。目標：用這個模板，對任何主題快速產出與
> `2026-06-monthly-report` 同款（唯一視覺/互動基準）的「點擊驅動網頁簡報」——
> 暖紙編輯風 + 逐步揭示 + hover tooltip。
>
> 成功範例（卡住時去翻實際代碼）：`example/`（本 skill 內建的去識別化參考章節）

---

## 0. 內容流程（先內容、後代碼）

整條內容流程由本 skill 自帶的兩份方法論規範，**不需要安裝任何外部
plugin**：`references/SCRIPT.md`（寫稿心法：語氣定調、去 AI 腔、對抗式
critic 迴圈）→ `references/OUTLINE.md`（切章心法：敘事職責切分、
SRT-informed 切 step）。實際跑起來的步驟：

1. **`article.md`** — 素材庫：研究蒐證後把所有數字 / 引用 / 出處寫進去，
   分 §1 §2… 編號。畫面上的每個數字都必須能在這裡找到出處，**禁止捏造**。
   **動筆前先問使用者手上有沒有現成筆記 / 內部文件 / 過去紀錄可以參考**——
   不要只憑自己研究或既有知識空編內容。實測案例：技術能力盤點章節一開始
   只給每項能力一句話定義，內容單薄；使用者提供一份自己整理的筆記後，
   換成分層架構＋具體例子＋成熟度標註，資訊量與可信度明顯提升。使用者
   給的參考資料通常比 agent 自己空想的更貼合真實需求、更具體。
2. **`script.md`** — 口播稿：照 `SCRIPT.md` 寫（先定 `topic_definition` 語氣、
   寫稿、跑對抗式 critic 迴圈收斂），口語短句、去 AI 腔（禁「說白了/本質上/
   恰恰/首先其次最後」、假共情、排比堆砌）。
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
cd <新專案>/presentation && npm install && npm run dev
# 確認 example 章節跑得起來後，做真實章節時刪掉它：
# rm -rf src/chapters/01-example （並更新 registry/chapters.ts）
```

樣式層疊順序（App.tsx，已接好勿動）：
`fonts → tokens(主題 token) → base → animations → extras(主題選擇器層 + 性格旋鈕 :root 覆寫，可選，詳見 THEMES.md)`

模板預設就是 `paper-grid` 主題（暖紙視覺）。**不要改
`base.css`/`animations.css`/`fonts.css`**——那是所有主題共用的骨架。
要換視覺風格，看 `references/THEMES.md`，用
`bash <skill 根>/scripts/scaffold.sh <新專案>/presentation --theme=<id>`
切換 `tokens.css`/`extras.css`，不要手改這兩個檔案本身的內容（它們是
被 scaffold 覆蓋的產物，手改了下次切主題會被蓋掉）。

## 2. 章節開發鐵則

每章一個資料夾 `src/chapters/0N-<id>/`，三個檔案：`<Name>.tsx`、`<Name>.css`、
`narrations.ts`。參考 `01-example/`（已示範全部慣例）。

| 鐵則 | 說明 |
|---|---|
| step 純函數 | `if (step === N) return <FullScene />`；無 setTimeout / setInterval，動畫全 CSS keyframes + animationDelay |
| narrations = 真相源 | `narrations.length` === 最大 step+1；每條文字與 script.md 對應段語義一致（音頻合成用它） |
| 逐步揭示 | 口播逐項唸的清單 = 一項一拍亮起（stagger delay），禁一次全上 |
| 動畫 ≤ 口播 | 每步 max(delay+duration) ≤ 該步口播秒數（字數 ÷ 4） |
| 顏色字體走 token | 只用 `var(--accent/--text/--surface…)` 與 `var(--font-*)`；唯一例外：深色終端/代碼窗可用主題既定三色 `#2a2018 / #4a3a2e / #f4ecd8` |
| primitives | `.v-pill`（膠囊標）`.v-corners`（角括號卡）`.v-strike`（劃掉）`.v-serif-bold` + `.v-em`（強調；**v-em 上色只在 v-serif-bold 內生效**，其他地方自己補 `.xx-scene .v-em { color: var(--accent) }`）；base 另有 `.hero-num .kicker .mono .label-mono .serif-cn .serif-it .display-en` |
| CSS 前綴隔離 | 每章獨立前綴（`.bk-` `.sb-`…），不跨章 import |
| 視覺演示 | 每章至少 1–2 處「動起來的演示」（長條生長/格子點亮/連線自繪/數字對撞/打字機 steps()）；每步主導動作要不同；整章純文字 = 重做 |
| 畫面 > 口播 | 回 article 抽口播沒唸的細節掛成角標/副標/出處行（右下出處行 ≥20px） |
| 反 AI 味 | 禁紫粉漸變、emoji 當圖標、假 logo、假數據、頁眉頁腳；缺素材用 placeholder 卡不要 fake |
| 字號（投影優先） | **一律從 `base.css` 的投影字級階挑**（`--t-display-1/2` `--t-h1/2/3` `--t-lead` `--t-body` `--t-label` `--t-micro`），**禁自創隨意 px**——散落 px 是讓 deck 階層糊掉、最大的可讀性殺手。硬地板（投影到大螢幕的最低）：最小字／出處行 ≥20px、body/描述 ≥26px、label/kicker/pill/眉題 ≥22px、頁面主標 ≥48px、hero/開場大標 ≥90px。白底灰字 contrast ≥4.5:1；左上 breadcrumb/眉題顏色要夠深，不能「一眼看不到」。詳見 §6.1 |
| 結構變更 bump key | 改章節數/步數後，`src/hooks/useStepper.ts` 的 STORAGE_KEY v1→v2→… |

## 3. Term hover tooltip（本模板招牌互動）

元件：`src/components/Term.tsx`（內建 `data-no-advance`，點擊不翻頁）。

```tsx
import { Term } from "../../components/Term";

// 簡寫/術語：磚紅虛線底，hover 顯示全稱 + 一句話概念
<Term tip={<><span className="term-tip-t">CCR — Compress-Cache-Retrieve</span>
  可逆壓縮：原文存本地，LLM 隨時取回。</>}>CCR</Term>

// 原文出處：灰虛線底 + 引號角標，hover 顯示逐字原文 + 出處
<Term kind="quote" tip={<><span className="term-tip-q">"verbatim original…"</span>
  <span className="term-tip-src">媒體 · 2026.01.05</span></>}>中文轉述句</Term>
```

**何時加**：(a) 所有非常識縮寫（CCR/AST/RAG/MCP/SRE/KV cache/benchmark 名）
→ 全稱 + 概念；(b) 畫面上是中文轉述、但查證過逐字原文的引言 → 原文 + 出處。
**原文必須逐字查證過才能放**，查不到就不要加 quote 型。

**防截斷（必遵守）**：tooltip 預設置中展開，觸發字靠舞台**左 1/3 加
`align="start"`**、靠**右 1/3 加 `align="end"`**、靠**頂部加 `pos="bottom"`**。
完成後必跑 sweep 驗證（見下）。

## 4. 驗證（每章完成後必跑）

dev server 跑著（假設 port 5173，不同就帶 `SNAP_URL`）：

```bash
npx tsc --noEmit                      # 必須 0 錯誤
node snap.mjs                         # 從頭逐步截圖（SNAP_STEPS=總步數 SNAP_SETTLE=5200）
node snap-one.mjs                     # 跳到單步截圖（SNAP_CH=章idx SNAP_ST=步idx SNAP_SETTLE=ms）
node snap-hover.mjs                   # hover 指定字截圖（SNAP_TEXT=文字 …）
SNAP_STEPS_JSON='[[0,5],[1,4]]' node snap-sweep.mjs   # 全 tooltip 超界掃描，要 ALL TOOLTIPS OK
```

截圖逐張目測：版面平衡、無破版、字夠大、動畫完成態正確（SETTLE 要大於該步
最晚動畫結束時間）。

**`npx tsc --noEmit` 不夠嚴格，不能只跑這個就當作型別驗證完成。** 它是單檔快速
檢查模式，某些型別問題（例如 React 19 環境下的 `Cannot find namespace 'JSX'`）
只有 `npm run build`（跑的是 `tsc -b`，project reference 的嚴格 build 模式）才
會抓到。**每完成 2–3 章就跑一次 `npm run build`**，不要留到全部章節做完才第一次
跑——章數一多，一次抓到多個錯誤會拖慢定位。`JSX.Element` 這個型別名在嚴格
build 下常找不到命名空間，一律改用從 `react` import 的 `ReactElement`。

## 5. 交付節奏

第 1 章先做完 → 給用戶驗收（風格錨點）→ 其餘章節依用戶選擇逐章 / 並行
（並行時每個 subagent 給：本指南路徑 + outline 對應章 + article 路徑 + 第 1 章
代碼當風格參考 + 各自的 CSS 前綴）。全部完成後問是否合成音頻
（`npm run extract-narrations` → `npm run synthesize-audio`；provider 見
`scripts/tts-providers/README.md`，本 skill 建議預設用 `edge-tts`——免費、
免 API key，`PRESENTATION_TTS=edge` 或 `--provider=edge`；合成後 `?auto=1`
可自動播放錄屏）。

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

> 為什麼是**固定 px** 不是 vw-clamp：舞台是固定 1920×1080 畫布、用
> `transform: scale()` 縮放到視窗（`Stage.tsx`），畫布內的 `vw` 會對到視窗寬而非
> 1920，clamp(vw) 會讓每個標題尺寸跑掉。一律用固定 px（縮放交給 transform）。

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

### 6.8 Tooltip 溢出設定

模板預設 `.stage-frame { overflow: hidden }` 會裁掉所有溢出舞台的
tooltip。**建議改為 `overflow: visible`**，讓 tooltip 可以延伸到
舞台外圍的留白區域。同時 `.term-tip` 的 `z-index` 要夠高（建議
9999），確保蓋住所有同層元素。

### 6.9 連結不翻頁

頁面上的外部連結（如 YouTube demo）必須加 `data-no-advance` 屬性，
否則點連結會同時觸發翻頁。用 `<a>` 標籤搭配
`target="_blank" rel="noopener noreferrer" data-no-advance`。

### 6.10 冗餘檢查

每次重新設計前面章節後，**必須 review 後續章節**是否有因此變得
重複的內容。特別是：
- 結尾章節容易重複前面的結論
- 部署/架構圖容易跟 CH1 藍圖重複
- 技術名稱介紹只需要一次

### 6.11 章節開場 = 段落扉頁（主題當主標，別把主題藏在小眉題）

每章第一步（step 0）是**段落分隔頁**，要讓觀眾一眼知道「現在進到第幾段、
這段在講什麼」。階層由大到小固定為：

1. **眉題**（accent 色）：段落軸標記，如 `坑 1` / `第 2 章` / `Part 3`。
   是報告的骨架，要醒目——用 `--t-h3`（44px，大於 `--t-label`、小於 `--t-h1` 主題大標）。
2. **主題大標**（最大，`--t-h1`）：這段的**主題名**（如「base 的預設」），
   關鍵字包 `.v-em`。這是主角。
3. **副標 deck**（`--t-lead`，`--text-2` 弱化）：一句生動鉤子/痛點。
4. （可選）小註 + 該頁內容。

**反例（別做）**：把主題名塞進 `~19px` 小眉題、卻讓一句金句當 96px 主標——
主副顛倒，觀眾不知道這段叫什麼。**眉題是標籤、主題才是標題。**

### 6.12 問題(Q) / 解法(A) 標記（報告骨架是「痛點 → 解法」時必用）

若簡報骨架是「N 個坑 / 痛點，各配一個解法」，**每一步要讓人掃過去就知道
這拍是問題還是解法**。用共用元件 `src/components/PhaseTag.tsx`：

```tsx
import { PhaseTag } from "../../components/PhaseTag";

<PhaseTag kind="q">★ 根因</PhaseTag>      {/* 問題：紅實心 ✕ */}
<PhaseTag kind="a">解法 · 寫進 prompt</PhaseTag>  {/* 解法：橘外框 ✓ */}
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
  移動，尤其是視窗尺寸與 Playwright 截圖預設不同的情況下（見 §6.15 也是
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
