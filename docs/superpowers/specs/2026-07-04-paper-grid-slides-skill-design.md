---
date: 2026-07-04
topic: paper-grid-slides — 打包成可安裝 skill + 章節進度條 + 文稿階段重規劃
status: draft
---

# paper-grid-slides：打包成可安裝 skill + 章節進度條 + 文稿階段重規劃

## 背景

`paper-grid-slides-template` 是 hank 的「點擊驅動網頁簡報」模板（暖紙編輯風 + 逐步揭示 +
hover tooltip），視覺與互動的**唯一參考基準**為最新的 `2026-06-monthly-report`
（舊的 `may-monthly-report` / `headroom-slides` 不再引用）。目前有兩個載體：

1. **模板 repo**：`/home/hank/repo/paper-grid-slides-template/`（`presentation/` + `GUIDE-FOR-AI.md`）。
2. **skill**：`/home/hank/.claude/skills/paper-grid-slides/SKILL.md`——一張「指路便條」，全靠寫死
   hank 機器上的絕對路徑（讀 `…/paper-grid-slides-template/GUIDE-FOR-AI.md`、複製
   `…/presentation/`、範例指向 `…/headroom-slides/`）。

**核心問題**：現有 skill 別人裝了根本跑不動——所有絕對路徑在別人機器上都不存在。而文稿方法論
又外包給另一個 plugin skill（`web-video-presentation`），進一步破壞可攜性。

## 目標

讓本專案**先變成給別人標準安裝的 self-contained skill**，並在打包的同時完成兩項升級：
章節進度條（B）與文稿階段重規劃（C）。

**最終形態：只剩 skill，本 repo 載體淘汰。** 打包後 skill 是唯一存活的交付物；
`paper-grid-slides-template` 這個 repo 只是遷移期的工作區，遷移完成即退役，不再維護。

本設計涵蓋四塊：

- **A**：打包成 self-contained skill（主容器）
- **B**：底部常駐章節進度條 `ChapterNav`
- **C**：文稿階段重規劃（以 video-podcast-maker 為骨幹 + 對抗式打磨）
- **D**：worktree 驗證工作流

---

## A. 打包成 self-contained skill

### A.1 目錄結構

把本 repo **重構成一個合法 skill 目錄**（單一真相源）。此結構即最終交付物；重構完成後，
skill 目錄搬到 skills 路徑成為唯一存活產物，原 template repo 退役（見「目標」）：

```
paper-grid-slides/
├── SKILL.md                    # frontmatter（name/description）+ 觸發 + 硬提醒 + 指到 references
├── references/
│   ├── GUIDE.md                # 原 GUIDE-FOR-AI：章節鐵則 / Term tooltip / 驗證腳本
│   ├── SCRIPT.md               # 【C 新增】文稿心法 + critic rubric + 對抗迴圈
│   └── OUTLINE.md              # 章節切分（敘事職責制，非公式制）
├── template/
│   └── presentation/           # 原本要複製的 Vite/React 模板（bundle 進來，不含 node_modules）
└── example/
    └── ...                     # 一個精簡範例 deck（取代指向 headroom-slides 絕對路徑）
```

### A.2 路徑去絕對化（本次打包的核心動作）

所有 `/home/hank/...` 絕對路徑改為 **skill 相對路徑**：

| 現況（寫死絕對路徑） | 改為 |
|---|---|
| 視覺/互動參考散指 `may-monthly-report` / `headroom-slides` | 收斂到唯一基準 `2026-06-monthly-report` |
| 讀 `/home/hank/repo/paper-grid-slides-template/GUIDE-FOR-AI.md` | `references/GUIDE.md`（skill 相對） |
| 複製 `…/paper-grid-slides-template/presentation/` | `template/presentation/`（skill 相對） |
| 範例 `/home/hank/repo/headroom-slides/` | `example/`（從 `2026-06-monthly-report` 取一章精簡化，bundle 進來） |
| 依賴 `web-video-presentation` skill 的內容流程 | 吸收進 `references/SCRIPT.md` + `OUTLINE.md`，不再依賴外部 plugin |
| TTS 為可選、方向反（從已切段 narrations 產 mp3） | 因 §C.5 走 Y，TTS 成必產前置；bundle **`edge-tts`（免費免 key）為預設**，並補「連貫稿→SRT→切 step」工具 |

