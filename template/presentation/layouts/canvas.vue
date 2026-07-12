<template>
  <!-- 自由畫布：掛 .stage-frame 讓 base.css 的紙面/格線/陰影生效。
       定位鏈：Slidev 的 #slide-content 是 1920×1080 的 positioned box，
       .stage-frame 的 absolute inset 因此吃到整張畫布。 -->
  <div class="slidev-layout stage-frame scene">
    <slot />
  </div>
</template>
