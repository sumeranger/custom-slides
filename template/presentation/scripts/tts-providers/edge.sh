# ────────────────────────────────────────────────────────────────────
# edge-tts provider — free Microsoft Edge TTS backend via edge-tts CLI.
#
# Docs:    https://github.com/rany2/edge-tts
# Install: uv tool install edge-tts   (isolated; or: pipx install edge-tts)
# Voices:  zh-CN-YunxiNeural (male)
#          zh-CN-XiaoxiaoNeural (female)
#          en-US-AriaNeural (English female)
#          en-US-GuyNeural (English male)
#          ... (run: edge-tts --list-voices)
#
# Strengths: free (no API key); Microsoft's neural voices. Note: online service —
#            needs network at runtime. CLI --write-media emits mp3 directly (no ffmpeg).
# ────────────────────────────────────────────────────────────────────

tts_check() {
  if command -v edge-tts >/dev/null 2>&1; then
    return 0
  fi
  if python3 -m edge_tts --help >/dev/null 2>&1; then
    return 0
  fi
  echo "✗ edge-tts not found. Install (isolated): uv tool install edge-tts  (or: pipx install edge-tts)" >&2
  return 1
}

tts_install_help() {
  cat <<'EOF' >&2
To use the edge-tts provider (free, no API key):

  Install edge-tts in an isolated tool env (no global site-packages pollution):
    uv tool install edge-tts       # recommended
    # or: pipx install edge-tts

  edge-tts is an online service (needs network at runtime). No ffmpeg needed —
  the CLI --write-media writes mp3 directly.

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
