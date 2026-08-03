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
# <target>/styles/, writes <target>/.theme so later sessions can tell
# which theme a project started from, and patches <target>/slides.md
# headmatter's `colorSchema:` to match the theme's "colorSchema" field
# (light theme → light, dark theme → dark) so dark decks don't ship with
# a light-mode white nav toolbar (field lesson, GUIDE §6.30).
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
if [[ ! -d "$TARGET/styles" ]]; then
  echo "✗ '$TARGET/styles' 不存在。先 cp -r template/presentation <target>，" >&2
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

cp "$THEME_DIR/tokens.css" "$TARGET/styles/tokens.css"

if [[ -f "$THEME_DIR/extras.css" ]]; then
  cp "$THEME_DIR/extras.css" "$TARGET/styles/extras.css"
else
  echo "/* theme '$THEME' has no selector-level overrides. */" \
    > "$TARGET/styles/extras.css"
fi

# ── 主題靜態資產（可選）：主題可自帶靜態檔於 themes/<id>/assets/（如底圖）。
# 契約：整包複製到 <target>/styles/assets/，主題 CSS 用相對 url("./assets/x")
# 引用——Vite 解析 CSS url() 是以「該 CSS 檔自己的實體路徑」為基準（含自訂屬性
# 宣告內的 url），所以同一行字面路徑在 themes/<id>/ 與 <target>/styles/ 兩邊都
# 成立，dev / build / export 三種模式皆然（export 走的也是 dev server 路徑）。
# 一律先清掉目標既有的 styles/assets（＝上一個主題留下的圖）再複製本主題的；
# 沒有 assets/ 的主題（paper-grid 等）＝只清不建，不留空目錄。
ASSET_COUNT=0
rm -rf "${TARGET:?}/styles/assets"     # :? 防 TARGET 意外為空造成災難性刪除
if [[ -d "$THEME_DIR/assets" ]]; then
  mkdir -p "$TARGET/styles/assets"
  cp -R "$THEME_DIR/assets/." "$TARGET/styles/assets/"   # 複製內容，避免 assets/assets/
  ASSET_COUNT=$(find "$TARGET/styles/assets" -type f | wc -l | tr -d ' ')
elif grep -q 'url("\./assets/' "$THEME_DIR/tokens.css" 2>/dev/null; then
  echo "⚠ 主題 '$THEME' 的 tokens.css 引用了 ./assets/，但 themes/$THEME/assets/" >&2
  echo "  不存在——build 會 fail（資產走模組圖，這是刻意的 fail-loud）。" >&2
fi

echo "$THEME" > "$TARGET/.theme"

# ── colorSchema：依 theme.json 的 "colorSchema" 欄位 patch slides.md headmatter。
# 為何：colorSchema 是 Slidev headmatter（per-deck），theme 只帶 CSS。深色 theme
# 若沿用 light，Slidev 內建工具列/overview 等 chrome 會白底、又繼承深色舞台的
# 淺文字色 → 白疊白幾乎全隱形（field lesson，見 GUIDE §6.30）。故套主題時一併
# 把 headmatter 的 colorSchema 對齊 theme（light 主題設 light、dark 主題設 dark）。
# theme.json 沒有此欄位（自訂主題可能漏填）就跳過、保留原值並提示。
SCHEMA_PATCHED=""
if [[ -f "$THEME_DIR/theme.json" && -f "$TARGET/slides.md" ]]; then
  COLOR_SCHEMA=$(grep -E '"colorSchema"' "$THEME_DIR/theme.json" | head -n1 \
    | sed -E 's/.*"colorSchema":[[:space:]]*"([^"]+)".*/\1/' || true)
  if [[ -n "$COLOR_SCHEMA" ]] && grep -qE '^colorSchema:' "$TARGET/slides.md"; then
    tmp=$(mktemp)
    sed -E "s/^colorSchema:.*/colorSchema: ${COLOR_SCHEMA}/" "$TARGET/slides.md" > "$tmp" \
      && mv "$tmp" "$TARGET/slides.md"
    SCHEMA_PATCHED="$COLOR_SCHEMA"
  elif [[ -z "$COLOR_SCHEMA" ]]; then
    echo "⚠ theme '$THEME' 的 theme.json 沒有 colorSchema 欄位，未動 slides.md 的" >&2
    echo "  colorSchema——深色主題請自行確認 headmatter 是 dark（見 GUIDE §6.30）。" >&2
  fi
fi

echo "✓ 已套用主題：$THEME"
echo "  改了 $TARGET/styles/tokens.css、$TARGET/styles/extras.css、$TARGET/.theme"
if [[ -n "$SCHEMA_PATCHED" ]]; then
  echo "  headmatter colorSchema → ${SCHEMA_PATCHED}（依 theme.json，見 slides.md）"
fi
if [[ "$ASSET_COUNT" -gt 0 ]]; then
  echo "  另複製了 ${ASSET_COUNT} 個主題資產到 $TARGET/styles/assets/"
  echo "  （要換成自己的圖：覆蓋同名檔即可；重跑 scaffold 會蓋掉，與兩個 css 檔同規則）"
fi
echo "  重新整理 dev server 即可看到效果，章節程式碼一行沒動。"
