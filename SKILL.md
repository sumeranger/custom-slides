---
name: paper-grid-slides
description: Use when asked to make a slide deck / presentation / 簡報 / slides for any topic, especially the paper-grid style (warm cream paper + terracotta + editorial serif + blueprint grid), click-driven web presentations with step-by-step reveal, or hover tooltips for terms and source quotes.
---

# paper-grid-slides

點擊驅動網頁簡報的標準產線：暖紙編輯風（paper-grid）+ 逐步揭示 + hover tooltip
（術語全稱 / 引言原文出處）。本 skill 自足，安裝後不需其他外掛。

## 怎麼做

1. **全新主題、使用者只有口述構想時**：先讀 `references/ALIGN.md`，把口述
   收斂成一小段人類可讀的對齊骨架（命名/術語校正 + 順序確認），經使用者
   點頭後才往下走——不要跳過這步直接展開成長文件，事後修正成本高很多。
2. **內容流程**：`article.md`（素材/出處）→ `references/SCRIPT.md`（寫稿心法 +
   對抗式 critic 迴圈，收斂出 `script.md`）→ `references/OUTLINE.md`（敘事職責
   切章、SRT-informed 切 step，產出各章 `narrations.ts`）→ 停下來給用戶
   checkpoint 對齊（標題／稿子／outline／素材／開發模式）→ 逐章開發（GUIDE
   §1 起，本 skill 自足，不依賴任何外部 plugin）。
3. **讀完整手冊**：`references/GUIDE.md` —— 章節鐵則、Term tooltip 規範、
   驗證腳本，全部在那裡。
4. **起專案**：複製 `template/presentation/` 到新 repo（GUIDE §1），
   `npm install && npm run dev`。不要重新 scaffold、不要改 `styles/`。
5. **參考範例**：`example/`（去識別化的實作章節，示範全部慣例，卡住時去翻）。
6. **音頻**（可選，全部章節完成後）：`npm run extract-narrations` →
   `npm run synthesize-audio`。本 skill 建議把 `edge-tts` 當預設 provider
   （免費、免 API key）：`PRESENTATION_TTS=edge npm run synthesize-audio`
   或 `npm run synthesize-audio -- --provider=edge`；`OUTLINE.md` §3 的
   SRT-informed 切 step 也是靠 `scripts/script-to-srt.sh`（同樣預設
   edge-tts）先產字幕時間戳。

## 硬性提醒

- **這是投影片，不是筆電上看的**：字級一律從 `base.css` 投影字級階挑
  （`--t-display/h1/h2/h3/lead/body/label/micro`），禁自創隨意 px；最小字 ≥20px、
  body ≥26px、label/pill/眉題 ≥22px。章節開場用「段落編號眉題 + 主題大標」。
  痛點→解法型簡報用 `PhaseTag`（問題✕/解法✓）。詳見 GUIDE §6.1/6.11/6.12。
- 畫面上每個數字都要有 `article.md` 出處，禁捏造；引言原文須逐字查證。
- 非常識縮寫與查證過的原文一律加 `<Term>` hover tooltip；靠舞台邊緣記得
  `align="start"/"end"`，完成後跑 `snap-sweep.mjs` 要 ALL TOOLTIPS OK。
- 第 1 章先做完給使用者驗收再繼續；每章完成跑 `tsc --noEmit` + 逐步截圖目測。
