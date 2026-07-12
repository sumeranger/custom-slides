---
layout: chapter-open
chapter: "01"
chapterTitle: 示範
eyebrow: paper-grid 慣例展示
---

# 紙感編輯風，點擊驅動

<!--
這是 paper-grid 簡報模板的示範章節：扉頁用 chapter-open layout，
段落編號眉題 + 主題大標（GUIDE §6.11）。
-->

---
layout: canvas
---

<ExampleTitle />

<!--
這是示範標題卡，展示標題卡與兩種 hover tooltip 的用法。
-->

---
layout: canvas
---

<div class="ex-scene ex-pad">
  <div class="ex-head">
    <span class="v-pill">逐步揭示</span>
    <h2 class="ex-h2 v-serif-bold">一項 = 一個節拍，<span class="v-em">不要一次全上</span></h2>
  </div>
  <ul class="ex-list">
    <v-clicks>
      <li class="ex-item"><span class="mono ex-item-idx">01</span>先講這個</li>
      <li class="ex-item"><span class="mono ex-item-idx">02</span>再講這個</li>
      <li class="ex-item"><span class="mono ex-item-idx">03</span>最後這個</li>
    </v-clicks>
  </ul>
  <span class="ex-src label-mono">出處行慣例 · 右下角 · --t-micro 起（≥20px）</span>
</div>

<!--
清單要逐項揭示：講到哪一項，哪一項才亮起來。
[click] 先講這個——第一拍。
[click] 再講這個——第二拍。
[click] 最後這個——收尾拍。
-->
