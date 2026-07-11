# paper-grid-slides 多主題架構重構 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `paper-grid-slides` skill 目前「一份寫死的 dark tokens.css + 一份用 `:root` 全面覆寫的 `paper-grid.css`」的雙層硬編架構，重構成 `themes/<id>/` 可插拔主題目錄（仿姊妹 skill `web-video-presentation` 的模式），並新增一個 `dbx-style` 主題，同時保證重構後 `paper-grid` 主題的視覺輸出與 `/home/hank/repo/ai-project-lifecycle-slides` 現況零差異。

**Architecture:** 每個主題資料夾含 `theme.json`（metadata）+ `tokens.css`（純 `:root` 自訂屬性，load 在 `base.css` 之前）+ 可選的 `extras.css`（選擇器層覆寫，load 在 `base.css`/`animations.css` 之後）。新增 `scripts/scaffold.sh --theme=<id>` 把選定主題的兩個 CSS 檔複製進已用 `cp -r template/presentation` 建立好的專案目錄。`template/presentation/` 本身內建 `paper-grid` 主題當預設（維持現有零摩擦的 `cp -r` 即可用的體驗）。

**Tech Stack:** 純 CSS 自訂屬性（CSS Custom Properties）+ bash（`scaffold.sh`）。不涉及 TypeScript/React 程式碼變更（`chapters.ts` 的 regex parser、`extract-narrations.ts` 完全不受影響，因為本次重構只動 `src/styles/`）。

## Global Constraints

- **硬性前提 1**：`paper-grid` 是使用者現在要用、要保留的主題；`midnight-press` 只是舊殘留，這次重構**不能改動它的任何渲染值**，只是把它原封不動搬進 `themes/midnight-press/`。
- **硬性前提 2**：重構後的 `themes/paper-grid/`，套用到一個新專案時的視覺輸出，必須跟 `/home/hank/repo/ai-project-lifecycle-slides` 現有的實際樣子**零差異**（任何顏色/字體/間距/陰影偏移都算失敗）。這是最高優先的驗收標準，優先於「架構乾淨」。
- **硬性前提 3**：不要因為新增 DBX 主題，順手「順便優化」paper-grid 既有視覺——不在這次任務範圍內。
- **關鍵技術限制（本輪 plan 新發現，之前的交接文件沒抓到）**：`base.css` 裡本來就定義了 `.stage-frame`、`.card` 等具體選擇器規則（用 `var()` 消費 token）。任何主題若也要對**同一個選擇器**下覆寫具體屬性值（不是只改 token），那條規則**必須載入在 `base.css` 之後**，否則會被 `base.css` 自己的同選擇器規則用「相同 specificity、後載入者贏」蓋掉。這就是為什麼每個主題要拆兩個檔：`tokens.css`（純 `:root`，load 在 base 前）+ `extras.css`（選擇器層，load 在 base 後）。`paper-grid` 主題目前的 `.stage-frame` 陰影覆寫、`.v-corners`/`.v-pill` 等新增 primitive、以及舊的 `paper-grid-cards.css` 章節 class 覆寫，全部屬於後者。
- **不在這次範圍內**：回到 `dbx-slides` 專案套用 `dbx-style` 主題、開始寫 DBX 簡報內容——這是下一個 plan 的事，本 plan 只到「主題架構重構 + 驗收通過」為止。
- 本 skill（`/home/hank/.claude/skills/paper-grid-slides/`）本身是一個獨立 git repo，已有 `docs/superpowers/plans/`、`docs/superpowers/specs/` 慣例，這份 plan 就存在這裡。每個 task 完成後在**這個 repo**裡 commit（不是 `dbx-slides`）。

---

### Task 1: 建立 `themes/midnight-press/`（原樣搬遷，不修改任何值）

**Files:**
- Create: `themes/midnight-press/theme.json`
- Create: `themes/midnight-press/tokens.css`
- Create: `themes/midnight-press/extras.css`

**Interfaces:**
- Consumes: 無（第一個 task，從現有 `template/presentation/src/styles/tokens.css` 的內容原樣複製）
- Produces: `themes/midnight-press/{theme.json,tokens.css,extras.css}`，供 Task 4 的 `scaffold.sh` 與 Task 6 的 `THEMES.md` 引用主題清單時使用

- [ ] **Step 1: 建立目錄並原樣複製 tokens.css**

```bash
mkdir -p /home/hank/.claude/skills/paper-grid-slides/themes/midnight-press
cp /home/hank/.claude/skills/paper-grid-slides/template/presentation/src/styles/tokens.css \
   /home/hank/.claude/skills/paper-grid-slides/themes/midnight-press/tokens.css
```

- [ ] **Step 2: 驗證複製結果與原檔零差異**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
diff <(git show HEAD:template/presentation/src/styles/tokens.css) themes/midnight-press/tokens.css
```

Expected: 無輸出（完全一致）。

- [ ] **Step 3: 建立 `extras.css` 佔位檔**

寫入 `themes/midnight-press/extras.css`：

```css
/* theme 'midnight-press' has no selector-level overrides — kept as a
 * verbatim carry-over of this skill's original dark theme; tokens.css
 * alone reproduces its look. Not actively used by this skill today
 * (paper-grid is); preserved unmodified per the theme-refactor's hard
 * constraint not to touch its behavior. */
```

- [ ] **Step 4: 建立 `theme.json`**

```json
{
  "id": "midnight-press",
  "name": "Midnight Press",
  "nameZh": "午夜印刷",
  "description": "Cinematic editorial dark. Warm espresso, not pure black, single hot-orange accent.",
  "descriptionZh": "電影感編輯級深色，暖色 espresso 底、單一火熱橙 accent。此 skill 的舊主題，保留原樣不修改視覺。",
  "mood": ["dark", "editorial", "cinematic", "warm"],
  "bestFor": ["備用舊主題（此 skill 目前實際使用與驗收的是 paper-grid）"],
  "preview": {
    "shell": "#0d0b09",
    "surface": "#1a1714",
    "text": "#f5f0e5",
    "accent": "#ff4a2b"
  }
}
```

- [ ] **Step 5: Commit**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git add themes/midnight-press
git commit -m "feat(themes): add midnight-press as a pluggable theme (verbatim carry-over)"
```

