import type { Narration } from "../../registry/types";

/**
 * 示範章節 — 做真實內容前請整個資料夾刪除（並從 chapters.ts 移除註冊）。
 * narrations.length === 章節 step 總數（唯一真相源）。
 */
export const narrations: Narration[] = [
  "這是 paper-grid 簡報模板的示範頁，展示標題卡與 hover tooltip 的用法。",
  "清單要逐項揭示：講到哪一項，哪一項才亮起來，前面的灰化保留當上下文。",
];
