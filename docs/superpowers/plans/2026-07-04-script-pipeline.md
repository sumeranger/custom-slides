# 文稿產線（Plan C）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把文稿方法論吸收成 skill 自帶的 `references/SCRIPT.md` + `references/OUTLINE.md`（不再依賴 `web-video-presentation` plugin），落實 video-podcast 骨幹 + 自動對抗 critic 迴圈 + SRT-informed 切 step（**Y-assist**）+ §C.7 補齊項，並把 SKILL.md/GUIDE 的內容流程接上這兩份新文件。

**Architecture:** 兩塊——(A) **方法論文件**（prose，吸收 spec §C.2–C.7）；(B) **輕量工具**（Y-assist）：ship `edge-tts` provider + 薄的「稿→SRT」helper，SRT 真實停頓/時長交 agent 依密度判斷切 step，切好 `narrations.ts` 後直接跑**現成**逐步音頻 pipeline。切段不建自動演算法。

**Tech Stack:** Markdown（SCRIPT/OUTLINE）；bash（edge-tts provider，沿用既有 3-函式 contract）；既有 `extract-narrations.ts` + `synthesize-audio.sh` 不改介面。

**依據 spec:** `docs/superpowers/specs/2026-07-04-paper-grid-slides-skill-design.md` §C.1–C.7。本計劃是該 spec C 段的落地；authoring 任務以 spec §C 對應小節為內容來源。

## Global Constraints

- **Y-assist 機制**（spec §C.5 的機制選擇）：SRT **必產必用**，但「切在哪」由 agent 依真實停頓+密度**判斷**，**不建自動切段演算法**、不切片連續 WAV；切好 `narrations.ts` 後用現成逐步 pipeline 產音頻。
- **self-contained**：SCRIPT.md/OUTLINE.md 不得要求安裝 `web-video-presentation`。完成後 GUIDE §0 / SKILL 對它的**依賴**要移除或降為「可選延伸」。
- **不改** `narrations.ts` = step 數唯一真相源的技術不變量；不改 `extract-narrations.ts` / `synthesize-audio.sh` 的介面。
- **edge-tts**：pip 套件、免 API key，但**本機未裝**且需 `ffmpeg`；provider 的 `tts_check`/`tts_install_help` 要處理 bootstrap（`pip install edge-tts`）。
- 反 AI 腔五類、短句/口語/第二人稱、數字·專名·英文單獨審、信息保留（軟化版）為 SCRIPT.md 必含條款（spec §C.3）。
- critic 迴圈：預設 2 輪、開跑前問使用者、硬上限 4 輪（spec §C.4）。

---

### Task 1: `references/SCRIPT.md` — 文稿心法 + critic rubric + 對抗迴圈

**Files:** Create `references/SCRIPT.md`

**Interfaces:** Produces the script-authoring methodology SKILL.md / OUTLINE.md will reference. Replaces dependence on `web-video-presentation:SCRIPT-STYLE`.

必含章節（內容來源 = spec §C 對應小節，逐項落成可操作條款）：

- [ ] **Step 1: 寫 `references/SCRIPT.md`**，含以下區塊：
  1. **骨幹（§C.2）**：先寫自然口播再切點擊（段落服從語言）；section=敘事職責；**開場不套三鉤子模板**（只守：不清嗓、不 PPT 標題感；好壞由「真人聽了想不想繼續」判）；密度分級 Impact/Standard/Compact/Dense。
  2. **保留條款（§C.3）**：反 AI 腔**五類必清**（假共情/假深刻/自我標榜/萬能模板/排比）+ 判準「真人會這樣講嗎」；短句·口語·第二人稱；數字/專名/英文**單獨審一遍**；**信息保留（軟化版）**——別為湊時長灌水 + 關鍵事實/數字/論證鏈逐項對得上（不用硬 60%）。
  3. **自動對抗 critic 迴圈（§C.4）**：writer/critic 拆給不同 agent；critic rubric（五類 AI 腔 + 唸出來 + 信息保留軟化 + 人工分段痕跡）；**自動 loop 預設 2 輪、開跑前問使用者、硬上限 4 輪**；收斂後人閘門（唸一遍 wince）。核心主張句：「解不是叫 AI 寫更好，是讓獨立 critic 去聽另一個 agent 的聲音」。
  4. **§C.7 甲（TTS 連帶）**：發音預檢 `phonemes.json`（多音字/英文/品牌名三遍）+ 數字格式化規則（保留數字 vs 中文唸法）——標明 TTS 前執行。
  5. **§C.7 乙（語氣前置）**：`topic_definition`（受眾/風格/範圍/目標時長）+ tone(professional|casual)/verbosity(concise|detailed) 旋鈕，供 writer 與 critic 共用語域基準。