---

### Task 2: 建立 `themes/paper-grid/`（拆成 tokens.css + extras.css，值必須逐字保留）

**Files:**
- Create: `themes/paper-grid/theme.json`
- Create: `themes/paper-grid/tokens.css`
- Create: `themes/paper-grid/extras.css`

**Interfaces:**
- Consumes: 現有 `template/presentation/src/styles/paper-grid.css`（167 行）與 `paper-grid-cards.css`（272 行）
- Produces: `themes/paper-grid/{theme.json,tokens.css,extras.css}`

**關鍵事實**：`paper-grid.css` 的 `:root { ... }` 區塊在第 14–71 行（純 token，可直接搬進 `tokens.css`）；第 73–167 行是 `.stage-frame` 覆寫 + `.v-corners`/`.v-pill`/`.v-breadcrumb`/`.v-strike`/`.v-serif-bold` primitive（選擇器層，必須進 `extras.css`）。`paper-grid-cards.css` 全檔（272 行）都是 `.scene .xx-*` 章節 class 覆寫，同樣是選擇器層，整份併入 `extras.css`（跟上面那段順序無關——兩者的選擇器互不重疊，合併順序不影響渲染結果）。

- [ ] **Step 1: 建立目錄**

```bash
mkdir -p /home/hank/.claude/skills/paper-grid-slides/themes/paper-grid
```

- [ ] **Step 2: 用 `sed` 精確切出 `:root` 區塊寫成 `tokens.css`**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
{
  echo '/* ─────────────────────────────────────────────────────────────────────'
  echo ' * Theme · paper-grid'
  echo ' *   Warm-cream editorial paper look + blueprint grid signature. This is'
  echo ' *   the theme this skill actively develops decks against.'
  echo ' *'
  echo ' *   character knobs:'
  echo ' *     • hero numbers   — bold italic editorial serif (Fraunces)'
  echo ' *     • rule           — 1.5px solid warm hairline'
  echo ' *     • card           — refined 8px radius, paper-lift shadow'
  echo ' *     • surface        — blueprint grid (multiply) + warm vignette'
  echo ' *     • motion         — moderate, editorial (600/950/1400ms)'
  echo ' *'
  echo ' *   Selector-level overrides this theme also needs (.stage-frame edge,'
  echo ' *   .v-corners/.v-pill/.v-breadcrumb/.v-strike/.v-serif-bold primitives,'
  echo ' *   and legacy .scene .co-*/.av-*/.at-*/.cl-*/.mn-* chapter-card'
  echo ' *   overrides) live in the sibling extras.css — see THEMES.md for why'
  echo ' *   this theme needs both files while dbx-style needs only this one.'
  echo ' * ───────────────────────────────────────────────────────────────────── */'
  sed -n '14,71p' template/presentation/src/styles/paper-grid.css
} > themes/paper-grid/tokens.css
```

- [ ] **Step 3: 驗證 `:root` 區塊本體（非註解部分）逐字未改**

```bash
diff <(sed -n '14,71p' <(git show HEAD:template/presentation/src/styles/paper-grid.css)) \
     <(tail -n +21 themes/paper-grid/tokens.css)
```

Expected: 無輸出。（`tail -n +21` 跳過上一步寫入的 20 行新註解，只比對 `:root { ... }` 本體，行號需與實際寫入的註解行數對齊，執行前先用 `wc -l` 確認註解區塊剛好 20 行，若不是就調整 `tail -n +N`。）

- [ ] **Step 4: 用 `sed` 切出選擇器層部分，寫成 `extras.css` 的第一部分**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
{
  echo '/* ─────────────────────────────────────────────────────────────────────'
  echo ' * paper-grid theme · extras.css'
  echo ' *'
  echo ' * Selector-level rules that must load AFTER base.css + animations.css'
  echo ' * so they win cascade over base.css'"'"'s own same-selector rules (see'
  echo ' * plan Global Constraints for why tokens.css alone is not enough here).'
  echo ' *'
  echo ' * Part 1 (below): .stage-frame paper-edge override + the .v-* global'
  echo ' *   primitives this theme adds on top of base.css.'
  echo ' * Part 2 (further down): legacy per-chapter-card overrides, verbatim'
  echo ' *   from the old paper-grid-cards.css (scoped under .scene, hard-'
  echo ' *   coupled to historical chapter class prefixes — see THEMES.md'
  echo ' *   anti-patterns before copying this pattern into a new theme).'
  echo ' * ───────────────────────────────────────────────────────────────────── */'
  sed -n '73,167p' template/presentation/src/styles/paper-grid.css
} > themes/paper-grid/extras.css
```

- [ ] **Step 5: 驗證 Part 1 本體逐字未改**

```bash
diff <(sed -n '73,167p' <(git show HEAD:template/presentation/src/styles/paper-grid.css)) \
     <(tail -n +19 themes/paper-grid/extras.css | head -n 95)
```

Expected: 無輸出（同上，先用 `wc -l` 確認上一步寫入的註解剛好 18 行再對齊 `tail -n +N`）。

- [ ] **Step 6: 把整份 `paper-grid-cards.css` 原樣附加到 `extras.css`**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
{
  echo ""
  echo '/* ─── Part 2: legacy per-chapter-card overrides (verbatim from the old'
  echo ' * paper-grid-cards.css). See THEMES.md "extras.css 反模式" before'
  echo ' * reusing this pattern in a new theme. ─────────────────────────────── */'
  cat template/presentation/src/styles/paper-grid-cards.css
} >> themes/paper-grid/extras.css
```

- [ ] **Step 7: 驗證附加的 Part 2 與原檔逐字一致**

```bash
diff <(git show HEAD:template/presentation/src/styles/paper-grid-cards.css) \
     <(tail -n 272 themes/paper-grid/extras.css)
