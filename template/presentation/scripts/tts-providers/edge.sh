# ────────────────────────────────────────────────────────────────────
# edge-tts provider — free Microsoft Edge TTS backend via edge-tts CLI.
#
# Docs:    https://github.com/rany2/edge-tts
# Install: pip install edge-tts
# Voices:  zh-CN-YunxiNeural (male)
#          zh-CN-XiaoxiaoNeural (female)
#          en-US-AriaNeural (English female)
#          en-US-GuyNeural (English male)
#          ... (run: edge-tts --list-voices)
#
# Strengths: free (no API key); Microsoft's neural voices; works offline once installed.
# ────────────────────────────────────────────────────────────────────

tts_check() {
  if command -v edge-tts >/dev/null 2>&1; then
    return 0
  fi
  if python3 -m edge_tts --help >/dev/null 2>&1; then
    return 0
  fi
  echo "✗ edge-tts not found. Install with: pip install edge-tts" >&2
  return 1
}

tts_install_help() {
  cat <<'EOF' >&2
To use the edge-tts provider (free, no API key):

  Install edge-tts:
    pip install edge-tts

  Also requires ffmpeg on PATH (for audio encoding):
    brew install ffmpeg    # macOS
    apt-get install ffmpeg # Ubuntu/Debian
    choco install ffmpeg   # Windows (with Chocolatey)

  List available voices:
    edge-tts --list-voices | less

Or pick another provider:  PRESENTATION_TTS=<name> npm run synthesize-audio
EOF
}

tts_synthesize() {
  local text="$1"
  local out="$2"
  local voice="${3:-zh-CN-YunxiNeural}"

  edge-tts --text "$text" --voice "$voice" --write-media "$out" >/dev/null 2>&1
}
