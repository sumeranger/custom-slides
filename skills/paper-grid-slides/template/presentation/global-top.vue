<script setup lang="ts">
/**
 * 點擊畫面任意處推進（保留 react 版 Stage 的 click-driven UX）。
 *
 * 範圍：只有點在舞台本體（#slide-content，即 1920×1080 畫布）上才推進——
 * 與舊版 Stage.tsx 把 handler 掛在 .stage-frame 上同語意。這同時天然豁免
 * Slidev 自身 UI：底部 NavControls / overview·goto 等 overlay 都在
 * #slide-content 之外；letterbox（#slide-container 本身）則留給 Slidev
 * play.vue 原生的「右半下一頁 / 左半上一頁」pointerdown 行為，避免雙重觸發。
 *
 * 豁免：互動元素、data-no-advance（Term 的 trigger 自帶）、floating-vue
 * popper（Term 掛進 #slide-content，需明列）。
 * 只在正常放映生效（presenter / print·export 直接 return）。
 */
import { onMounted, onUnmounted } from "vue";
import { useNav } from "@slidev/client";

const nav = useNav();

function onClick(e: MouseEvent) {
  if (nav.isPresenter.value || nav.isPrintMode.value) return;
  const t = e.target as HTMLElement | null;
  if (!t?.closest("#slide-content")) return;
  if (
    t.closest(
      "button, a, input, textarea, select, [data-no-advance], .v-popper__popper",
    )
  )
    return;
  nav.next();
}
onMounted(() => window.addEventListener("click", onClick));
onUnmounted(() => window.removeEventListener("click", onClick));
</script>

<template>
  <span style="display: none" />
</template>
