import { MaskReveal } from "../../components/MaskReveal";
import { Term } from "../../components/Term";
import type { ChapterStepProps } from "../../registry/types";
import "./Example.css";

/**
 * 示範章節 — 集中展示本模板的核心慣例：
 * 1. 每步獨占整屏：if (step === N) return <FullScene />
 * 2. 主題 primitives：.v-pill / .v-corners / .v-serif-bold(.v-em) / .hero-num
 * 3. Term tooltip：kind="abbr"（簡寫全稱）/ kind="quote"（原文出處）
 *    靠舞台左/右緣加 align="start"/"end"，靠頂部加 pos="bottom"
 * 4. 動畫全走 CSS keyframes + animationDelay，無 setTimeout
 *
 * 做真實內容前請刪除本資料夾。
 */
export default function ExampleChapter({ step }: ChapterStepProps) {
  /* ── Step 0 — 標題卡 + 兩種 tooltip ── */
  if (step === 0) {
    return (
      <div className="ex-scene ex-center">
        <div className="ex-title-inner">
          <span className="v-pill ex-pill">
            <Term
              align="start"
              pos="bottom"
              tip={
                <>
                  <span className="term-tip-t">Demo — 簡寫型 tooltip</span>
                  hover 虛線字即可看到全稱與一句話概念；點擊不會翻頁
                  （data-no-advance）。
                </>
              }
            >
              Demo
            </Term>
            　· paper-grid
          </span>

          <h1 className="ex-h v-serif-bold">
            <MaskReveal show delay={300} duration={1000}>
              <span>
                紙感編輯風，<span className="v-em">點擊驅動</span>
              </span>
            </MaskReveal>
          </h1>

          <div className="ex-card v-corners">
            <span className="label-mono ex-card-k">hero 數字示範</span>
            <span className="hero-num ex-card-num">60–95%</span>
            <span className="ex-card-d">
              <Term
                kind="quote"
                tip={
                  <>
                    <span className="term-tip-q">
                      "60-95% fewer tokens, same answers."
                    </span>
                    <span className="term-tip-src">
                      引文出處示範 · 原文逐字 + 來源日期
                    </span>
                  </>
                }
              >
                原文出處型 tooltip 長這樣
              </Term>
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 1 — 逐項揭示示範 ── */
  return (
    <div className="ex-scene ex-pad">
      <div className="ex-head">
        <span className="v-pill">逐步揭示</span>
        <h2 className="ex-h2 v-serif-bold">
          一項 = 一個節拍，<span className="v-em">不要一次全上</span>
        </h2>
      </div>
      <ul className="ex-list">
        {["先講這個", "再講這個", "最後這個"].map((t, i) => (
          <li
            key={t}
            className="ex-item"
            style={{ animationDelay: `${0.4 + i * 0.5}s` }}
          >
            <span className="mono ex-item-idx">{String(i + 1).padStart(2, "0")}</span>
            {t}
          </li>
        ))}
      </ul>
      <span className="ex-src label-mono">出處行慣例 · 右下角 · 16px 起</span>
    </div>
  );
}
