<script setup lang="ts">
/**
 * 章節 pill 進度條（react 版 ProgressBar 的 Slidev 移植）。
 * 資料來源：slides 的 frontmatter（chapter / chapterTitle 慣例見 OUTLINE.md §1.3）。
 * 寬度對齊舞台：無需 JS 量測。.pb-hover 掛在 Slidev 的 #slide-content
 * （帶 transform: scale 的縮放層）之內，其 containing block 就是畫布
 * （canvasWidth 1920），故 CSS 端 width: 100% 直接 = 畫布寬，再由父層的
 * --slidev-slide-scale 自動縮到螢幕實寬、永遠貼齊內容（見 progress-bar.css）。
 * 舊版曾用 ResizeObserver 量 #slide-container（= viewport）餵 --stage-w，
 * 那是把「已在縮放座標系內」的盒子又乘了一次視窗寬 → 非 16:9 視窗下 bar
 * 比內容寬。已移除；export 本來就靠這個 100% fallback，兩路統一。
 */
import { computed, ref, watch, nextTick } from "vue";
import { useNav, useSlideContext } from "@slidev/client";

const nav = useNav();
// print/export 模式下，slidev 會「每個匯出頁各掛一份」GlobalBottom，
// 但 useNav()（createSharedComposable 全域單例）的 currentPage 只綁一顆
// router route——每份實例讀到的都是同一顆（永遠停在扉頁），導致匯出的
// PNG 全部沒有 .pb-current 與 pips。useSlideContext().$nav 才是「這份
// 實例對應的那一頁」：@slidev/client 的 internals/PrintSlideClick.vue
// 用 provideLocal 逐頁重新提供 useFixedNav()（見 composables/useNav.ts），
// useSlideContext() 讀到的 $nav 因而是 per-page 的；dev 模式沒有這層
// local provide，$nav 會落回 root 提供的同一顆 useNav()，行為與原本一致。
// currentPage / go 因此改讀 $nav；groups 用的 slides 清單兩邊指向同一顆
// 全域 ref（皆為 #slidev/slides 的模組級 slides），繼續用 nav.slides 即可。
const { $nav } = useSlideContext();

interface Group {
  num: string;
  title: string;
  pages: number[];
}

const groups = computed<Group[]>(() => {
  const gs: Group[] = [];
  for (const s of nav.slides.value) {
    const fm = (s.meta?.slide?.frontmatter ?? {}) as Record<string, string>;
    if (fm.chapterTitle) {
      gs.push({
        num: fm.chapter ?? String(gs.length + 1).padStart(2, "0"),
        title: fm.chapterTitle,
        pages: [],
      });
    }
    if (gs.length > 0) gs[gs.length - 1].pages.push(s.no);
  }
  return gs;
});

// $nav 是 toRef(reactive 物件, 'nav')：外層 .value 之後，nav 內部欄位
// （currentPage 等）已被 reactive 的 ref-unwrap 拆掉一層，故只取一次
// .value，不再對 currentPage 取 .value（對照 @slidev/client 官方同款
// 用法：logic/slides.ts 的 `$nav.value.currentSlideNo`）。
const activeGroup = computed(() =>
  groups.value.findIndex((g) => g.pages.includes($nav.value.currentPage)),
);

const activeRef = ref<HTMLElement[]>([]);
watch(activeGroup, () =>
  nextTick(() =>
    activeRef.value[0]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    }),
  ),
);
</script>

<template>
  <div v-if="groups.length" class="pb-hover" data-no-advance>
    <div class="pb-chapters">
      <button
        v-for="(g, i) in groups"
        :key="g.num + g.title"
        :ref="i === activeGroup ? (el) => (activeRef = [el as HTMLElement]) : undefined"
        class="pb-chapter"
        :class="{ 'pb-current': i === activeGroup }"
        :aria-current="i === activeGroup ? 'step' : undefined"
        @click.stop="$nav.go(g.pages[0])"
      >
        <span class="pb-num">{{ g.num }}</span>
        <span class="pb-title">{{ g.title }}</span>
        <span v-if="i === activeGroup && g.pages.length > 1" class="pb-pips">
          <span
            v-for="p in g.pages"
            :key="p"
            class="pb-pip"
            :class="{ 'pb-pip-on': p <= $nav.currentPage }"
            role="button"
            :aria-label="`跳到第 ${p} 頁`"
            @click.stop="$nav.go(p)"
          />
        </span>
      </button>
    </div>
  </div>
</template>
