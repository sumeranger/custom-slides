# GUIDE-FOR-AI — paper-grid 簡報開發指南

> 給 AI agent 的操作手冊。目標：用這個模板，對任何主題快速產出與
> `may-monthly-report`、`headroom-slides` 同款的「點擊驅動網頁簡報」——
> 暖紙編輯風 + 逐步揭示 + hover tooltip。
>
> 成功範例（卡住時去翻實際代碼）：`/home/hank/repo/headroom-slides/`

---

## 0. 內容流程（先內容、後代碼）

若環境有 `web-video-presentation` skill（presentation-skills plugin），**整個內容
流程照它走**（SCRIPT-STYLE / OUTLINE-FORMAT / CHAPTER-CRAFT 三份規範 +
Checkpoint 對齊）。本指南只補「本模板特有」的部分。沒有該 skill 時，按下面
精簡版：

1. **`article.md`** — 素材庫：研究蒐證後把所有數字 / 引用 / 出處寫進去，
   分 §1 §2… 編號。畫面上的每個數字都必須能在這裡找到出處，**禁止捏造**。
2. **`script.md`** — 口播稿：口語短句、每段（`---` 之間）= 一次點擊 = 一個
   聚焦想法。去 AI 腔（禁「說白了/本質上/恰恰/首先其次最後」、假共情、
   排比堆砌）。
3. **`outline.md`** — 開發計劃：章節切分（每章 3~8 步、30~60s）+ 每步一行
   屏幕內容 + 每章「信息池」（從 article 抽細節並標 `—— 來源 article §X`）。
   **不寫動畫**（動畫由實作章節時自由設計）。
4. **停下來給用戶對齊**：標題 / 稿子 / outline / 素材 / 開發模式，確認後才寫代碼。

## 1. 起專案

```bash
cp -r /home/hank/repo/paper-grid-slides-template/presentation <新專案>/presentation
cd <新專案>/presentation && npm install && npm run dev
# 確認 example 章節跑得起來後，做真實章節時刪掉它：
# rm -rf src/chapters/01-example （並更新 registry/chapters.ts）
```

樣式層疊順序（App.tsx，已接好勿動）：
`fonts → tokens(midnight-press) → base → animations → paper-grid → paper-grid-cards`
亮色暖紙視覺全部來自 `paper-grid.css` 覆寫。**不要改 styles/ 下任何檔案**。

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
| 畫面 > 口播 | 回 article 抽口播沒唸的細節掛成角標/副標/出處行（右下出處行 ≥16px） |
| 反 AI 味 | 禁紫粉漸變、emoji 當圖標、假 logo、假數據、頁眉頁腳；缺素材用 placeholder 卡不要 fake |
| 字號 | hero ≥80px、最小字 ≥16px |
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
最晚動畫結束時間）。`npm run build` 最後跑一次（比 tsc 嚴格，抓未使用 import）。

## 5. 交付節奏

第 1 章先做完 → 給用戶驗收（風格錨點）→ 其餘章節依用戶選擇逐章 / 並行
（並行時每個 subagent 給：本指南路徑 + outline 對應章 + article 路徑 + 第 1 章
代碼當風格參考 + 各自的 CSS 前綴）。全部完成後問是否合成音頻
（`npm run extract-narrations` → `npm run synthesize-audio`，詳見
web-video-presentation skill 的 AUDIO.md；合成後 `?auto=1` 可自動播放錄屏）。
