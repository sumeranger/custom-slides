<script setup lang="ts">
/**
 * Term — 縮寫全稱 / 引言出處 hover tooltip（floating-vue 包裝）。
 *
 * <Term tip="CCR — 全稱與一句話概念">CCR</Term>
 * <Term kind="quote"><template #tip>
 *   <span class="term-tip-q">"原文逐字"</span>
 *   <span class="term-tip-src">出處 · 日期</span>
 * </template>定價是本人訂的</Term>
 *
 * 相比 React 版：pos/align 退役——floating-vue 自動翻轉避邊；
 * popper 掛進 slide 容器（繼承舞台 scale、殲滅 stacking context 地雷）。
 */
import { ref, onMounted } from "vue";

withDefaults(defineProps<{ tip?: string; kind?: "abbr" | "quote" }>(), {
  kind: "abbr",
});

const el = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | string>("body");
onMounted(() => {
  // selector 依 Phase 0 addendum 實測值
  container.value =
    (el.value?.closest("#slide-content, .slidev-page") as HTMLElement) ?? "body";
});
</script>

<template>
  <VTooltip theme="term" :container="container">
    <span ref="el" class="term" :class="`term-${kind}`" data-no-advance tabindex="0">
      <slot />
    </span>
    <template #popper>
      <slot name="tip">{{ tip }}</slot>
    </template>
  </VTooltip>
</template>
