# paper-grid-slides

「點擊驅動網頁簡報」skill：暖奶油紙底 + 磚紅 terracotta + 厚編輯襯線 +
blueprint 格線 + 逐步揭示 + hover tooltip。視覺與互動沿襲
`2026-06-monthly-report`。技術棧：**Slidev**（Markdown 骨架 + Vue 元件 +
UnoCSS），舞台 `canvasWidth: 1920` 自動縮放。

## 安裝

用 [Skills CLI](https://github.com/vercel-labs/skills) 一行從 git 安裝，無需 clone：

```bash
npx skills add ssh://git@gitlab.webpat.co:2222/hank.hsueh/paper-grid-slides-template.git
```

技能自包含於 `skills/paper-grid-slides/`（SKILL.md + references/template/themes/scripts/example
一起安裝）。更新：重跑同一行。

## 版本

| 版本 | 改動 |
|---|---|
| `1.1.0` | 文風規範獨立成 [`references/TONE.md`](skills/paper-grid-slides/references/TONE.md)（改寫自 [oil-tone](https://github.com/oil-oil/oil-tone)，繁體在地化），成為所有產出文字的唯一真相來源；`SCRIPT.md` §2.2 的人稱與用詞規定改為與之一致（原「能用『你』就用『你』」「口語詞優先」已移除）；新增 `scripts/tone-lint.py` 文風檢查（簡繁通吃） |
| `1.0.0` | Slidev/Vue 引擎、三主題、對抗式 critic 迴圈產線 |

## 給 AI agent

讀 **[skills/paper-grid-slides/references/GUIDE.md](skills/paper-grid-slides/references/GUIDE.md)**
—— 從內容流程到章節鐵則到驗證腳本的完整手冊。skill 進入點見
**[skills/paper-grid-slides/SKILL.md](skills/paper-grid-slides/SKILL.md)**。
**文風一律照 [`references/TONE.md`](skills/paper-grid-slides/references/TONE.md)**，
它與其他文件衝突時以它為準。

## 給人類

```bash
cp -r skills/paper-grid-slides/template/presentation ~/repo/<my-slides>/presentation
cd ~/repo/<my-slides>/presentation
npm install && npm run dev        # Slidev dev server → http://localhost:3030
```

- 點擊畫面推進（點在舞台上就前進一拍/一頁），← 後退，`?clicks=N` 直達某頁某拍
- 底部常駐章節進度條：顯示各章、當前章高亮，可點章跳轉
- 虛線底的字可 hover 看 tooltip（術語全稱 / 引言原文出處）
- `npm run export` 逐頁逐拍出 PNG；`/presenter` 進講者模式（notes 隨 click 高亮）

## 內含

下表路徑相對於 `skills/paper-grid-slides/`（技能根）。

| 路徑 | 內容 |
|---|---|
| `SKILL.md` | skill 進入點（觸發 + 硬提醒 + 指向 references/） |
| `references/GUIDE.md` | 完整開發手冊（內容流程 / 章節鐵則 / Term / 驗證 / Slidev 慣例速查） |
| `references/TONE.md` | **文風規範**——所有產出文字的唯一真相來源（改寫自 [oil-tone](https://github.com/oil-oil/oil-tone)，繁體在地化） |
| `references/OUTLINE.md` · `SCRIPT.md` · `THEMES.md` · `ALIGN.md` | 切章 / 寫稿 / 主題系統 / 口述對齊方法論 |
| `example/01-service-flow/` | 去識別化的參考章節（散裝零件 + 切分表，卡住時去翻） |
| `scripts/scaffold.sh` | 套用視覺主題（`--theme=<id>` / `--list-themes`） |
| `scripts/tone-lint.py` | 文風檢查（`TONE.md` §9；純標準庫、簡繁通吃、`--self-test`） |
| `themes/` | 內建主題（`paper-grid` / `dbx-style` / `midnight-press` / `modern-minimal` / `mountain-ink`） |
| `template/presentation/slides.md` | deck 進入點（headmatter + `src:` 掛章節） |
| `template/presentation/chapters/` | 各章 Markdown（一章一檔，`01-example.md` 為示範，做真實內容時刪除） |
| `template/presentation/components/` | Vue 元件（`Term` tooltip / `PhaseTag` / `MaskReveal` / 整頁畫布，Slidev 自動註冊） |
| `template/presentation/layouts/` | `chapter-open`（扉頁）/ `canvas`（自由畫布）layout |
| `template/presentation/styles/` | paper-grid 主題層 + cascade 契約（`index.ts` 定載入順序，勿改） |
| `template/presentation/setup/main.ts` | FloatingVue term 主題註冊（mutate options，不 `app.use`） |
| `template/presentation/global-top.vue` · `global-bottom.vue` | 點擊推進閘 / 章節進度條 |
| `template/presentation/*.mjs` | playwright 驗證腳本（`snap-sweep` tooltip 超界掃描 / `snap-hover` 單點 / `lint-notes` 旁白覆蓋） |
| `template/presentation/scripts/` | SRT/TTS 工具（`script-to-srt.sh` 今日可用於切 step；`synthesize-audio.sh` + tts-providers 等 phase 2 notes 版 extractor，見該目錄 README） |
