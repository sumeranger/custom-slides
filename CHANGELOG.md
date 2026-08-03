# 版本變動

本檔記錄 `paper-grid-slides` skill 的版本沿革。版本號寫在
[`skills/paper-grid-slides/SKILL.md`](skills/paper-grid-slides/SKILL.md)
的 frontmatter `version:` 欄位，每次有意義的改動就 bump 一版。

更新已安裝的 skill：重跑 README 的 `npx skills add` 那行。

---

## `1.3.0`

新增第三種可選敘事骨架「條目式報讀」（[`SCRIPT.md`](skills/paper-grid-slides/references/SCRIPT.md) §1.7
＋ [`OUTLINE.md`](skills/paper-grid-slides/references/OUTLINE.md) §1.1）：每段只報條目與數字、
一條目一句摘要，延展留給問答。適用月報／週報這類講者在場、能被追問的例行報告；明列不適用
場合（單向播放、需要說服）與與 §1.6 的分歧點（收尾**不**做逐章回顧、量化獨立成最後一章、
開場不給總量數字）。

## `1.2.1`

修掉 `dbx-style` / `midnight-press` / `modern-minimal` 的進度條 footer 仍掛 `paper-grid` 暖棕
邊線與落影的既有瑕疵——三者各在 `tokens.css` 覆寫 `--stage-edge` / `--stage-drop`，對齊自身色系。

## `1.2.0`

新增第五個內建主題 `mountain-ink`（水墨山水）：白宣紙底＋墨綠 accent＋明體大標＋自帶三張
山水底圖（三段氣壓，可換圖）；六個 primitive（`.v-seal` `.v-enso` `.v-brush-rule` `.v-mist`
`.v-safe` `.v-step`）與 `--seq-1..4` 序列色。

`scaffold.sh` 新增主題靜態資產搬運機制（`themes/<id>/assets/` → `styles/assets/`）；
`progress-bar.css` 的舞台邊線／落影 tokenize 成 `--stage-edge` / `--stage-drop`（既有四主題零
視覺差異）；補登記漏列的 `modern-minimal`。

## `1.1.0`

文風規範獨立成 [`references/TONE.md`](skills/paper-grid-slides/references/TONE.md)（改寫自
[oil-tone](https://github.com/oil-oil/oil-tone)，繁體在地化），成為所有產出文字的唯一真相
來源；`SCRIPT.md` §2.2 的人稱與用詞規定改為與之一致（原「能用『你』就用『你』」「口語詞
優先」已移除）；新增 `scripts/tone-lint.py` 文風檢查（簡繁通吃）。

## `1.0.0`

Slidev/Vue 引擎、三主題、對抗式 critic 迴圈產線。
