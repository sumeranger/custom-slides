#!/usr/bin/env bash
#
# script-to-srt.sh — Y-assist helper: convert script to audio + subtitle
#
# Purpose: Given a continuous narration script (text file), produce:
#   - Audio file (.mp3)
#   - Subtitle file (.vtt / .srt)
#
# The agent reads the SRT to understand real pauses and timing,
# then uses judgment (per OUTLINE.md §SRT-informed) to decide where to cut steps.
# This tool does NOT auto-segment or write narrations.ts — that's the agent's job.
#
# Usage: script-to-srt.sh <input-script.txt> <output-basename> [--help]
#
# Environment:
#   VOICE — TTS voice (default: zh-CN-YunxiNeural)
#
# Outputs:
#   <output-basename>.mp3   — synthesized audio
#   <output-basename>.vtt   — WebVTT subtitles
#
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage: script-to-srt.sh <input-script.txt> <output-basename>

Arguments:
  <input-script.txt>   — Path to text file with continuous narration
  <output-basename>    — Base name for output files (without extension)
                        Outputs: <basename>.mp3, <basename>.vtt

Environment:
  VOICE              — TTS voice (default: zh-CN-YunxiNeural)

Examples:
  script-to-srt.sh chapter1.txt chapter1
  VOICE=en-US-AriaNeural script-to-srt.sh narration.txt output
EOF
}

# Check for help flag
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

# Validate arguments
if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

input_script="$1"
output_basename="$2"
voice="${VOICE:-zh-CN-YunxiNeural}"

# Validate input file exists
if [[ ! -f "$input_script" ]]; then
  echo "Error: input script file not found: $input_script" >&2
  exit 1
fi

# Check if edge-tts is available
if ! command -v edge-tts &>/dev/null && ! python3 -m edge_tts --help &>/dev/null; then
  cat >&2 <<'EOF'
Error: edge-tts is not installed.

Install it in an isolated tool env (no global site-packages pollution):
  uv tool install edge-tts       # recommended
  # or: pipx install edge-tts

edge-tts is an online service (needs network at runtime). No ffmpeg needed —
--write-media writes mp3 directly.
EOF
  exit 1
fi

# Run edge-tts
edge-tts \
  --file "$input_script" \
  --voice "$voice" \
  --write-media "${output_basename}.mp3" \
  --write-subtitles "${output_basename}.vtt"

echo "✓ Created: ${output_basename}.mp3 ${output_basename}.vtt"
