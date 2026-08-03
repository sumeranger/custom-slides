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

目前版本 `1.3.0`，沿革見 **[CHANGELOG.md](CHANGELOG.md)**。

## 內建主題

五個主題，一份 deck 從頭到尾只跑一個（不要中途換，會打斷視覺連貫性）。
套用：`bash scripts/scaffold.sh <presentation-dir> --theme=<id>`，
或 `--list-themes` 列出全部。**預設 `paper-grid`**。

下圖皆為同一頁示範內容在各主題下的實際畫面，可直接比較字體、accent 與質感。

| 主題 | 預覽 |
|---|---|
| **`paper-grid`** 暖紙藍圖 · 預設<br>暖奶油紙底＋磚紅 accent＋厚編輯襯線＋藍圖格線簽名。<br>適合：技術簡報 / 教程 / 產品評測 | ![paper-grid 主題預覽](docs/previews/theme-paper-grid.png) |
| **`modern-minimal`** 現代極簡<br>白底編輯式極簡：sans 大標、髮絲線、趨近於零的陰影、安靜微互動。<br>適合：技術簡報 / 選型報告 / 產品評估 | ![modern-minimal 主題預覽](docs/previews/theme-modern-minimal.png) |
| **`mountain-ink`** 水墨山水<br>白宣紙底＋墨綠 accent＋明體大標；自帶山水底圖（扉頁滿版、內頁淡化，可換自己的圖），朱砂印章是全場唯一暖色。<br>適合：主題演講 / 願景簡報 / 文化教育內容 | ![mountain-ink 主題預覽](docs/previews/theme-mountain-ink.png) |
| **`dbx-style`** DBX 深色科技<br>深色科技感＋玻璃質感工程師風，取自 DBX 官網色票。<br>適合：產品簡報 / 技術評測 / 工程團隊分享 | ![dbx-style 主題預覽](docs/previews/theme-dbx-style.png) |
| **`midnight-press`** 午夜印刷<br>電影感編輯級深色，暖 espresso 底、單一火熱橙 accent。此 skill 的舊主題，保留原樣不修改視覺。<br>適合：備用（此 skill 實際驗收的是 `paper-grid`） | ![midnight-press 主題預覽](docs/previews/theme-midnight-press.png) |

主題怎麼組成、`tokens.css` 與 `extras.css` 各自負責什麼、自製主題要注意的
cascade 地雷，見 **[`references/THEMES.md`](skills/paper-grid-slides/references/THEMES.md)**。

## 敘事骨架（三選一，可選）

全篇的敘事結構，**不是預設模板**——套用前先跟講者對過語氣與場合
（[`SCRIPT.md`](skills/paper-grid-slides/references/SCRIPT.md) §0-A）。
三種都不合適時就不套，照 §1.1～§1.4 的基本原則寫。

### 破題結構（[§1.5](skills/paper-grid-slides/references/SCRIPT.md)）

```
開場：現況觀察（聽眾會點頭的背景）
  └→ 轉出真正的問題意識
     ├ 各段落展開
     └ 收尾：平實陳述句收束（預設不丟 mic-drop 金句）
```

三個特徵：鋪陳現況再轉問題意識、收尾平實、技術詞彙直接點名不做防禦性包裝。

適合：技術分享、方法論陳述，講者定位是「講一套做事方法」
不適合：對主管做風險敏感的正式匯報（那裡需要防禦性措辭）

### 路線圖 + 收尾回顧（[§1.6](skills/paper-grid-slides/references/SCRIPT.md)）

```
開場：列出路線圖（① 是什麼 → ② 比較 → ③ 心得）
  ├ 段落 ①
  ├ 段落 ②
  └ 段落 ③
收尾：逐點回顧，用詞與開場路線圖呼應
```

適合：教學、技術分享——聽眾從頭就有地圖，中途不迷路
不適合：需要懸念或戲劇性轉折（開場就劇透了大綱）

### 條目式報讀（[§1.7](skills/paper-grid-slides/references/SCRIPT.md)）

```
開場：路線圖，但不給總量數字
  ├ 段落 1  條目·條目·條目 + 1 個數字視覺
  ├ 段落 2  條目·條目·條目 + 1 個數字視覺
  └ 量化段（總量數字留到這裡才有參照點）
收尾：一句「以上是本月彙整」— 不逐段回顧
```

一條目一句摘要，不展開因果；**延展發生在問答，不在投影片上**。
必須配 `verbosity: concise`——刻意短是設計選擇，不是內容不足。

適合：月報／週報等例行報告，講者在場、能被當場追問
不適合：單向播放（錄影、非同步分享）、需要說服的簡報

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

repo 根目錄的 `README.md` / `CHANGELOG.md` / `docs/` **不隨 skill 安裝**——
`npx skills add` 只搬 `skills/paper-grid-slides/`。上面那些主題預覽圖放在
`docs/previews/`（純展示用），安裝者不會被迫下載。