`GUIDE.md` 內部所有跨檔引用（§ 編號、腳本路徑）一併改成 skill 相對；`headroom-slides` 相關表述
改成指向 bundle 的 `example/`。

### A.3 安裝方式

- **本階段**：安裝 = clone/複製這個 repo 進使用者的 skills 目錄（`~/.claude/skills/`）。
- **二階段（YAGNI，先不做）**：發佈成 plugin marketplace（像 `web-video-presentation` 那樣，
  需 manifest/marketplace 結構）。

### A.4 起專案流程（skill 使用者視角）

1. skill 觸發 → 讀 `references/GUIDE.md`。
2. 複製 `template/presentation/` 到新 repo → `npm install && npm run dev`。
3. 內容流程走 `references/SCRIPT.md` + `OUTLINE.md`（skill 自帶，不再需要別的 plugin）。
4. 逐章開發 → 驗證腳本 → 可選音頻合成。

---

## B. 章節進度條 `ChapterNav`

### B.1 行為

- **底部常駐**（不靠 hover），對齊參考圖：一排膠囊，每顆是一個章名，當前章 terracotta 高亮。
- **點章跳轉**：點膠囊 → `jumpToChapter(idx)`；膠囊掛 `data-no-advance` 防止點擊同時觸發翻頁。
- 保留現有 `ProgressBar`（hover 才出現的細條）作為**章內步驟**進度，與 `ChapterNav` 分工：
  - `ChapterNav` = 章層級（我在第幾章）
  - `ProgressBar` = 步層級（本章第幾步）

### B.2 資料來源

資料已現成——`registry/types.ts` 的 `ChapterDef` 已有 `id` + `title`。`ChapterNav` 讀
`CHAPTERS[].title` 排膠囊，用 stepper 的 `cursor.chapter` 判當前章。**不需新增資料欄位。**

### B.3 樣式

- 顏色一律走 token（`--accent` 高亮、`--surface` / `--text-2` 底），**不硬寫色碼**。
- 字級守投影地板（章名屬 label 類，≥22px）。
- 新增 `ChapterNav.tsx` + `ChapterNav.css`，前綴隔離。樣式覆寫仍只走 `paper-grid.css` 慣例，
  不動 `styles/` 既有檔案的既有規則。

### B.4 結構變更

新增常駐 UI 不改章節 step 數，`useStepper` 的 `STORAGE_KEY` 不需 bump。若順帶調整
example 章節結構才 bump。

---

## C. 文稿階段重規劃

### C.1 為什麼重做（診斷）

現有 template 文稿方法論薄（GUIDE §0.2 只三句），且外包給 `web-video-presentation`。而 hank
的實戰體感：**AI 直接產的第一版口播稿通常不理想**。根因有二：

1. **寫稿 agent 聽不見自己的 AI 腔**——它優化「通順文字」，不是「唸出來像人」。叫同一個 agent
   自己再改也救不了（會護自己的草稿）。
2. **web-video-presentation 的三個機制反而製造人工結構**（hank 指認的缺點，本設計採信）：

   | web-video 機制 | 為什麼產出不好 |
   |---|---|
   | 分段單位（`---` = 一想法 = 一 click，1 narration=1 step） | 逼你在寫稿當下把話切成「一 click 一句」碎片 → 為湊點擊灌水或硬拆流暢思路 → staccato、不像人講話 |
   | cold-open 三鉤子（懸念/反差/利益） | 逼每個 deck 硬選一種鉤子 → 假戲劇、標題黨感（月報/技術簡報尤其假） |
   | 章節切分（3~8 步、總時長÷30≈章數） | 用數量/時間公式切章 → 邊界機械化、湊出來的，非內容邏輯 |

   共同病根：**太規定化**。這也印證了 template 原本「1 narration=1 step」把語言節奏硬綁點擊機制
   的老問題。

### C.2 骨幹：video-podcast-maker

改以 **video-podcast-maker 的哲學為骨幹**（section 按敘事職責、beat 從口語流長出、靠唸出來
驗收、不套鉤子模板），對症修掉上表三個缺點：

1. **先寫自然口播，再切點擊**（修「分段單位」）：寫的時候像人講話、連貫成段；**之後**再找
   「哪裡該停 / 該點一下」切成 step。**段落服從語言，不服從點擊機制。**
2. **section = 敘事職責**（修「章節切分」）：章節按「這段在敘事裡幹嘛」（開場 / 全景 / 核心 /
   案例 / 收束…按主題調）定，不按 3~8 步公式。