```

Expected: 無輸出（`paper-grid-cards.css` 原檔共 272 行；若行數對不上先 `wc -l template/presentation/src/styles/paper-grid-cards.css` 確認）。

- [ ] **Step 8: 建立 `theme.json`**

```json
{
  "id": "paper-grid",
  "name": "Paper Grid",
  "nameZh": "暖紙藍圖",
  "description": "Warm cream paper with terracotta accent and a blueprint grid signature. The default and only actively-used theme in this skill.",
  "descriptionZh": "暖紙編輯風＋磚紅 accent＋藍圖網格簽名。本 skill 目前實際使用與驗收的預設主題。",
  "mood": ["light", "editorial", "warm", "field-notebook"],
  "bestFor": ["技術簡報", "教程", "產品評測"],
  "preview": {
    "shell": "#e0d5be",
    "surface": "#f4ecd8",
    "text": "#1a1310",
    "accent": "#b53d22"
  }
}
```

- [ ] **Step 9: Commit**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git add themes/paper-grid
git commit -m "feat(themes): add paper-grid as a pluggable theme, split into tokens.css + extras.css"
```

---

### Task 3: 建立 `themes/dbx-style/`（新主題，套用 DBX 官網色票）

**Files:**
- Create: `themes/dbx-style/theme.json`
- Create: `themes/dbx-style/tokens.css`
- Create: `themes/dbx-style/extras.css`

**Interfaces:**
- Consumes: `base.css` 既有的 `--surface-vignette`（消費在 `.stage-frame::before`）與 `--surface-pattern*`（消費在 `.stage-frame::after`）、`.card-glass` 消費 `--card-glass-bg`/`--card-glass-border`——這些消費點已存在於 `base.css`，不需要新增任何 token 插槽。
- Produces: `themes/dbx-style/{theme.json,tokens.css,extras.css}`

**設計依據**：DBX 官網實測色票（見交接文件）簡化為固定裝飾（不逐畫素還原，使用者已拍板）。因為所有效果都能用既有 token 插槽表達（角落光暈用 `--surface-vignette` 放兩個 `radial-gradient`、玻璃卡片用 `--card-glass-bg`/`--card-glass-border`），這個主題**不需要 `extras.css` 的任何選擇器層規則**——證明「tokens-only」在這個 skill 裡依然可行，`paper-grid` 需要 `extras.css` 是歷史技術債，不是必然模式。

- [ ] **Step 1: 建立目錄**

```bash
mkdir -p /home/hank/.claude/skills/paper-grid-slides/themes/dbx-style
```

- [ ] **Step 2: 寫入 `tokens.css`**

```css
/* ─────────────────────────────────────────────────────────────────────
 * Theme · dbx-style
 *   Dark tech engineering aesthetic modeled on the DBX website
 *   (https://dbxio.com/cn). Deep blue-black backdrop, glass cards,
 *   a single steel-blue accent, fixed two-corner glow decoration.
 *
 *   Deliberate simplifications vs. the live site (agreed with user):
 *     • the site's animated multi-layer glass/glow is replaced by ONE
 *       fixed corner-glow decoration (--surface-vignette) — no per-
 *       chapter glow variation, no motion.
 *     • the site has no custom webfont (Tailwind system-font stack);
 *       --font-mono here is an addition this theme needs because the
 *       shared base.css primitives (.kicker/.label-mono/.badge-mono/
 *       .corner-mark) require a monospace family the DBX brand itself
 *       doesn't define.
 *
 *   character knobs:
 *     • hero numbers   — bold tabular mono (approximates DBX's
 *                         font-[820]/[780] heavy-weight numerals)
 *     • rule           — 1px hairline, same hue family as the site's
 *                         --line token
 *     • card           — glass: translucent surface + hairline border
 *     • surface        — two fixed corner glows (blue + green), no grain
 *     • motion         — kept at base.css defaults (punchy/crisp fits
 *                         the engineering tone; this theme doesn't need
 *                         a slow/cinematic override)
 *
 *   No extras.css needed: every effect above is expressed purely
 *   through these tokens, consumed by primitives base.css already
 *   defines (.card-glass, .stage-frame::before/::after). See THEMES.md.
 * ───────────────────────────────────────────────────────────────────── */
:root {
  /* ─── palette ─── */
  --shell:        #070b14;
  --surface:      #0b1120;
  --surface-2:    #131a2c;
  --surface-3:    #1a2338;
  --text:         #f7fbff;
  --text-2:       #d7e1ef;
  --text-mute:    #9aa9bc;
  --text-faint:   #5b6a80;
  --rule:         rgba(155, 176, 205, 0.18);
  --accent:       #6ea8ff;
  --accent-soft:  rgba(110, 168, 255, 0.12);
  --accent-glow:  rgba(110, 168, 255, 0.35);

  /* ─── fonts: system stack (DBX ships no custom webfont) ─── */
  --font-display-cn: -apple-system, "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif;
  --font-display-en: ui-sans-serif, -apple-system, system-ui, sans-serif;
  --font-body:       ui-sans-serif, -apple-system, system-ui, sans-serif;
  --font-mono:       ui-monospace, "SF Mono", "JetBrains Mono", monospace;
  --font-features:   "tnum";

  /* ─── design identity ─── */
  --r-card:        10px;
  --r-stage:       0;
  --rule-w:        1px;
  --rule-style:    solid;
  --hero-num-font:    var(--font-mono);
  --hero-num-style:   normal;
  --hero-num-weight:  700;
  --hero-num-track:   -0.02em;
  --stage-pad-x:   120px;
  --stage-pad-y:   90px;
  --card-shadow:
    0 18px 44px rgba(0, 0, 0, 0.14),
    inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  --card-glass-bg:     rgba(12, 15, 22, 0.72);
  --card-glass-border: rgba(155, 176, 205, 0.18);
  --shadow-stage:
    0 60px 160px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(110, 168, 255, 0.05);

  /* ─── decoration: 58px faint blue grid + two fixed corner glows ───
   * Fixed = identical on every chapter (not content-driven), per the
   * user's simplification call — no dynamic/animated glow. */
  --surface-pattern:
    linear-gradient(to right,  rgba(110, 168, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(110, 168, 255, 0.08) 1px, transparent 1px);
  --surface-pattern-size: 58px 58px;
  --surface-pattern-blend: screen;
  --surface-pattern-opacity: 0.5;
  --surface-vignette:
    radial-gradient(600px circle at 100% 0%, rgba(110, 168, 255, 0.16), transparent 60%),
    radial-gradient(500px circle at 0% 100%, rgba(68, 209, 157, 0.12), transparent 60%);
}
```

