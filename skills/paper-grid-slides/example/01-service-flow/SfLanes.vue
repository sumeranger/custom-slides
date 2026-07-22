<script setup lang="ts">
/**
 * 四道泳道列 — 貫穿 step 3~6 的資料流視覺母題，用高亮 + 連線標示當下動作發生在哪裡。
 * 這是「共用可重複的動態元件」：泳道高亮（active）與弧線路徑（link）都靠 props 算出來，
 * 純 MD 骨架寫不動態 SVG path，故拆成 .vue，供各頁以 <SfLanes :active :link /> 呼叫。
 *
 * 連線一律走上方弧線繞過泳道列，不穿過中間格子——避免跨兩格以上的連線（如
 * 系統 A 前端→文件 AI 前端，中間跳過系統 A 後端）被誤讀成「有經過中間那格」。
 * 弧線高度刻意拉高（peakY），太扁的弧看起來會像兩段斷開的短線。
 */
import { computed } from "vue";

const LANES = ["系統 A 前端", "系統 A 後端", "文件 AI 前端", "文件 AI 後端"];

const props = withDefaults(
  defineProps<{ active?: number[]; link?: { from: number; to: number } }>(),
  { active: () => [] },
);

const arcPath = computed(() => {
  const l = props.link;
  if (!l) return null;
  const fromX = ((Math.min(l.from, l.to) + 0.5) / 4) * 100;
  const toX = ((Math.max(l.from, l.to) + 0.5) / 4) * 100;
  const peakY = Math.abs(l.to - l.from) > 1 ? 4 : 32;
  return `M${fromX} 58 Q${(fromX + toX) / 2} ${peakY} ${toX} 58`;
});
</script>

<template>
  <div class="sf-lanes-wrap">
    <svg
      v-if="arcPath"
      class="sf-lane-arc"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path :d="arcPath" fill="none" stroke-width="1.5" vector-effect="non-scaling-stroke" />
    </svg>
    <div class="sf-lanes">
      <div
        v-for="(label, i) in LANES"
        :key="label"
        class="sf-lane"
        :class="{ 'is-active': active.includes(i) }"
      >
        <span class="mono">{{ label }}</span>
      </div>
    </div>
  </div>
</template>
