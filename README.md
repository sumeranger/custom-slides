# paper-grid-slides-template

「點擊驅動網頁簡報」模板：暖奶油紙底 + 磚紅 terracotta + 厚編輯襯線 +
blueprint 格線 + 逐步揭示 + hover tooltip。視覺與互動沿襲
`may-monthly-report` / `headroom-slides`。

## 給 AI agent

讀 **[GUIDE-FOR-AI.md](GUIDE-FOR-AI.md)** —— 從內容流程到章節鐵則到驗證腳本的完整手冊。

## 給人類

```bash
cp -r presentation ~/repo/<my-slides>/presentation
cd ~/repo/<my-slides>/presentation
npm install && npm run dev
```

- 點擊畫面 / → 推進，← 後退，數字鍵跳章
- 滑鼠移到底部邊緣出現進度條
- 虛線底的字可 hover 看 tooltip（術語全稱 / 引言原文出處）

## 內含

| 路徑 | 內容 |
|---|---|
| `presentation/src/styles/` | paper-grid 主題層（tokens + restyle，勿改） |
| `presentation/src/components/Term.tsx` | hover tooltip 元件（abbr / quote 兩型，align/pos 防截斷） |
| `presentation/src/chapters/01-example/` | 示範章節（做真實內容時刪除） |
| `presentation/snap*.mjs` | playwright 驗證腳本（逐步截圖 / 單步 / hover / tooltip 超界掃描） |
| `presentation/scripts/` | 口播音頻合成 pipeline（extract-narrations / TTS providers） |