- [ ] **Step 3: 寫入 `extras.css` 佔位檔**

```css
/* theme 'dbx-style' has no selector-level overrides — every effect
 * (glass cards, corner glow, grid) is expressed purely through the
 * tokens.css custom properties that base.css's primitives already
 * consume (.card-glass, .stage-frame::before/::after). See THEMES.md
 * for why paper-grid needs this file and dbx-style doesn't. */
```

- [ ] **Step 4: 建立 `theme.json`**

```json
{
  "id": "dbx-style",
  "name": "DBX Style",
  "nameZh": "DBX 深色科技",
  "description": "Dark tech blue-green palette with glass cards and fixed corner glow, based on the DBX website.",
  "descriptionZh": "深色科技感＋玻璃質感工程師風，取自 DBX 官網色票，固定角落光暈裝飾（不逐畫素還原官網）。",
  "mood": ["dark", "tech", "engineering", "glass"],
  "bestFor": ["產品簡報", "技術評測", "工程團隊分享"],
  "preview": {
    "shell": "#070b14",
    "surface": "#0b1120",
    "text": "#f7fbff",
    "accent": "#6ea8ff"
  }
}
```

- [ ] **Step 5: Commit**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git add themes/dbx-style
git commit -m "feat(themes): add dbx-style theme (dark tech, DBX website palette)"
```

---

### Task 4: 寫 `scripts/scaffold.sh`

**Files:**
- Create: `scripts/scaffold.sh`

**Interfaces:**
- Consumes: `themes/<id>/{tokens.css,extras.css}`（Task 1–3 產物）
- Produces: 對一個已用 `cp -r template/presentation <target>` 建好的專案目錄，寫入 `<target>/src/styles/tokens.css`、`<target>/src/styles/extras.css`、`<target>/.theme`

- [ ] **Step 1: 建立 `scripts/` 目錄與腳本**

```bash
mkdir -p /home/hank/.claude/skills/paper-grid-slides/scripts
```

寫入 `/home/hank/.claude/skills/paper-grid-slides/scripts/scaffold.sh`：

```bash
#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# scaffold.sh — apply a theme to an already-created presentation
# project (created via `cp -r template/presentation <target>`).
#
# Usage:
#   bash scripts/scaffold.sh <target-presentation-dir> [--theme=<id>]
#   bash scripts/scaffold.sh --list-themes
#
# Example:
#   cp -r template/presentation ./dbx-talk
#   bash <skill-root>/scripts/scaffold.sh ./dbx-talk --theme=dbx-style
#
# Copies themes/<id>/tokens.css + themes/<id>/extras.css into
# <target>/src/styles/, and writes <target>/.theme so later sessions
# can tell which theme a project started from.
#
# Default theme (no --theme flag): paper-grid — the only theme this
# skill actively develops decks against today. midnight-press and
# dbx-style are opt-in.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THEMES_DIR="$SKILL_DIR/themes"
DEFAULT_THEME="paper-grid"

list_themes() {
  echo "可用主題（來自 ${THEMES_DIR}）:"
  echo
  for dir in "$THEMES_DIR"/*/; do
    [[ -d "$dir" ]] || continue
    meta="$dir/theme.json"
    [[ -f "$meta" ]] || continue
    id=$(grep -E '"id"' "$meta" | head -n1 | sed -E 's/.*"id":[[:space:]]*"([^"]+)".*/\1/')
    name=$(grep -E '"nameZh"' "$meta" | head -n1 | sed -E 's/.*"nameZh":[[:space:]]*"([^"]+)".*/\1/')
    desc=$(grep -E '"descriptionZh"' "$meta" | head -n1 | sed -E 's/.*"descriptionZh":[[:space:]]*"([^"]+)".*/\1/')
    printf "  • %-16s %s\n      %s\n\n" "$id" "$name" "$desc"
  done
  echo "用 --theme=<id> 選定一個。預設：${DEFAULT_THEME}。"
}

TARGET=""
THEME="$DEFAULT_THEME"
for arg in "$@"; do
  case "$arg" in
    --list-themes)
      list_themes
      exit 0
      ;;
    --theme=*)
      THEME="${arg#--theme=}"
      ;;
    --*)
      echo "✗ 未知參數: $arg" >&2
      exit 1
      ;;
    *)
      if [[ -z "$TARGET" ]]; then TARGET="$arg"; fi
      ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "✗ 缺少目標目錄。用法: scaffold.sh <target-presentation-dir> [--theme=<id>]" >&2
  exit 1
fi
if [[ ! -d "$TARGET/src/styles" ]]; then
  echo "✗ '$TARGET/src/styles' 不存在。先 cp -r template/presentation <target>，" >&2
  echo "  再對已存在的專案套主題。" >&2
  exit 1
fi

THEME_DIR="$THEMES_DIR/$THEME"
if [[ ! -f "$THEME_DIR/tokens.css" ]]; then
  echo "✗ 找不到主題 '${THEME}'。可用主題：" >&2
  for dir in "$THEMES_DIR"/*/; do
    [[ -d "$dir" ]] || continue
    echo "    • $(basename "$dir")" >&2
  done
  exit 1
fi

cp "$THEME_DIR/tokens.css" "$TARGET/src/styles/tokens.css"

if [[ -f "$THEME_DIR/extras.css" ]]; then
  cp "$THEME_DIR/extras.css" "$TARGET/src/styles/extras.css"
else
  echo "/* theme '$THEME' has no selector-level overrides. */" \
    > "$TARGET/src/styles/extras.css"
fi

