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
  const dockStyle = {
    "--stage-w": `${1920 * scale}px`,
    "--stage-half-h": `${540 * scale}px`,
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
        {chapters.map((c, i) => {
          const isActive = i === cursor.chapter;
          return (
            <button
              key={c.id}
              ref={isActive ? activeRef : undefined}
              className={`pb-chapter ${isActive ? "pb-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onJumpChapter(i, 0);
              }}
            >
              <span className="pb-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="pb-title">{c.title}</span>
              {isActive && (
                <div className="pb-pips">
                  {Array.from({ length: c.narrations.length }, (_, s) => (
                    <span
                      key={s}
                      className={`pb-pip ${
                        s <= cursor.step ? "pb-pip-on" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpChapter(i, s);
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
