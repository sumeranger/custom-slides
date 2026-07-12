<script setup lang="ts">
/**
 * 章節 pill 進度條（react 版 ProgressBar 的 Slidev 移植）。
 * 資料來源：slides 的 frontmatter（chapter / chapterTitle 慣例見 OUTLINE.md §1.3）。
 * 寬度對齊舞台：ResizeObserver 量 #slide-container 實寬（取代 useStageScale）。
 */
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { useNav } from "@slidev/client";

const nav = useNav();

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

const activeGroup = computed(() =>
  groups.value.findIndex((g) => g.pages.includes(nav.currentPage.value)),
);

// 舞台實寬 → pill bar 寬度與格線尺寸
const stageW = ref(0);
let ro: ResizeObserver | null = null;
onMounted(() => {
  const el = document.getElementById("slide-container");
  if (!el) return;
  ro = new ResizeObserver(() => (stageW.value = el.clientWidth));
  ro.observe(el);
  stageW.value = el.clientWidth;
});
onUnmounted(() => ro?.disconnect());

const barStyle = computed(() => ({
  "--stage-w": `${stageW.value}px`,
  "--pb-grid": `${(48 * stageW.value) / 1920}px`,
}));

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
  <div v-if="groups.length" class="pb-hover" :style="barStyle" data-no-advance>
    <div class="pb-chapters">
      <button
        v-for="(g, i) in groups"
        :key="g.num + g.title"
        :ref="i === activeGroup ? (el) => (activeRef = [el as HTMLElement]) : undefined"
        class="pb-chapter"
        :class="{ 'pb-current': i === activeGroup }"
        :aria-current="i === activeGroup ? 'step' : undefined"
        @click.stop="nav.go(g.pages[0])"
      >
        <span class="pb-num">{{ g.num }}</span>
        <span class="pb-title">{{ g.title }}</span>
        <span v-if="i === activeGroup && g.pages.length > 1" class="pb-pips">
          <span
            v-for="p in g.pages"
            :key="p"
            class="pb-pip"
            :class="{ 'pb-pip-on': p <= nav.currentPage.value }"
            role="button"
            :aria-label="`跳到第 ${p} 頁`"
            @click.stop="nav.go(p)"
          />
        </span>
      </button>
    </div>
  </div>
</template>
