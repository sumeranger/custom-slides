import { MaskReveal } from "../../components/MaskReveal";
import { PhaseTag } from "../../components/PhaseTag";
import { Term } from "../../components/Term";
import type { ChapterStepProps } from "../../registry/types";
import "./ServiceFlow.css";

const LANES = ["系統 A 前端", "系統 A 後端", "文件 AI 前端", "文件 AI 後端"];

/**
 * 四道泳道列 — 貫穿 step 3~7 的資料流視覺母題，用高亮 + 連線標示當下動作發生在哪裡。
 * 連線一律走上方弧線繞過泳道列，不穿過中間格子——避免跨兩格以上的連線（如
 * 系統 A 前端→文件 AI 前端，中間跳過系統 A 後端）被誤讀成「有經過中間那格」。
 * 弧線高度刻意拉高（見 CSS），太扁的弧看起來會像兩段斷開的短線。
 */
function LaneTrack({
  active,
  link,
}: {
  active: number[];
  link?: { from: number; to: number };
}) {
  const fromX = link ? ((Math.min(link.from, link.to) + 0.5) / 4) * 100 : 0;
  const toX = link ? ((Math.max(link.from, link.to) + 0.5) / 4) * 100 : 0;
  const skips = link ? Math.abs(link.to - link.from) > 1 : false;
  const peakY = skips ? 4 : 32;

  return (
    <div className="da-lanes-wrap">
      {link && (
        <svg
          className="da-lane-arc"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={`M${fromX} 58 Q${(fromX + toX) / 2} ${peakY} ${toX} 58`}
            fill="none"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <div className="da-lanes">
        {LANES.map((label, i) => (
          <div
            key={label}
            className={`da-lane ${active.includes(i) ? "is-active" : ""}`}
          >
            <span className="mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 示範章節 — 文件 AI 服務微服務化
 * 轉場鉤子改成具體的「文件助手」按鈕點擊視覺，銜接前一步的抽離敘事。
 */
export default function ServiceFlowChapter({ step }: ChapterStepProps) {
  /* ── Step 0 — 標題卡 ── */
  if (step === 0) {
    return (
      <div className="da-scene da-center">
        <div className="da-title-inner">
          <span className="v-pill da-pill">月份工作簡報</span>
          <h1 className="da-h1 v-serif-bold">
            <MaskReveal show delay={250} duration={900}>
              <span>
                這個月，<span className="v-em">四件事</span>
              </span>
            </MaskReveal>
          </h1>
          <div className="da-roadmap">
            {["AI 服務獨立", "測試站獨立 VM", "Dashboard 五頁", "Demo 情境劇本"].map(
              (t, i) => (
                <div
                  key={t}
                  className={`da-roadmap-dot ${i === 0 ? "is-active" : ""}`}
                  style={{ animationDelay: `${1000 + i * 160}ms` }}
                >
                  <span className="mono da-roadmap-idx">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="da-roadmap-label">{t}</span>
                </div>
              ),
            )}
          </div>
          <p className="da-deck">
            第一件：把 AI 合約審閱，從系統 A 整個搬出去。
          </p>
        </div>
      </div>
    );
  }

  /* ── Step 1 — Before/After：抽離動畫母題 ── */
  if (step === 1) {
    return (
      <div className="da-scene da-pad">
        <div className="da-head">
          <span className="v-pill">文件 AI 服務微服務化</span>
          <h2 className="da-h2 v-serif-bold">
            從埋在裡面，到<span className="v-em">獨立服務</span>
          </h2>
        </div>
        <div className="da-extract-stage">
          <div className="da-extract-box da-extract-before">
            <span className="label-mono da-extract-tag">以前 · 系統 A</span>
            <div className="da-extract-ghost">
              <span className="mono">AI 審閱 / 摘要</span>
            </div>
          </div>
          <svg
            className="da-extract-arrow"
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className="da-extract-path"
              d="M4 20 H180"
              fill="none"
              strokeWidth="2"
            />
            <path
              className="da-extract-head"
              d="M170 10 L188 20 L170 30"
              fill="none"
              strokeWidth="2"
            />
          </svg>
          <div className="da-extract-box da-extract-after">
            <span className="label-mono da-extract-tag">現在 · 文件 AI 服務</span>
            <div className="da-extract-chip">
              <span className="mono">AI 審閱 / 摘要</span>
            </div>
            <div className="da-extract-meta">
              <span>自己一個 repo</span>
              <span>自己一套資料庫</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2 — 轉場鉤子：具體按下「文件助手」按鈕 ── */
  if (step === 2) {
    return (
      <div className="da-scene da-center">
        <div className="da-hook">
          <div className="da-hook-row">
            <span className="mono da-hook-file">draft-contract.pdf</span>
            <span className="da-hook-btn">
              文件助手
              <span className="da-hook-cursor" aria-hidden>
                <svg viewBox="0 0 40 40" width="34" height="34">
                  <path
                    d="M8 4 L8 32 L15 25 L20 34 L24 32 L19 23 L28 22 Z"
                    fill="var(--text)"
                    stroke="var(--surface-2)"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </span>
          </div>
          <p className="da-hook-t v-serif-bold">
            按下去之後，<span className="v-em">資料到底怎麼走</span>？
          </p>
        </div>
      </div>
    );
  }

  /* ── Step 3 — 要票 ── */
  if (step === 3) {
    return (
      <div className="da-scene da-pad">
        <div className="da-head">
          <span className="v-pill">資料流 · 01</span>
          <h2 className="da-h2 v-serif-bold">
            點下去之後，<span className="v-em">先跟自己要一張票</span>
          </h2>
        </div>
        <LaneTrack active={[0, 1]} link={{ from: 0, to: 1 }} />
        <div className="da-detail-card">
          <span className="mono da-detail-endpoint">
            GET /document-summary/service-ticket
          </span>
          <span className="da-detail-d">
            系統 A 前端向自己的後端要一張「進文件 AI 服務的票」
          </span>
        </div>
      </div>
    );
  }

  /* ── Step 4 — 三道檢查 + 發票 ── */
  if (step === 4) {
    return (
      <div className="da-scene da-pad">
        <div className="da-head">
          <span className="v-pill">資料流 · 02</span>
          <h2 className="da-h2 v-serif-bold">
            三道檢查過了，<span className="v-em">才發一張票</span>
          </h2>
        </div>
        <LaneTrack active={[1]} />
        <div className="da-checklist">
          {["有讀取權限", "附件屬於這份合約", "副檔名僅限 PDF"].map(
            (t, i) => (
              <div
                key={t}
                className="da-checklist-item"
                style={{ animationDelay: `${300 + i * 260}ms` }}
              >
                <span className="da-checklist-mark mono">✓</span>
                {t}
              </div>
            ),
          )}
        </div>
        <div className="da-ticket">
          <span className="label-mono">票 · JWT</span>
          <span className="da-ticket-t">
            <Term
              tip={
                <>
                  <span className="term-tip-t">attachmentId</span>
                  JWT 自訂 claim。值其實是後端儲存路徑的 UUID 檔名，不是
                  使用者上傳時的原始檔名，也不是資料庫查權限用的附件 GUID。
                </>
              }
            >
              檔名
            </Term>
            {" + "}
            <Term
              tip={
                <>
                  <span className="term-tip-t">sub</span>
                  標準 JWT claim，存登入帳號（loginId）字串。
                </>
              }
            >
              帳號
            </Term>
            ，不含合約內容
          </span>
          <span className="hero-num da-ticket-num">5 分鐘</span>
        </div>
      </div>
    );
  }

  /* ── Step 5 — 開新分頁帶票 → 換 session，票作廢 ── */
  if (step === 5) {
    return (
      <div className="da-scene da-pad">
        <div className="da-head">
          <span className="v-pill">資料流 · 03</span>
          <h2 className="da-h2 v-serif-bold">
            瀏覽器帶著票，<span className="v-em">自己走進文件 AI 服務</span>
          </h2>
        </div>
        <LaneTrack active={[0, 2, 3]} link={{ from: 0, to: 2 }} />
        <div className="da-swap">
          <div className="da-swap-old">
            <span className="mono">票 · 5 分鐘</span>
          </div>
          <svg
            className="da-swap-arrow"
            viewBox="0 0 140 30"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M4 15 H120" fill="none" strokeWidth="2" />
            <path d="M108 6 L126 15 L108 24" fill="none" strokeWidth="2" />
          </svg>
          <div className="da-swap-new">
            <span className="mono">文件 AI 服務自己的 session</span>
          </div>
        </div>
        <p className="da-punch v-serif-bold">
          驗過票之後，<span className="v-em">票就作廢了</span>
        </p>
      </div>
    );
  }

  /* ── Step 6 — 文件 AI 服務自己查全文 / 叫 AI / 串流 ── */
  if (step === 6) {
    return (
      <div className="da-scene da-pad">
        <div className="da-head">
          <span className="v-pill">資料流 · 04</span>
          <h2 className="da-h2 v-serif-bold">
            剩下的事，<span className="v-em">文件 AI 服務自己來</span>
          </h2>
        </div>
        <LaneTrack active={[3]} />
        <div className="da-self">
          {["查全文 · 索引服務", "叫 AI · AI 引擎", "串流回來 · SSE"].map((t, i) => (
            <div
              key={t}
              className="da-self-item"
              style={{ animationDelay: `${300 + i * 320}ms` }}
            >
              <span className="mono da-self-idx">
                {String(i + 1).padStart(2, "0")}
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Step 7 — 核心結論 ── */
  if (step === 7) {
    return (
      <div className="da-scene da-center">
        <div className="da-thesis v-corners">
          <div className="da-thesis-lanes">
            <span className="da-thesis-box">系統 A 後端</span>
            <span className="da-thesis-x mono">✕</span>
            <span className="da-thesis-box">文件 AI 服務後端</span>
          </div>
          <p className="da-thesis-t v-serif-bold">
            兩邊後端<span className="v-em">從未直接講過話</span>
          </p>
          <p className="da-thesis-d">中間人是使用者的瀏覽器</p>
        </div>
      </div>
    );
  }

  /* ── Step 8 — 系統 C 對比：設計亮點 ── */
  if (step === 8) {
    return (
      <div className="da-scene da-pad">
        <div className="da-head">
          <span className="v-pill">設計亮點</span>
          <h2 className="da-h2 v-serif-bold">
            同個網域，<span className="v-em">兩種選擇</span>
          </h2>
        </div>
        <div className="da-compare">
          <div className="da-compare-col">
            <span className="label-mono">系統 C · /service-c/</span>
            <div className="da-compare-row">
              <span className="mono">重用系統 A cookie</span>
            </div>
            <span className="da-compare-d">直接做 SSO</span>
          </div>
          <div className="da-compare-rule" />
          <div className="da-compare-col da-compare-accent">
            <span className="label-mono">文件 AI 服務 · /service-b/</span>
            <div className="da-compare-row">
              <span className="mono">自己發一張最小範圍短效票</span>
            </div>
            <span className="da-compare-d">換到登入狀態完全隔離</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 9 — 交付數字 + 瘦身 ── */
  if (step === 9) {
    return (
      <div className="da-scene da-pad">
        <div className="da-head">
          <span className="v-pill">交付狀態</span>
          <h2 className="da-h2 v-serif-bold">
            現在只做<span className="v-em">兩件事</span>
          </h2>
        </div>
        <div className="da-numbers da-numbers-compact">
          <div className="da-num-block">
            <span className="hero-num da-num-sm">14</span>
            <span className="da-num-label">
              個開發任務 ·{" "}
              <Term
                tip={
                  <>
                    <span className="term-tip-t">
                      TDD — Test-Driven Development
                    </span>
                    先寫測試、再寫功能，確保每個任務都有測試把關。
                  </>
                }
              >
                TDD
              </Term>{" "}
              全部走完
            </span>
          </div>
          <div className="da-num-rule" />
          <div className="da-num-block">
            <span className="hero-num da-num-sm">43</span>
            <span className="da-num-label">個測試全綠</span>
          </div>
        </div>
        <div className="da-slim">
          <div className="da-slim-col">
            <span className="label-mono da-slim-k">同步瘦身</span>
            <p className="da-slim-summary v-strike">
              舊的 AI 引擎直連程式碼，整批刪除
            </p>
          </div>
          <div className="da-slim-col da-slim-col-new">
            <span className="label-mono da-slim-k">剩下的</span>
            <div className="da-slim-new">
              <span className="da-slim-new-d">檢查權限 → 發一張短效期的票</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 10 — 誠實揭露 + 收束 ── */
  return (
    <div className="da-scene da-center">
      <div className="da-close-wrap">
        <div className="da-caveat v-corners">
          <PhaseTag kind="q">尚未上線</PhaseTag>
          <p className="da-caveat-t v-serif-bold">還沒正式對客戶開放</p>
          <div className="da-caveat-list">
            <span>金鑰 · 測試假值</span>
            <span>網址 · 測試假值</span>
          </div>
        </div>
        <div className="da-close">
          <span className="da-close-from">一個功能</span>
          <svg
            className="da-close-arrow"
            viewBox="0 0 120 28"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M4 14 H100" fill="none" strokeWidth="2" />
            <path d="M90 5 L108 14 L90 23" fill="none" strokeWidth="2" />
          </svg>
          <span className="da-close-to v-serif-bold">
            可以單獨賣的<span className="v-em">產品</span>
          </span>
        </div>
      </div>
    </div>
  );
}