- [ ] **Step 2: 驗證** self-contained（不要求外掛）：
  `grep -niE "web-video-presentation|必須安裝|需要.*plugin" references/SCRIPT.md` → 應無「依賴」語意（可提一句「概念源自…」但不得要求安裝）。
- [ ] **Step 3: Commit** `docs(skill): SCRIPT.md — 吸收文稿心法 + critic rubric + 對抗迴圈`

---

### Task 2: `references/OUTLINE.md` — 敘事職責切分 + SRT-informed 切 step（Y-assist）

**Files:** Create `references/OUTLINE.md`

**Interfaces:** Consumes SCRIPT.md（同一產線後段）。Produces 章節/step 規劃法，取代 `web-video-presentation:OUTLINE-FORMAT`。

- [ ] **Step 1: 寫 `references/OUTLINE.md`**，含：
  1. **敘事職責制切分（§C.2）**：章節按「這段在敘事裡幹嘛」定（開場/全景/核心/案例/收束…按主題調），**非** 3~8 步公式。
  2. **密度分級表**：Impact(1)/Standard(2-3)/Compact(4-6)/Dense(6+) 決定每屏字量，接投影字級階。
  3. **SRT-informed 切 step 流程（§C.5，Y-assist）**：文稿收斂 → 產 SRT（見 Task 4 helper）→ **agent 讀 SRT 真實停頓/時長 + 密度，判斷切 step 邊界** → 寫各章 `narrations.ts`（step 數真相源）→ 跑現成逐步音頻 pipeline。明確聲明**不用自動切段演算法**；SRT 是判斷依據不是自動裁刀。
  4. **§C.7 丙（每章 step 數參考帶寬）**：丟掉硬公式後給非硬性參考帶（避免章節過薄/過載），由密度+SRT 停頓驅動。
- [ ] **Step 2: 驗證** self-contained（同 Task 1 grep 標準）。
- [ ] **Step 3: Commit** `docs(skill): OUTLINE.md — 敘事職責切分 + SRT-informed 切 step（Y-assist）`

---

### Task 3: `edge-tts` provider（`tts-providers/edge.sh`）

**Files:** Create `template/presentation/scripts/tts-providers/edge.sh`

**Interfaces:** 沿用既有 3-函式 contract（`tts_synthesize <text> <out> [voice]` 必要、`tts_check`、`tts_install_help`），供 `synthesize-audio.sh --provider=edge` 使用。

- [ ] **Step 1: 寫 `edge.sh`**（依 `tts-providers/README.md` 既有 snippet）：
  - `tts_synthesize`：`edge-tts --text "$1" --voice "${3:-zh-CN-YunxiNeural}" --write-media "$2"`（no API key）。
  - `tts_check`：`command -v edge-tts`（或 `python3 -m edge_tts --help`）；缺則非零。
  - `tts_install_help`：印 `pip install edge-tts`（並提醒需 `ffmpeg`）。
- [ ] **Step 2: 驗證** 契約：`bash -n edge.sh`（語法）；`source edge.sh && type tts_synthesize tts_check tts_install_help`（三函式定義）。（不實跑 TTS——本機未裝 edge-tts，屬 install-time 依賴。）
- [ ] **Step 3: Commit** `feat(skill): edge-tts provider（免 key 預設，Y-assist 音頻來源）`

---

### Task 4: 「稿→SRT」helper（Y-assist 的 SRT 產生器）

**Files:** Create `template/presentation/scripts/script-to-srt.sh`（薄封裝）

**Interfaces:** 輸入：某章連貫稿文字檔；輸出：`<name>.mp3` + `<name>.vtt`/`.srt`（供 agent 讀真實停頓）。不寫 narrations.ts（切 step 是 agent 判斷，非本工具）。

- [ ] **Step 1: 寫 `script-to-srt.sh`**：
  - 用 `edge-tts --file "$IN" --voice "${VOICE:-zh-CN-YunxiNeural}" --write-media "$OUT.mp3" --write-subtitles "$OUT.vtt"`。
  - 若 `edge-tts` 不在 PATH → 印 `tts_install_help` 等價訊息並非零退出。
  - 檔頭註解：本工具只產 SRT 供 agent 讀停頓；切 step 由 agent 依 OUTLINE.md §SRT-informed 判斷（Y-assist，不自動切）。
