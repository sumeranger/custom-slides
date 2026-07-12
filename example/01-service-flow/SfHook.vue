<script setup lang="ts">
/**
 * 轉場鉤子（對映 React step 2）— 具體按下附件列表的「文件助手」按鈕。
 * 「整頁 Vue 畫布」：置中 + 絕對定位游標圖示。1 拍：
 *   click 0 只有檔名列 + 按鈕 + 游標；click 1 揭示問句「資料到底怎麼走？」。
 */
</script>

<template>
  <div class="sf-scene sf-center">
    <div class="sf-hook">
      <div class="sf-hook-row">
        <span class="mono sf-hook-file">draft-contract.pdf</span>
        <span class="sf-hook-btn">
          文件助手
          <span class="sf-hook-cursor" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="34" height="34">
              <path
                d="M8 4 L8 32 L15 25 L20 34 L24 32 L19 23 L28 22 Z"
                fill="var(--text)"
                stroke="var(--surface-2)"
                stroke-width="2"
              />
            </svg>
          </span>
        </span>
      </div>
      <p v-click="1" class="sf-hook-t v-serif-bold">
        按下去之後，<span class="v-em">資料到底怎麼走</span>？
      </p>
    </div>
  </div>
</template>
