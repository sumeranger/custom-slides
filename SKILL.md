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
