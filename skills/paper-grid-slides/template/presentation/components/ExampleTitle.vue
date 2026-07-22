<script setup lang="ts">
/**
 * 示範標題卡 —「整頁 Vue 畫布元件」寫法的範本（混合式模型的複雜頁路徑）。
 * 展示：v-pill / v-corners / v-serif-bold / hero-num primitives、
 * 兩種 Term tooltip、MaskReveal 標題擦入。做真實內容前刪除本元件。
 */
</script>

<template>
  <div class="ex-scene ex-center">
    <div class="ex-title-inner">
      <span class="v-pill ex-pill">
        <Term>
          <template #tip>
            <span class="term-tip-t">Demo — 簡寫型 tooltip</span>
            hover 虛線字即可看到全稱與一句話概念；點擊不會翻頁（data-no-advance）。
          </template>
          Demo
        </Term>
        　· paper-grid
      </span>

      <h1 class="ex-h v-serif-bold">
        <MaskReveal :delay="300" :duration="1000">
          <span>紙感編輯風，<span class="v-em">點擊驅動</span></span>
        </MaskReveal>
      </h1>

      <div class="ex-card v-corners">
        <span class="label-mono ex-card-k">hero 數字示範</span>
        <span class="hero-num ex-card-num">60–95%</span>
        <span class="ex-card-d">
          <Term kind="quote">
            <template #tip>
              <span class="term-tip-q">"60-95% fewer tokens, same answers."</span>
              <span class="term-tip-src">引文出處示範 · 原文逐字 + 來源日期</span>
            </template>
            原文出處型 tooltip 長這樣
          </Term>
        </span>
      </div>
    </div>
  </div>
</template>
