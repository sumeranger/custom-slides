<script setup lang="ts">
/**
 * clip-path 文字擦入。搭配 animations.css 的 .mask-reveal / .mask-reveal.in。
 * Slidev 版：靜態出場直接用（show 預設 true + delay）；
 * 逐步揭示在 canvas 元件內用 :show="$clicks >= N" 餵。
 */
withDefaults(
  defineProps<{ show?: boolean; delay?: number; duration?: number }>(),
  { show: true, delay: 0 },
);
</script>

<template>
  <span
    class="mask-reveal"
    :class="{ in: show }"
    :style="{
      display: 'inline-block',
      transitionDelay: show ? `${delay}ms` : '0ms',
      ...(duration ? { transitionDuration: `${duration}ms` } : {}),
    }"
  >
    <slot />
  </span>
</template>
