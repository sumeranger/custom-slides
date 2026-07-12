<script setup lang="ts">
/**
 * 開場標題卡（對映 React step 0）— roadmap「四件事」+ MaskReveal 大標。
 * 「整頁 Vue 畫布」寫法：置中構圖 + MaskReveal 擦入，用純 MD 骨架不好表達，故拆 .vue。
 * 0 拍（無 v-click）：大標用 MaskReveal（transition，匯出安全），其餘靜態常駐。
 */
const ROADMAP = ["AI 服務獨立", "測試站獨立 VM", "Dashboard 五頁", "Demo 情境劇本"];
</script>

<template>
  <div class="sf-scene sf-center">
    <div class="sf-title-inner">
      <span class="v-pill">月份工作簡報</span>
      <h1 class="sf-h1 v-serif-bold">
        <MaskReveal :delay="250" :duration="900">
          <span>這個月，<span class="v-em">四件事</span></span>
        </MaskReveal>
      </h1>
      <div class="sf-roadmap">
        <div
          v-for="(t, i) in ROADMAP"
          :key="t"
          class="sf-roadmap-dot"
          :class="{ 'is-active': i === 0 }"
        >
          <span class="mono sf-roadmap-idx">{{ String(i + 1).padStart(2, "0") }}</span>
          <span class="sf-roadmap-label">{{ t }}</span>
        </div>
      </div>
      <p class="sf-deck">第一件：把 AI 合約審閱，從系統 A 整個搬出去。</p>
    </div>
  </div>
</template>
