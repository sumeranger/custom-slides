# paper-grid-slides

「點擊驅動網頁簡報」skill：暖奶油紙底 + 磚紅 terracotta + 厚編輯襯線 +
blueprint 格線 + 逐步揭示 + hover tooltip。視覺與互動沿襲
`2026-06-monthly-report`。

## 給 AI agent

讀 **[references/GUIDE.md](references/GUIDE.md)** —— 從內容流程到章節鐵則到驗證腳本的完整手冊。
skill 進入點見 **[SKILL.md](SKILL.md)**。

## 給人類

```bash
cp -r template/presentation ~/repo/<my-slides>/presentation
cd ~/repo/<my-slides>/presentation
npm install && npm run dev
```

- 點擊畫面 / → 推進，← 後退，數字鍵跳章
- 底部常駐章節進度條：顯示各章、當前章高亮，可點章跳轉
- 虛線底的字可 hover 看 tooltip（術語全稱 / 引言原文出處）

## 內含

| 路徑 | 內容 |
|---|---|
| `SKILL.md` | skill 進入點（觸發 + 硬提醒 + 指向 references/） |
| `references/GUIDE.md` | 完整開發手冊（內容流程 / 章節鐵則 / Term / 驗證） |
| `example/` | 去識別化的參考章節（示範慣例，卡住時去翻） |
| `template/presentation/src/styles/` | paper-grid 主題層（tokens + restyle，勿改） |
| `template/presentation/src/components/Term.tsx` | hover tooltip 元件（abbr / quote 兩型，align/pos 防截斷） |
| `template/presentation/src/chapters/01-example/` | 示範章節（做真實內容時刪除） |
| `template/presentation/snap*.mjs` | playwright 驗證腳本（逐步截圖 / 單步 / hover / tooltip 超界掃描） |
| `template/presentation/scripts/` | 口播音頻合成 pipeline（extract-narrations / TTS providers） |
