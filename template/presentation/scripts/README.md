# scripts/ — SRT / TTS 工具（框架無關）

這批工具是純 bash + edge-tts / jq，不碰 React 也不碰 Slidev——隨模板保留，
**未掛進 npm scripts**（用時直接 `bash scripts/<f>.sh`）。

| 檔案 | 作用 | 現況 |
|---|---|---|
| `script-to-srt.sh` | 對一份連貫口播稿產出 `<name>.mp3` + `<name>.vtt`（edge-tts 預設，`VOICE` 可換）。服務**內容產線**：OUTLINE.md §3 的 SRT-informed 切 step——agent 讀真實停頓時間戳來校準切點。**不自動切段**，判斷永遠在 agent 手上。 | **今日可用** |
| `synthesize-audio.sh` | provider 無關的逐段 TTS runner：讀 `audio-segments.json`、每段出一顆 mp3 到 `public/audio/<章>/<N>.mp3`。provider 用 `PRESENTATION_TTS=<name>`（預設 `edge`）或 `--provider=` 選。 | **等 phase 2**：它的輸入 `audio-segments.json` 過去由 React 版 `extract-narrations.ts`（讀 registry/narrations，已退役、未隨遷）產出；phase 2 會重建一支「讀 per-slide notes」的 extractor 接上它，本腳本介面不變 |
| `tts-providers/` | provider adapter（`edge.sh` / `minimax.sh` / `openai.sh`）＋合約說明 `README.md`（`tts_synthesize` 必要、`tts_check`/`tts_install_help` 可選）。新增 provider 照該 README 抄。 | 今日可用（被兩支腳本共用） |

edge-tts 安裝：`uv tool install edge-tts`（或 `pipx install edge-tts`）；線上服務，
執行時要網路，免 API key、免 ffmpeg。
