import type { ChapterDef } from "./types";
import ExampleChapter from "../chapters/01-example/Example";
import { narrations as exampleNarrations } from "../chapters/01-example/narrations";

/**
 * Order = order of presentation.
 *
 * Each chapter MUST provide a `narrations: Narration[]` array. Its length
 * is the chapter's step count — there is no `totalSteps` to maintain
 * separately. This guarantees the audio synthesis pipeline, the runtime
 * stepper, and the chapter `.tsx` switch on `step` cannot drift apart.
 *
 * Visual styling (color, fonts) comes entirely from the active theme —
 * chapters never hard-code palette / font names. See THEMES.md.
 */
export const CHAPTERS: ChapterDef[] = [
  // 做真實內容時：刪除 01-example 資料夾與下面這筆，換成你的章節
  {
    id: "example",
    title: "示範章節",
    narrations: exampleNarrations,
    Component: ExampleChapter,
  },
];