echo "$THEME" > "$TARGET/.theme"

echo "✓ 已套用主題：$THEME"
echo "  改了 $TARGET/src/styles/tokens.css、$TARGET/src/styles/extras.css、$TARGET/.theme"
echo "  重新整理 dev server 即可看到效果，章節程式碼一行沒動。"
```

- [ ] **Step 2: 加執行權限**

```bash
chmod +x /home/hank/.claude/skills/paper-grid-slides/scripts/scaffold.sh
```

- [ ] **Step 3: 手動跑一次 smoke test（在暫存目錄，不影響任何現有專案）**

```bash
rm -rf /tmp/scaffold-smoke-test
cp -r /home/hank/.claude/skills/paper-grid-slides/template/presentation /tmp/scaffold-smoke-test
bash /home/hank/.claude/skills/paper-grid-slides/scripts/scaffold.sh /tmp/scaffold-smoke-test --theme=dbx-style
cat /tmp/scaffold-smoke-test/.theme
diff /home/hank/.claude/skills/paper-grid-slides/themes/dbx-style/tokens.css \
     /tmp/scaffold-smoke-test/src/styles/tokens.css
bash /home/hank/.claude/skills/paper-grid-slides/scripts/scaffold.sh --list-themes
rm -rf /tmp/scaffold-smoke-test
```

Expected: `.theme` 內容為 `dbx-style`；兩份 `tokens.css` diff 無輸出；`--list-themes` 印出三個主題（`midnight-press`/`paper-grid`/`dbx-style`）與各自中文名稱/描述。

- [ ] **Step 4: Commit**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git add scripts/scaffold.sh
git commit -m "feat(scaffold): add scripts/scaffold.sh --theme=<id> to switch themes on an existing project"
```

---

### Task 5: 重接 `template/presentation/` 預設值（改用拆分後的 paper-grid 主題）

**Files:**
- Modify: `template/presentation/src/App.tsx:1-6`
- Modify: `template/presentation/src/styles/tokens.css`（整份替換成 `themes/paper-grid/tokens.css` 內容）
- Create: `template/presentation/src/styles/extras.css`（= `themes/paper-grid/extras.css` 內容）
- Delete: `template/presentation/src/styles/paper-grid.css`
- Delete: `template/presentation/src/styles/paper-grid-cards.css`
- Modify: `template/presentation/.theme`（內容改為 `paper-grid`）

**Interfaces:**
- Consumes: Task 2 產物 `themes/paper-grid/{tokens.css,extras.css}`
- Produces: `template/presentation/` 在**不執行 scaffold.sh**、直接 `cp -r` 的情況下，渲染結果與重構前完全一致（因為預設主題就是 paper-grid，只是換了個內部檔案組織方式）

這是驗收零差異最關鍵的一步，因為 `template/presentation/` 就是 `ai-project-lifecycle-slides` 當初的來源模板。

- [ ] **Step 1: 用 Edit 改 `App.tsx` 的 import 區塊**

現有內容（`App.tsx:1-6`）：
```tsx
import "./styles/fonts.css"; // Google Fonts for built-in themes
import "./styles/tokens.css"; // active theme — generated by scaffold (see THEMES.md)
import "./styles/base.css";
import "./styles/animations.css";
import "./styles/paper-grid.css"; // restyle layer — overrides tokens.css (cream paper + terracotta)
import "./styles/paper-grid-cards.css"; // chapter-card corner-brackets overrides
```

改成：
```tsx
import "./styles/fonts.css"; // Google Fonts for built-in themes
import "./styles/tokens.css"; // active theme's :root vars — see THEMES.md
import "./styles/base.css";
import "./styles/animations.css";
import "./styles/extras.css"; // active theme's selector-level overrides (optional; see THEMES.md)
```

- [ ] **Step 2: 用 Task 2 產物覆蓋 `tokens.css`、新增 `extras.css`**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
cp themes/paper-grid/tokens.css template/presentation/src/styles/tokens.css
cp themes/paper-grid/extras.css template/presentation/src/styles/extras.css
```

- [ ] **Step 3: 刪除舊的兩個 restyle 檔案**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
rm template/presentation/src/styles/paper-grid.css
rm template/presentation/src/styles/paper-grid-cards.css
```

- [ ] **Step 4: 更新 `.theme` 標記檔（讓它從死檔案變成準確反映預設主題）**

```bash
echo "paper-grid" > /home/hank/.claude/skills/paper-grid-slides/template/presentation/.theme
```

- [ ] **Step 5: 驗證「新拼裝出的預設 cascade」跟「重構前的實際 cascade」渲染值等價**

這一步不是逐檔 diff（檔案數量、順序都變了），而是驗證**每個屬性最終贏家值**相同。用 CSS 自訂屬性的 cascade 規則手動推導：

```bash
cd /home/hank/.claude/skills/paper-grid-slides

# 重構前：tokens(midnight-press :root) 先出現，paper-grid.css 的 :root 後出現
# → 同選擇器 :root、後者贏，所以「有效值」= paper-grid.css 的 :root 內容
diff <(git show HEAD:template/presentation/src/styles/paper-grid.css | sed -n '14,71p') \
     <(sed -n '14,$p' template/presentation/src/styles/tokens.css | head -n 58)
```

Expected: 無輸出（新 `tokens.css` 的 `:root` 本體要跟舊 `paper-grid.css` 的 `:root` 本體逐字一致——這就是重構前「後者覆寫贏」跟重構後「唯一來源」在數值上等價的證明）。

```bash
# .stage-frame 覆寫 + primitives + 章節 card 覆寫：
# 重構前這些規則在 paper-grid.css / paper-grid-cards.css，載入順序在 base.css 之後 → 贏 base.css 同選擇器規則
# 重構後搬進 extras.css，一樣載入在 base.css 之後 → 贏的規則不變
diff themes/paper-grid/extras.css template/presentation/src/styles/extras.css
```

Expected: 無輸出。

- [ ] **Step 6: 跑 `npx tsc --noEmit` 與 `npm run build` 確認沒有因為刪檔/ 改 import 造成型別或打包錯誤**

