<script setup lang="ts">
// 扉頁 layout（GUIDE §6.11「段落編號眉題 + 主題大標」）。
// frontmatter 欄位：chapter（"01" 等段落編號）、eyebrow（眉題，可省略）。
import { useSlideContext } from "@slidev/client";

const { $frontmatter } = useSlideContext();
</script>

<template>
  <div class="slidev-layout stage-frame scene chapter-open">
    <span class="label-mono chapter-eyebrow">
      <span class="mono">{{ $frontmatter.chapter }}</span>
      <span v-if="$frontmatter.eyebrow"> · {{ $frontmatter.eyebrow }}</span>
    </span>
    <div class="chapter-open-body">
      <slot />
    </div>
  </div>
</template>

<style>
/* .slidev-layout 前綴：贏過 Slidev layouts-base.css 對 .slidev-layout 的
   px-14 py-10 padding（同 specificity 時載入順序不保證，直接抬一級）。 */
.slidev-layout.chapter-open {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--stage-pad-y, 96px) var(--stage-pad-x, 120px);
}
.chapter-open .chapter-eyebrow {
  display: block;
  margin-bottom: 28px;
  color: var(--accent);
}
/* .chapter-open 前綴 + margin:0：贏過 layouts-base.css 的
   `.slidev-layout h1 { text-4xl mb-4 }`（0,1,1 → 0,2,1）。 */
.chapter-open .chapter-open-body h1 {
  font-size: var(--t-display, 96px);
  line-height: 1.12;
  margin: 0;
}
</style>