3. **開場不套三鉤子模板**（修「cold-open」）：丟掉懸念/反差/利益硬選一個。只守兩邊都同意的
   底線——不清嗓（禁「大家好今天來聊」）、不 PPT 標題感；好不好由「真人聽了想不想繼續」判，
   不由模板判。
4. **密度分級**：Impact（1）/ Standard（2-3）/ Compact（4-6）/ Dense（6+）決定每屏字量，
   接到既有投影字級階，把「一頁一重點」量化。

### C.3 保留規則（與骨幹不衝突、hank 未批評）

- 反 AI 腔**五類必清**：假共情 / 假深刻 / 自我標榜 / 萬能模板 / 排比堆砌。
- 短句、口語、第二人稱。
- 數字 / 專名 / 英文術語**單獨審一遍**（TTS 常錯集中處）。
- **信息保留**（軟化版）：不用硬比例 60%，改用 video-podcast 說法——「別為湊時長灌水 +
  關鍵事實 / 數字 / 論證鏈逐項對得上」。保留「防過度摘要把乾貨磨掉」的好處，不引進硬數字。

### C.4 對抗式 critic 迴圈（本次核心新增，自動跑）

真人能救稿是因為換了一雙耳朵——用**另一個 agent** 當這雙耳朵：

```
素材/大綱（hank 給 or AI 調查） → article.md（數字·出處）
        ↓
① writer agent 照 C.2/C.3 全套法則寫 v1        ← 接受它不理想
        ↓
② critic agent（乾淨 context、不護短）逐句獵殺：
     · 五類 AI 腔 + 「真人會這樣講嗎」
     · 被摘掉的乾貨（信息保留軟化版）
     · 清嗓開場 / PPT 標題感 / 人工分段痕跡
   → 標記 + 重寫 → **自動 loop（預設 2 輪；開跑前問使用者要幾輪）**
        ↓
③ 人閘門（輕）：hank 唸一遍 wince test —— 驗收已打磨稿，不是搶救生肉
        ↓
④ 產出連貫自然稿 + outline（section=敘事職責）→ 切 step 見 §C.5
```

**迴圈輪數**：預設 **2 輪**（writer→critic→重寫，跑兩趟）。skill 在開跑前**問使用者要幾輪**
（可調），並設硬上限（如 4 輪）避免無限打磨燒 token。

核心主張：**「第一版不理想」的解不是叫 AI 寫更好、也不是逼人重寫，而是讓一個獨立 critic 去聽
另一個 agent 的聲音**——AI 聽不見自己，但聽得見別人。critic 迴圈**自動跑**（主 agent 自己
spawn critic subagent），hank 只在最後唸一遍驗收。

### C.5 切 step：忠於 video-podcast 流程（SRT 必產、提早）

**決定走 Option Y**——採 video-podcast 的作法：**先產 SRT，再用真實停頓/時長切 step**
（不靠純文字猜「哪裡該點一下」）。產線順序：

1. 文稿收斂後（C.4 出連貫自然口播 + section=敘事職責的 outline）。
2. **TTS 一次**（跑在收斂後的稿上，**非每輪 critic 都跑**）→ 產 **SRT**（詞/句時間戳）。SRT 必產。
3. 用 SRT 的實際停頓 + 密度分級**切 step** → 寫進各章 `narrations.ts`；音頻按 step 邊界切片/對齊
   （沿用 video-podcast 的 **align-from-SRT** 模式，避免二次 TTS）。
4. 建章節。播放時**點擊手動推進 or auto（`audio.ended`）並存**——click 控制不受影響（正交）。

`narrations.ts` 仍是 step 數唯一真相源；step 邊界由 SRT 決定，不是寫時**湊**出來。

**取捨（誠實揭露）**：TTS 因此從「可選的最後一步」變成**開發時必產的前置**。兩點緩解：

- **critic 迴圈維持純文字**、TTS 只在收斂後跑一次，不每輪燒。
- **預設用免費、免 API key 的 TTS（`edge-tts`，video-podcast 的預設）**，把「別人裝了得先接
  TTS」的門檻壓到最低；需要更好音色再換 provider。

> click-driven 是本工具的**產品身分**（人控節奏 + hover tooltip + 點章跳轉），保留不變。
> SRT 必產只改變「切 step 的依據」與「TTS 的時機」，**不改變誰控制翻頁**。

