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
   * Short nav handle shown in the bottom progress bar's equal-width pill.
   * Keep it ≤ ~6 CJK chars (fewer as chapter count grows) so it fits one
   * line without truncating — put the full descriptive framing on the
   * chapter's own eyebrow / heading, not here. See references/OUTLINE.md §1.3.
   */
  title: string;
  /**
   * Per-step narration text. **Length === total steps in this chapter.**
   * This is the single source of truth for step count and audio synthesis.
   */
  narrations: Narration[];
  Component: ComponentType<ChapterStepProps>;
}
