<script setup lang="ts">
/**
 * 問題(Q)/解法(A) 角色標記 — kind="q" 實心✕、kind="a" 描邊✓。
 * 不引入新色，只靠 solid↔outline + ✕↔✓ 區分（單一 accent 主題不破功）。
 */
defineProps<{ kind: "q" | "a" }>();
</script>

<template>
  <span class="phase-tag" :class="`phase-tag-${kind}`">
    <span class="phase-tag-mark mono">{{ kind === "q" ? "✕" : "✓" }}</span>
    <span class="phase-tag-label"><slot>{{ kind === "q" ? "問題" : "解法" }}</slot></span>
  </span>
</template>
