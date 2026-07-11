import type { ReactNode } from "react";
import "./Term.css";

/**
 * Term — hover / focus tooltip for abbreviations and source quotes.
 *
 * Usage:
 *   <Term tip="CCR — …全稱與一句話概念">CCR</Term>
 *   <Term tip={'原文："no, i personally chose the price…"'} kind="quote">
 *     定價是 Altman 本人訂的
 *   </Term>
 *
 * - `data-no-advance`: clicking the trigger never advances the stage step.
 * - `kind`: "abbr"（預設，虛線底）| "quote"（原文出處，小引號角標）。
 * - `pos`: "top"（預設）| "bottom" — 靠近舞台頂部的元素用 bottom。
 * - `align`: "center"（預設）| "start" | "end" — 靠舞台左/右緣的觸發點
 *   用 start / end，讓 tooltip 朝內側展開不被裁切。
 * - **stacking context 陷阱**：如果 `<Term>` 被包在有 `animation`/
 *   `opacity`/`transform` 的父層裡（例如逐步揭示動畫常見的
 *   `.xx-rise`/`.xx-fade` class），那個父層會自動形成自己的 stacking
 *   context，把 `.term-tip` 的 `z-index: 9999` 關在裡面，贏不了外面
 *   DOM 順序更後面的同層兄弟元素（實測案例：範例章節的 `.ex-pill`
 *   標籤動畫把裡面的 tooltip 蓋住了）。**修法**：幫那個動畫父層自己
 *   補上明確的 `position: relative; z-index: <N>;`（見 Example.css
 *   的 `.ex-pill`），不要只靠動畫隱性形成的 stacking context。
 */
export function Term({
  tip,
  children,
  kind = "abbr",
  pos = "top",
  align = "center",
}: {
  tip: ReactNode;
  children: ReactNode;
  kind?: "abbr" | "quote";
  pos?: "top" | "bottom";
  align?: "center" | "start" | "end";
}) {
  return (
    <span
      className={`term term-${kind} term-pos-${pos} term-align-${align}`}
      data-no-advance
      tabIndex={0}
    >
      {children}
      <span className="term-tip" role="tooltip">
        {tip}
      </span>
    </span>
  );
}
