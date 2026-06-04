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