```bash
cd /home/hank/.claude/skills/paper-grid-slides/template/presentation
npm install
npx tsc --noEmit
npm run build
```

Expected: 兩者皆無錯誤（`paper-grid.css`/`paper-grid-cards.css` 只是 CSS import，不影響 TS 型別檢查，但 build 若因為 import 路徑寫錯會直接報 "Failed to resolve import"，要確認沒有）。

- [ ] **Step 7: Commit**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git add template/presentation
git commit -m "refactor(template): default template now composes paper-grid from themes/, drop hard-coded paper-grid.css/paper-grid-cards.css"
```

---

### Task 6: 寫 `references/THEMES.md`

**Files:**
- Create: `references/THEMES.md`

**Interfaces:**
- Consumes: Task 1–3 建立的三個主題資料夾內容、`base.css` 現有 token 清單
- Produces: 給未來 AI agent／使用者看的主題系統規格文件，`chapters.ts`、`App.tsx`、`fonts.css` 裡對 `THEMES.md` 的既有引用從「斷鏈」變成「有效連結」

- [ ] **Step 1: 寫入 `/home/hank/.claude/skills/paper-grid-slides/references/THEMES.md`**

```markdown
# 主題系統

每個簡報從頭到尾跑**一個主題**。不要在章節間切換主題——那會打斷視覺
連貫性。

主題 = `theme.json`（metadata）+ `tokens.css`（必要，純 `:root` token）+
`extras.css`（可選，選擇器層覆寫）。

## 為什麼是兩個 CSS 檔，不是姊妹 skill `web-video-presentation` 的單一 `tokens.css`

`base.css` 除了定義 `:root` token，本身也直接定義了具體選擇器規則
（`.stage-frame`、`.card`、`.v-*` 以外的 primitive）並用 `var()` 消費
token。純 CSS 的 cascade 規則是：**同一個選擇器、同樣 specificity，
後載入的規則贏**。

- 如果一個主題只需要換 token 值（顏色、字體、圓角、陰影的**值**），
  `tokens.css` 就夠了——它載入在 `base.css` 之前，`base.css` 的規則會
  用 `var()` 讀到新值，不需要主題自己再覆寫選擇器。`dbx-style` 就是
  這種情況。
- 如果一個主題需要對**同一個選擇器**（例如 `.stage-frame`）覆寫具體
  屬性值（不是透過 token），這條規則必須放進 `extras.css`——它載入
  在 `base.css` **之後**，才會贏過 `base.css` 自己的同選擇器規則。
  `paper-grid` 主題的 `.stage-frame` 紙張邊緣陰影、`.v-corners`/
  `.v-pill`/`.v-breadcrumb`/`.v-strike`/`.v-serif-bold` 這些新增
  primitive，都屬於這一類。

App.tsx 的載入順序（已接好，不要改）：

```
fonts.css → tokens.css（主題 token） → base.css → animations.css → extras.css（主題選擇器層，可選）
```

## `extras.css` 反模式（讀完再動手）

`extras.css` 是「例外閥門」，不是主題的常態設計位置：

- **能用 token 做到的效果，不要搬進 `extras.css`。** 90% 的主題個性
  （顏色、字體、圓角、陰影、hero 數字風格、裝飾層）都該留在
  `tokens.css`，只用主題已提供的 token 插槽表達。`dbx-style` 完全
  沒有 `extras.css` 內容就是證明——先想清楚能不能用既有插槽做到，
  想不到才動用 `extras.css`。
- **`paper-grid` 目前的 `extras.css` 有一段歷史技術債**：其中「Part 2」
  是逐字搬過來的舊 `paper-grid-cards.css`，內容是對 `.co-` `.av-`
  `.at-` `.cl-` `.mn-` `.pl-` 這些**特定歷史章節 class 前綴**的
  `!important` 硬覆寫。這不是「主題」該管的事——正常情況下章節應該
  只用 primitive class（`.hero-num` `.rule` `.card` `.v-pill` 等）
  跟 token，不該有這種跟具體章節 class 名稱綁死的覆寫層。保留它純粹
  是因為「跟 `ai-project-lifecycle-slides` 零視覺差異」優先於「架構
  乾淨」這條硬性前提。**新主題不要模仿這個模式**——如果你發現自己在
  寫 `.scene .xx-something { ... !important }`，先回頭檢查是不是該
  改章節的 CSS 用 primitive class，而不是加一條主題規則去補丁章節。

## 內建主題

| id | 性格 |
|---|---|
| `paper-grid` | 暖紙編輯風＋磚紅 accent＋藍圖網格簽名。**本 skill 目前實際使用與驗收的預設主題**，切換主題前先確認你真的需要換掉它。 |
| `dbx-style` | 深色科技感＋玻璃質感工程師風，取自 DBX 官網色票，固定角落光暈裝飾。 |
| `midnight-press` | 電影感編輯級深色，暖色 espresso 底、單一火熱橙 accent。此 skill 的舊主題殘留，保留相容、非目前使用對象。 |

隨時列出可用主題：

```bash
bash <skill-root>/scripts/scaffold.sh --list-themes
```

## 套用主題

```bash
# 1. 先照 GUIDE.md 建專案（預設就是 paper-grid，這步可跳過主題切換）
cp -r <skill-root>/template/presentation <新專案>/presentation

# 2. 需要換主題才跑這步
bash <skill-root>/scripts/scaffold.sh <新專案>/presentation --theme=dbx-style
```

之後切換主題 = 重跑上面第 2 步（會覆蓋 `tokens.css`/`extras.css`/`.theme`）。
刷新 dev server，完成，章節程式碼一行沒動。

如果切換後某章節看起來有問題，那是該章節在某處硬編碼了顏色/字體/尺寸，
而不是用語義 token——bug 在章節裡，不在主題裡。

## 完整 token 契約

`base.css` 給性格 token 都準備了合理預設值。主題的 `tokens.css` 只需
要覆蓋**調色板 + 字體 + 性格旋鈕 + 裝飾**這四類。

### 必填（主題必須定義）

