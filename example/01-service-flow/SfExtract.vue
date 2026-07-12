<script setup lang="ts">
/**
 * 抽離母題（對映 React step 1）— 把「AI 審閱 / 摘要」從系統 A 抽成獨立服務。
 * 「整頁 Vue 畫布」：置中並列 + SVG 箭頭構圖。1 拍：
 *   click 0 只有「以前 · 系統 A」的空殼；click 1 箭頭 + 「現在 · 文件 AI 服務」滑入。
 * v-click="1" 同時掛在箭頭與「現在」卡上（同一拍一起揭示，總拍數 = 1）。
 */
</script>

<template>
  <div class="sf-scene sf-pad">
    <div class="sf-head">
      <span class="v-pill">文件 AI 服務微服務化</span>
      <h2 class="sf-h2 v-serif-bold">從埋在裡面，到<span class="v-em">獨立服務</span></h2>
    </div>
    <div class="sf-extract-stage">
      <div class="sf-extract-box sf-extract-before">
        <span class="label-mono sf-extract-tag">以前 · 系統 A</span>
        <div class="sf-extract-ghost"><span class="mono">AI 審閱 / 摘要</span></div>
      </div>
      <svg
        v-click="1"
        class="sf-extract-arrow"
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path class="sf-extract-path" d="M4 20 H180" fill="none" stroke-width="2" />
        <path class="sf-extract-head" d="M170 10 L188 20 L170 30" fill="none" stroke-width="2" />
      </svg>
      <div v-click="1" class="sf-extract-box sf-extract-after">
        <span class="label-mono sf-extract-tag">現在 · 文件 AI 服務</span>
        <div class="sf-extract-chip"><span class="mono">AI 審閱 / 摘要</span></div>
        <div class="sf-extract-meta">
          <span>自己一個 repo</span>
          <span>自己一套資料庫</span>
        </div>
      </div>
    </div>
  </div>
</template>
