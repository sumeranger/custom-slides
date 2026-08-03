---
name: paper-grid-slides
version: 1.2.0
description: Use when asked to make a slide deck / presentation / 簡報 / slides for any topic, especially the paper-grid style (warm cream paper + terracotta + editorial serif + blueprint grid), click-driven web presentations with step-by-step reveal, or hover tooltips for terms and source quotes.
---

# paper-grid-slides

點擊驅動網頁簡報的標準產線：暖紙編輯風（paper-grid）+ 逐步揭示 + hover tooltip
（術語全稱 / 引言原文出處）。本 skill 自足，安裝後不需其他外掛。

## 怎麼做

1. **全新主題、使用者只有口述構想時**：先讀 `references/ALIGN.md`，把口述
   收斂成一小段人類可讀的對齊骨架（命名/術語校正 + 順序確認），經使用者
   點頭後才往下走——不要跳過這步直接展開成長文件，事後修正成本高很多。
2. **文風**：`references/TONE.md` —— **所有產出文字（口播稿、投影片文字、
   素材）的唯一真相來源**，動筆前先讀。其他文件與它衝突時以 TONE.md 為準。
3. **內容流程**：`article.md`（素材/出處）→ `references/SCRIPT.md`（寫稿心法 +
   對抗式 critic 迴圈，收斂出 `script.md`）→ `references/OUTLINE.md`（敘事職責
   切章、SRT-informed 切 step，寫進各章 md 的 per-slide notes，`[click]` 對齊
   拍點）→ 停下來給用戶 checkpoint 對齊（標題／稿子／outline／素材／開發模式）
   → 逐章開發（GUIDE §1 起，本 skill 自足，不依賴任何外部 plugin）。
4. **讀完整手冊**：`references/GUIDE.md` —— 章節鐵則、Term tooltip 規範、
   驗證腳本，全部在那裡。
5. **起專案**：`cp -r template/presentation <新專案>/presentation` → `npm install`
   →（換主題才需要）`bash scripts/scaffold.sh . --theme=<id>` → `npm run dev`
   （Slidev dev server，port 3030）。細節見 GUIDE §1；不要改 `styles/`（cascade
   契約）。做真實內容前刪掉示範章節：`chapters/01-example.md`、
   `components/ExampleTitle.vue`、`styles/example.css`，並拿掉 `styles/index.ts`
   的 `import "./example.css";` 與 `slides.md` 指向它的 `src` 區塊。
6. **參考範例**：`example/`（去識別化的實作章節，示範全部慣例，卡住時去翻）。
7. **音頻**：合成產線 phase 2 再接（notes 版 extractor 未重建），
   `scripts/script-to-srt.sh` 今日可用於切 step（OUTLINE §3.2 的 SRT 校準，
   預設 edge-tts）。工具現況見 `template/presentation/scripts/README.md`。

## 硬性提醒

- **這是投影片，不是筆電上看的**：字級一律從 `base.css` 投影字級階挑
  （`--t-display/h1/h2/h3/lead/body/label/micro`），禁自創隨意 px；最小字 ≥20px、
  body ≥26px、label/pill/眉題 ≥22px。章節開場用「段落編號眉題 + 主題大標」。
  痛點→解法型簡報用 `PhaseTag`（問題✕/解法✓）。詳見 GUIDE §6.1/6.11/6.12。
- **文風以 `references/TONE.md` 為準**：事實邊界是硬規則（不編造經歷、回饋、
  群體判斷）；標題是內容標籤，不要在冒號後面自行加口號或對仗句；不用含糊的
  單字動作詞；結尾說完就停，不加昇華。口播稿定稿前跑
  `python3 scripts/tone-lint.py <專案>/script.md`。
- 畫面上每個數字都要有 `article.md` 出處，禁捏造；引言原文須逐字查證。
- 非常識縮寫與查證過的原文一律加 `<Term>` hover tooltip（floating-vue 自動避邊，
  不需再手動設 `pos`/`align`）；完成後跑 `npm run snap-sweep` 要 ALL TOOLTIPS OK。
- 第 1 章先做完給使用者驗收再繼續；每章完成跑 `npm run typecheck` +
  `npm run export` 逐頁逐拍截圖目測 + `npm run lint-notes`。