#### 表面色（4 個）

| token | 作用 |
|---|---|
| `--shell` | letterbox / 舞台外的頁面背景 |
| `--surface` | 舞台主背景 |
| `--surface-2` | 凸起 —— 卡片、代碼塊、嵌入面板 |
| `--surface-3` | 最裡層 —— surface-2 裡再嵌一層時用 |

#### 文字（4 個）

| token | 作用 |
|---|---|
| `--text` | 主 |
| `--text-2` | 次（副標題、正文） |
| `--text-mute` | 靜音 —— 標籤 / 元數據 |
| `--text-faint` | 三級 —— 提示 / 禁用 |

#### 線條（1 個）

| token | 作用 |
|---|---|
| `--rule` | 髮絲分割線顏色 |

#### Accent（3 個）

| token | 作用 |
|---|---|
| `--accent` | accent 本體（一個品牌強色，全站唯一） |
| `--accent-soft` | 低透明度疊層 —— pill 背景、懸浮光暈 |
| `--accent-glow` | 中透明度疊層 —— text shadow、圓點發光 |

#### 字型家族（4 個）

| token | 作用 |
|---|---|
| `--font-display-cn` | 中文顯示家族 |
| `--font-display-en` | 拉丁顯示家族 |
| `--font-body` | 正文家族 |
| `--font-mono` | 等寬家族（終端、mono caps、badge——即使品牌本身沒有等寬字體，此 skill 的 primitive 仍需要一個，見 `dbx-style` 的做法） |

### 可選的性格覆蓋

| token | base 默認 | 作用 |
|---|---|---|
| `--font-features` | `"tnum","ss01"` | body 上的 OpenType 特性 |
| `--r-card` | `--r-md`（16px） | 卡片圓角 |
| `--r-stage` | `0` | 舞台本身圓角 |
| `--rule-w` | `1px` | rule 粗細 |
| `--rule-style` | `solid` | rule 樣式 |
| `--hero-num-font` | `--font-display-en` | `.hero-num` 字體 |
| `--hero-num-style` | `italic` | `italic`/`normal` |
| `--hero-num-weight` | `400` | 400/500/700/900 |
| `--hero-num-track` | `--track-tight` | hero 數字字距 |
| `--stage-pad-x` | `96px` | 舞台橫向內邊距 |
| `--stage-pad-y` | `80px` | 舞台縱向內邊距 |
| `--card-shadow` | none | `.card` 的 box-shadow |
| `--card-glass-bg` | `rgba(255,255,255,0.06)` | `.card-glass` 背景 |
| `--card-glass-border` | `rgba(255,255,255,0.12)` | `.card-glass` 邊框 |
| `--shadow-stage` | dark drop | 舞台 box-shadow |
| `--stage-border` | `none` | 舞台可選邊框 |

### 可選的裝飾層

| token | 作用 |
|---|---|
| `--surface-pattern` | 疊在舞台上的 `background-image`（噪聲/網格/掃描線） |
| `--surface-pattern-size` | 配套的 `background-size` |
| `--surface-pattern-blend` | pattern 層的 `mix-blend-mode` |
| `--surface-pattern-opacity` | pattern 層透明度乘子 |
| `--surface-vignette` | vignette/光暈疊層的 `background`（可放多個 `radial-gradient`，逗號分隔對應多個固定角落光暈——`dbx-style` 就是這樣做兩個角的固定光暈裝飾） |
| `--text-shadow` | 應用在 `.serif-cn`/`.serif-it`/`.display-en` 上 |

## 新增主題

1. 挑一個最接近目標氣質的主題資料夾複製當起點（`cp -r themes/paper-grid themes/my-theme` 或從 `dbx-style` 起手如果目標是「tokens-only、無 extras」）。
2. 改 `tokens.css`：調色板 → 字體 → 性格旋鈕 → 裝飾。**先窮盡 token 插槽的可能性，想不到才加 `extras.css`。**
3. 改 `theme.json`：`id` 必須等於目錄名。
4. 用 `scripts/scaffold.sh <暫存目錄> --theme=my-theme` 套用，`npm run dev` 過一遍所有章節，用 `snap.mjs`/`snap-sweep.mjs` 截圖檢查。
5. 在本文件「內建主題」表格加一行。

## 反模式

- 章節 CSS 硬編碼 hex 顏色/字體名稱——缺哪個語義就在契約裡補一個 token。
- 演示中途切換主題。
- 第二個飽和 accent 色——只能有一個，`--accent-glow`/`--accent-soft` 永遠跟 `--accent` 同色相。
- 在元件層 override 主題 token——只在 `:root` 裡覆蓋。
- 依賴主題的章節條件分支（TSX 裡判斷目前是哪個主題）。
- `extras.css` 裡塞可以用 token 做到的效果（見上面「`extras.css` 反模式」一節）。
```

- [ ] **Step 2: Commit**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git add references/THEMES.md
git commit -m "docs: add THEMES.md, resolving the dangling reference from chapters.ts/App.tsx/fonts.css"
```

---

### Task 7: 更新 `references/GUIDE.md`

**Files:**
- Modify: `references/GUIDE.md`（§1「起專案」一節）

**Interfaces:**
- Consumes: Task 4–6 產物（`scripts/scaffold.sh`、`THEMES.md`、新 cascade 順序）

- [ ] **Step 1: 用 Edit 把 §1 現有這段**

```markdown
樣式層疊順序（App.tsx，已接好勿動）：
`fonts → tokens(midnight-press) → base → animations → paper-grid → paper-grid-cards`
亮色暖紙視覺全部來自 `paper-grid.css` 覆寫。**不要改 styles/ 下任何檔案**。
```

**改成：**

```markdown
樣式層疊順序（App.tsx，已接好勿動）：
`fonts → tokens(主題 token) → base → animations → extras(主題選擇器層，可選)`

模板預設就是 `paper-grid` 主題（暖紙視覺）。**不要改
`base.css`/`animations.css`/`fonts.css`**——那是所有主題共用的骨架。
要換視覺風格，看 `references/THEMES.md`，用
`bash <skill 根>/scripts/scaffold.sh <新專案>/presentation --theme=<id>`
切換 `tokens.css`/`extras.css`，不要手改這兩個檔案本身的內容（它們是
被 scaffold 覆蓋的產物，手改了下次切主題會被蓋掉）。
```