### C.6 產出檔案

- **`references/SCRIPT.md`**：C.2–C.5 全部寫成 skill 自帶文稿心法，含 critic rubric（五類
  AI 腔判準 + 信息保留軟化版 + 人工分段痕跡清單）與對抗迴圈流程。取代對
  `web-video-presentation:SCRIPT-STYLE` 的依賴。
- **`references/OUTLINE.md`**：章節切分改「敘事職責制」，含「先寫自然稿 →（§C.5）TTS→SRT→
  依真實停頓切 step」流程與密度分級表。取代對 `web-video-presentation:OUTLINE-FORMAT` 的依賴。
- **切段工具（新增）**：對收斂後連貫稿產 SRT + 依 SRT 切 step 寫回 `narrations.ts` 的腳本
  （沿用 video-podcast 的 align-from-SRT 模式）；預設 TTS = `edge-tts`。細節於 implementation。

---

## D. worktree 驗證工作流

本 repo 已從「純 slides」轉為「工具 / skill repo」，故 hank 全域偏好中「slides 例外不用
worktree」不適用；且 hank 明確要求用 worktree 測試。約定：

**每次對 skill 做出改動後**：

1. 開 git worktree（隔離工作區）。
2. 依 skill 流程，以 `/home/hank/repo/2026-06-monthly-report/script.md` 為輸入，**實際產一次 deck**
   （含 §C.5 的 TTS→SRT→切 step；測試環境用預設 `edge-tts`）。
3. 跑 `npx tsc --noEmit`（0 錯誤）+ 逐步截圖目測（版面、字級、進度條、動畫完成態）。
4. 針對本次改動重點驗證：B → 章節 bar 常駐 / 高亮 / 點跳；C → 文稿 critic 迴圈可跑 + SRT 切 step 正確。
5. 收掉 worktree（未改動自動清除）。

---

## 驗收方法（整體）

- **A**：全 repo grep 無 `/home/hank` 絕對路徑；把 skill 複製到乾淨路徑仍能起專案。
- **B**：截圖確認章節 bar 常駐、當前章高亮、點膠囊跳章且不誤翻頁；字級 ≥22px、走 token。
- **C**：`references/SCRIPT.md` / `OUTLINE.md` 存在且 self-contained（不引用外部 plugin）；
  critic 迴圈能對 `2026-06-monthly-report` 素材自動跑（預設 2 輪）到收斂。
- **D**：一次完整 worktree 測試通過（tsc 0 錯 + 截圖目測 OK）。

## 範圍界線（YAGNI）

- **不做** plugin marketplace 發佈（二階段）。
- **不改** `styles/` 既有主題規則（只新增 `ChapterNav` 前綴樣式）。
- **不動** `narrations.ts` = step 數真相源的技術不變量。
- **不做** 音頻合成 pipeline 的重寫（沿用現有 extract-narrations / synthesize-audio）。

## 已決事項（原開放問題）

- **範例 deck 來源** → 從 `2026-06-monthly-report` 取一章精簡化，bundle 進 `example/`
  （取哪一章、去識別哪些專屬內容，於 implementation 決定）。
- **critic 迴圈輪數** → 預設 2 輪，開跑前問使用者可調，硬上限 4 輪。
- **切 step 方式** → 走 **Option Y：忠於 video-podcast，SRT 必產、提早**，用真實停頓切 step。
- **TTS** → 從可選變必產前置；預設 `edge-tts`（免費免 key）壓低門檻。
- **click-driven** → 保留為產品身分（正交於 SRT），不拔除。

## 開放問題 / 風險

1. **切段工具是新工作量**：「連貫稿→SRT→依 SRT 切 step 寫回 narrations.ts」是現有 pipeline 沒有的
   （現有方向相反），要新做；含 edge-tts 整合與 align-from-SRT。
2. **TTS 必產抬高門檻**：即使預設 edge-tts 免 key，仍比「純文字就能做無聲 deck」多一道環境依賴；
   需在 SKILL.md 明確標示前置需求與安裝步驟。
3. **GUIDE.md 內文遷移量**：原 GUIDE-FOR-AI 有大量 § 交叉引用與絕對路徑，遷移時要逐一校對。
4. **skill 最終落點**：重構完成後 skill 目錄搬到哪個 skills 路徑成為存活產物（`~/.claude/skills/`
   或專屬 skill repo），於 implementation 確認；原 template repo 退役時機一併決定。
