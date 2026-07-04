import type { ComponentType } from "react";

export interface ChapterStepProps {
  step: number; // 0..(narrations.length - 1)
}

/**
 * One narration entry — the spoken text for that step.
 *
 * Empty string ("") means "no audio for this step" (e.g. silent transition
 * shot). Auto mode falls back to a short estimate when audio is missing or
 * the text is empty.
 */
export type Narration = string;

export interface ChapterDef {
  id: string;
  /**
   * Nav handle shown in the bottom progress bar's pill. The CURRENT chapter's
   * pill expands to show this in full; inactive pills share the remaining
   * width and truncate with an ellipsis if needed. So keep it reasonably
   * short (≤ ~8 CJK chars, fewer as chapter count grows) so inactive pills
   * stay readable — full descriptive framing goes on the chapter's own
   * eyebrow / heading, not here. See references/OUTLINE.md §1.3.
   */
  title: string;
  /**
   * Per-step narration text. **Length === total steps in this chapter.**
   * This is the single source of truth for step count and audio synthesis.
   */
  narrations: Narration[];
  Component: ComponentType<ChapterStepProps>;
}