- [ ] **Step 2: 驗證修改後檔案沒有留下對舊檔名的殘留引用**

```bash
grep -n "paper-grid.css\|paper-grid-cards.css" /home/hank/.claude/skills/paper-grid-slides/references/GUIDE.md
```

Expected: 無輸出（若還有殘留，代表漏改，需要一併處理）。

- [ ] **Step 3: Commit**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git add references/GUIDE.md
git commit -m "docs(guide): document theme-switching flow via scaffold.sh, drop stale 'don't touch styles/' rule"
```

---

### Task 8: 驗收 —— zero-diff 視覺比對 + 三主題 smoke test

**Files:** 無新檔案，純驗證步驟。

**Interfaces:**
- Consumes: 全部前置 task 的產物
- Produces: 驗收結論（本 task 不通過，不准開始 `dbx-slides` 的簡報內容開發——這是 §硬性前提 2 的具體落實）

- [ ] **Step 1: 靜態 diff 驗證（已在 Task 2/5 各自 step 做過，這裡做一次總覽性複查）**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
echo "--- paper-grid tokens.css :root 本體 vs 舊 paper-grid.css :root 本體 ---"
diff <(git show HEAD~7:template/presentation/src/styles/paper-grid.css 2>/dev/null | sed -n '14,71p') \
     <(sed -n '/^:root {/,/^}/p' themes/paper-grid/tokens.css)
echo "--- paper-grid extras.css Part 2 vs 舊 paper-grid-cards.css ---"
diff <(git show HEAD~7:template/presentation/src/styles/paper-grid-cards.css 2>/dev/null) \
     <(tail -n 272 themes/paper-grid/extras.css)
```

（`HEAD~7` 需依實際 commit 數調整，或直接用 `git log --oneline -- template/presentation/src/styles/paper-grid.css` 找到重構前那次 commit 的 hash 替換。）

Expected: 兩個 diff 皆無輸出。

- [ ] **Step 2: 用重構後的 `template/presentation` 起一個暫存專案，實機跑起來跟 `ai-project-lifecycle-slides` 對比**

```bash
rm -rf /tmp/zero-diff-check
cp -r /home/hank/.claude/skills/paper-grid-slides/template/presentation /tmp/zero-diff-check
cd /tmp/zero-diff-check
npm install
npm run dev &
sleep 3
```

- [ ] **Step 3: 用模板內建的 `snap.mjs` 對暫存專案的示範章節截圖**

```bash
cd /tmp/zero-diff-check
node snap.mjs
```

Expected: 產出截圖檔案（依 `snap.mjs` 預設輸出路徑，通常是專案根目錄下的 `.png`）。

- [ ] **Step 4: 對 `ai-project-lifecycle-slides` 本身也跑一次同樣的截圖流程（它自己的 dev server + 自己的 snap.mjs）**

```bash
cd /home/hank/repo/ai-project-lifecycle-slides/presentation
npm run dev &
sleep 3
node snap.mjs
```

- [ ] **Step 5: 人工比對兩組截圖**

這一步需要**實際打開截圖檔案比對**（用 Read 工具讀圖，或請使用者自行看）：舞台背景色、卡片邊角括號、字體、藍圖網格紋理、陰影、`.v-pill`/`.v-breadcrumb` 樣式，逐項確認一致。因為兩邊用的是同一份示範章節 `01-example`（`ai-project-lifecycle-slides` 若已把 example 換成真實章節，就改比對雙方共有的、視覺上依賴 paper-grid 主題 token/primitive 的任一章節截圖）。

Expected: 目測零差異。若有差異，回到 Task 2/5 找出遺漏或轉錄錯誤的規則，不可跳過直接放行。

- [ ] **Step 6: 收尾，關掉暫存的 dev server**

```bash
kill %1 2>/dev/null || true
cd /home/hank/repo/ai-project-lifecycle-slides/presentation
kill %1 2>/dev/null || true
rm -rf /tmp/zero-diff-check
```

- [ ] **Step 7: dbx-style 主題 smoke test（確認新主題至少能正常渲染，不要求跟任何既有專案比對）**

```bash
rm -rf /tmp/dbx-style-smoke
cp -r /home/hank/.claude/skills/paper-grid-slides/template/presentation /tmp/dbx-style-smoke
bash /home/hank/.claude/skills/paper-grid-slides/scripts/scaffold.sh /tmp/dbx-style-smoke --theme=dbx-style
cd /tmp/dbx-style-smoke
npm install
npx tsc --noEmit
npm run dev &
sleep 3
node snap.mjs
kill %1 2>/dev/null || true
```

Expected: `tsc --noEmit` 無錯誤；截圖顯示深色科技感（深藍背景、鋼藍 accent、玻璃卡片、角落光暈），沒有殘留任何暖紙風元素（代表 tokens.css 真的完全覆蓋了所有必要 token，沒有遺漏導致 fallback 到 base.css 預設值造成的視覺破圖）。

```bash
rm -rf /tmp/dbx-style-smoke
```

- [ ] **Step 8: 最終 commit（若前面步驟中有因驗收發現問題而做的修正，一併收在這裡；若全部乾淨，跳過此步）**

```bash
cd /home/hank/.claude/skills/paper-grid-slides
git status
# 若有未 commit 的修正：
git add -A
git commit -m "fix(themes): address zero-diff verification findings"
```

---

## 完成後，不在本 plan 範圍內的下一步

驗收全部通過後，才回到 `/home/hank/repo/dbx-slides`，用 `scripts/scaffold.sh --theme=dbx-style` 套主題，照 skill 正常流程（`article.md` 已存在 → `SCRIPT.md` → `OUTLINE.md`）開始 DBX 簡報內容開發。這是下一個 plan 的範圍，不在這裡處理。
