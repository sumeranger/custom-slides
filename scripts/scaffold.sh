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
# <target>/styles/, and writes <target>/.theme so later sessions
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

echo "$THEME" > "$TARGET/.theme"

echo "✓ 已套用主題：$THEME"
echo "  改了 $TARGET/styles/tokens.css、$TARGET/styles/extras.css、$TARGET/.theme"
echo "  重新整理 dev server 即可看到效果，章節程式碼一行沒動。"
