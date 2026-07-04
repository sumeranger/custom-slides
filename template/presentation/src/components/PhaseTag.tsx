import type { ReactNode } from "react";
import "./PhaseTag.css";

/**
 * Problem (Q) / Solution (A) role tag — a deck-wide marker so the audience can
 * scan a "problem → solution" report and instantly tell which beat a step is.
 *
 *   kind="q" → solid accent pill, ✕   (the problem / its cause / its cost)
 *   kind="a" → outline accent pill, ✓ (the fix / the correct way)
 *
 * Introduce NO new colour — it rides the single accent, distinguishing Q vs A
 * purely by solid↔outline + ✕↔✓ (keeps a one-accent theme intact).
 * Pass children to keep a specific framing label (e.g. "★ root cause",
 * "解法 · 寫進 prompt"); omit for the default "問題 / 解法".
 */
export function PhaseTag({ kind, children }: { kind: "q" | "a"; children?: ReactNode }) {
  return (
    <span className={`phase-tag phase-tag-${kind}`}>
      <span className="phase-tag-mark mono">{kind === "q" ? "✕" : "✓"}</span>
      <span className="phase-tag-label">
        {children ?? (kind === "q" ? "問題" : "解法")}
      </span>
    </span>
  );
}