- [ ] **Step 2: 驗證** `bash -n script-to-srt.sh`；`--help`/無參數印用法。（不實跑，本機無 edge-tts。）
- [ ] **Step 3: Commit** `feat(skill): script-to-srt helper（Y-assist：產 SRT 供 agent 判斷切段）`

---

### Task 5: 接線 — SKILL.md / GUIDE §0 指向 SCRIPT/OUTLINE，移除 web-video 依賴

**Files:** Modify `SKILL.md`、`references/GUIDE.md`

**Interfaces:** Consumes Tasks 1–4。Produces 完整 self-contained 內容流程（了結 Plan A 刻意留下的 web-video 依賴）。

- [ ] **Step 1: `SKILL.md`「怎麼做」**：把內容流程指向 `references/SCRIPT.md` + `references/OUTLINE.md`（article → SCRIPT → OUTLINE → checkpoint → 逐章）；音頻提 `edge-tts` 為預設 provider。
- [ ] **Step 2: `references/GUIDE.md` §0**：原「內容流程優先走 `web-video-presentation` skill」→ 改為指向 `SCRIPT.md`/`OUTLINE.md`；`web-video-presentation` 降為「可選延伸/概念來源」或移除。§5 音頻段：edge-tts 為預設，保留既有 extract/synthesize 流程說明。
- [ ] **Step 3: 驗證** 依賴了結：
  `grep -rniE "優先走.*web-video|必須.*web-video|依賴.*web-video" SKILL.md references/` → 無「依賴/必須」語意（純概念提及可留）。
  路徑存在：`ls references/SCRIPT.md references/OUTLINE.md`。
- [ ] **Step 4: Commit** `docs(skill): SKILL/GUIDE 內容流程接 SCRIPT/OUTLINE，了結 web-video 依賴`

---

### Task 6: 整合驗證

- [ ] **Step 1: self-contained 複查**：乾淨路徑複製（排除 docs/.git/node_modules/.claude/.superpowers），`grep -rniE "web-video-presentation" SKILL.md references/` 僅剩「概念來源」措辭、無安裝依賴；模板 `tsc+build` 仍綠。
- [ ] **Step 2: 文件自洽**：SCRIPT.md ↔ OUTLINE.md ↔ SKILL.md 對「critic 2 輪/密度分級/SRT-informed 切段/edge-tts 預設」說法一致，無矛盾。
- [ ] **Step 3: 工具契約**：`edge.sh` 三函式、`script-to-srt.sh` 語法與用法印出正常。
- [ ] **Step 4:（可選，需網路+安裝）** 若要端到端驗證：`pip install edge-tts` 後對 example 一章連貫稿跑 `script-to-srt.sh` 產 SRT、人工看停頓合理——此為 install-time 選項，非 CI 硬閘。

---

## Self-Review

**Spec coverage（對照 spec §C）:**
- §C.2 骨幹 → Task 1(1) + Task 2(1)(2)。✓
- §C.3 保留條款 → Task 1(2)。✓
- §C.4 對抗 critic 迴圈 → Task 1(3)。✓
- §C.5 SRT-informed 切 step（**Y-assist 機制**）→ Task 2(3) + Task 4 helper + Global Constraints。✓
- §C.6 產出檔 SCRIPT/OUTLINE + 切段工具 → Task 1/2/3/4。✓
- §C.7 甲(TTS 連帶) → Task 1(4)；乙(語氣前置) → Task 1(5)；丙(step 帶寬) → Task 2(4)。✓
- 了結 Plan A 留的 web-video 依賴 → Task 5。✓

**Placeholder scan:** authoring 任務以「必含區塊 + spec 來源小節」界定內容（非空泛占位）；工具任務給確切 CLI/契約。無 TBD。

**一致性:** critic「2 輪/上限 4」在 Global Constraints、Task 1(3)、Task 6(2) 一致；Y-assist「不自動切段、SRT 交 agent 判斷」在 Architecture、Global Constraints、Task 2(3)、Task 4 一致。

**風險/待決:**
- **Y-assist 是 controller 在使用者離開時依判斷選的機制**（spec §C.5 principle 不變）；使用者回來若要 Y-auto（完整自動切段器），Task 2/4 需改寫放大。**執行前應獲使用者確認。**
- edge-tts 本機未裝：工具的實跑驗證為 install-time 選項，CI 硬閘只到語法/契約層級。
- SCRIPT.md/OUTLINE.md 為方法論 prose，品質靠 review 判讀（無自動測試），符合本 repo 既有慣例。
