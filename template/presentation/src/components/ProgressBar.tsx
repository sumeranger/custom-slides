import { useEffect, useRef, type CSSProperties } from "react";
import type { ChapterDef } from "../registry/types";
import { useStageScale } from "../hooks/useStageScale";
import "./ProgressBar.css";

interface Props {
  chapters: ChapterDef[];
  cursor: { chapter: number; step: number };
  onJumpChapter(idx: number, step?: number): void;
}

/**
 * Chapter progress bar docked as the stage card's footer: it matches the
 * stage's rendered width and sits flush against the stage's bottom edge,
 * sharing the paper surface + a hairline seam so the deck + nav read as one
 * card (not a second floating panel). Reads `useStageScale` to align to the
 * live stage box.
 *
 * Content-adaptive within the stage width; if chapters (or an active
 * chapter's step pips) overflow, the footer scrolls horizontally instead of
 * squeezing items. The active chapter auto-scrolls into view on change.
 */
export function ProgressBar({
  chapters,
  cursor,
  onJumpChapter,
}: Props) {
  const scale = useStageScale();

  // Overall deck progress (0..1) — drives the fill rail so the footer reads
  // as an actual progress indicator, not just a chapter list.
  const totalSteps = chapters.reduce((n, c) => n + c.narrations.length, 0);
  const stepsBefore = chapters
    .slice(0, cursor.chapter)
    .reduce((n, c) => n + c.narrations.length, 0);
  const progress =
    totalSteps > 0 ? (stepsBefore + cursor.step + 1) / totalSteps : 0;

  const dockStyle = {
    "--stage-w": `${1920 * scale}px`,
    "--stage-half-h": `${540 * scale}px`,
    "--pb-progress": progress,
  } as CSSProperties;
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [cursor.chapter]);

  return (
    <div className="pb-hover" style={dockStyle} data-no-advance>
      <div className="pb">
        {/* progress rail: the top seam doubles as a fill showing how far
            through the whole deck we are */}
        <div className="pb-rail" aria-hidden="true" />
        <div className="pb-chapters">
          {chapters.map((c, i) => {
            const state =
              i < cursor.chapter
                ? "pb-past"
                : i === cursor.chapter
                  ? "pb-current"
                  : "pb-future";
            return (
              <button
                key={c.id}
                ref={i === cursor.chapter ? activeRef : undefined}
                className={`pb-chapter ${state}`}
                aria-current={i === cursor.chapter ? "step" : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpChapter(i, 0);
                }}
              >
                <span className="pb-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="pb-title">{c.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
