---
layout: chapter-open
chapter: "01"
chapterTitle: 資料流
eyebrow: 去識別化參考章節
---

<!-- ════════════════════════════════════════════════════════════════════════
     使用方式（本目錄是「參考文件」，不是可獨立執行的專案）
     ────────────────────────────────────────────────────────────────────────
     md 內用相對路徑 <SfLanes/> 等元件無法自動載入；要實跑，把檔案搬進目標
     presentation 專案：
       1. 把 *.vue（SfTitle / SfExtract / SfHook / SfLanes）複製進專案 components/
       2. 把 service-flow.css 複製進 styles/，並在 styles/index.ts 於 base.css
          之後、animations.css 之前加一行 import "./service-flow.css";
       3. 把本 .md 複製進 chapters/，並在 slides.md 加 `--- src: ./chapters/01-service-flow.md ---`
     視覺配色全部吃當前 theme 的 token，章節本身不寫死顏色。

     ════════════════════════════════════════════════════════════════════════
     切分表（頁 × 來源 step × 拍數）— 混合式判斷的成果
     ────────────────────────────────────────────────────────────────────────
     切分原則：整屏換景 = 新 slide；同屏累加揭示 = 同 slide 的 v-click。
     MD-vs-Vue 判斷：能用靜態 HTML + v-click 表達 = MD 骨架；需要動態計算 / 置中
     疊放 / MaskReveal 擦入等絕對定位構圖 = 整頁（或可重用）Vue 元件。

     頁 | 來源 step | 型態              | 元件           | 拍數 | 備註
     ---+-----------+-------------------+----------------+------+---------------------------
      1 | （新增扉頁）| chapter-open · MD |  —             |  0  | 慣例扉頁；沿用既有去識別化字詞
      2 | step 0    | canvas · Vue      | SfTitle        |  0  | 置中 + MaskReveal → Vue
      3 | step 1    | canvas · Vue      | SfExtract      |  1  | 抽離構圖 + SVG → Vue；1 拍揭示「現在」
      4 | step 2    | canvas · Vue      | SfHook         |  1  | 置中 + 游標圖 → Vue；1 拍揭示問句
      5 | step 3    | canvas · MD+Vue   | SfLanes        |  1  | 骨架 host 動態泳道；detail card v-click
      6 | step 4    | canvas · MD+Vue   | SfLanes        |  0  | 帶 Term（attachmentId/sub）→ 全靜態（見下）
      7 | step 5    | canvas · MD+Vue   | SfLanes        |  1  | punch「票就作廢了」v-click
      8 | step 6    | canvas · MD+Vue   | SfLanes        |  3  | 三件事逐項 v-clicks
      9 | step 7    | canvas · MD       |  —             |  0  | 核心結論，置中靜態
     10 | step 8    | canvas · MD       |  —             |  2  | 系統 C 對比，兩欄逐一 v-click
     11 | step 9    | canvas · MD       |  —             |  1  | 帶 Term（TDD）；數字靜態、瘦身 v-click
     12 | step 10   | canvas · MD       |  —             |  1  | 誠實揭露 + 收束 v-click

     關鍵適配（與 React 版差異）：
     - React 版用 @keyframes + animation-delay 做「時間節拍」進場；本章一律改成
       敘事拍點 → v-click（transition 揭示），其餘 → 靜態。整章不留 @keyframes：
       本章沒有環境迴圈動畫，且延遲型 @keyframes 會在 PNG 匯出時被拍到未進場的空畫面。
     - 帶 Term 的頁（6、11）刻意讓含 Term 的內容「常駐、不藏在 click 後」：Slidev 的
       .slidev-vclick-hidden 是 pointer-events:none !important，藏在 click 後的 Term
       在未揭示狀態 hover 不到，snap-sweep 會誤報 no-box。故 slide 6 全靜態、slide 11
       只把不含 Term 的「瘦身區」設 v-click。
     - LaneTrack → SfLanes：連線弧線 path 由 link{from,to} 動態算出，維持「跨格走
       上方弧線、不穿中間格」的原意。
     ════════════════════════════════════════════════════════════════════════ -->

# 資料，怎麼在兩套系統之間走

<!--
本章是去識別化的實戰參考章節：一個功能（合約 AI 審閱 / 摘要）被抽成獨立微服務後，
使用者觸發它時，資料如何在既有主系統與新服務之間流動、彼此如何互不信任地簽票。
-->

---
layout: canvas
---

<SfTitle />

<!--
這個月的工作，我整理成四件事：AI 合約審閱獨立成微服務、內部測試站搬離共用主機、
系統 A 上線五頁儀表板，還有 demo 站台的情境劇本。從第一件開始講。
-->

---
layout: canvas
---

<SfExtract />

<!--
文件助手，也就是合約的 AI 審閱跟 AI 摘要，過去是埋在系統 A 裡面的一個功能。
[click] 這個月，我們把它整個抽了出來，變成獨立的服務「文件 AI 服務」：自己一個
repo、自己一套資料庫。
-->

---
layout: canvas
---

<SfHook />

<!--
拆開之後，馬上要回答一個問題：使用者在附件列表按下「文件助手」，
[click] 資料要怎麼在兩套系統之間流動？
-->

---
layout: canvas
---

<div class="sf-scene sf-pad">
  <div class="sf-head">
    <span class="v-pill">資料流 · 01</span>
    <h2 class="sf-h2 v-serif-bold">點下去之後，<span class="v-em">先跟自己要一張票</span></h2>
  </div>
  <SfLanes :active="[0, 1]" :link="{ from: 0, to: 1 }" />
  <div v-click class="sf-detail-card">
    <span class="mono sf-detail-endpoint">GET /document-summary/service-ticket</span>
    <span class="sf-detail-d">系統 A 前端向自己的後端要一張「進文件 AI 服務的票」</span>
  </div>
</div>

<!--
流程是這樣。按下按鈕，系統 A 的前端先向自己的後端，
[click] 要一張進文件 AI 服務的門票。
-->

---
layout: canvas
---

<div class="sf-scene sf-pad">
  <div class="sf-head">
    <span class="v-pill">資料流 · 02</span>
    <h2 class="sf-h2 v-serif-bold">三道檢查過了，<span class="v-em">才發一張票</span></h2>
  </div>
  <SfLanes :active="[1]" />
  <div class="sf-checklist">
    <div class="sf-checklist-item"><span class="sf-checklist-mark mono">✓</span>有讀取權限</div>
    <div class="sf-checklist-item"><span class="sf-checklist-mark mono">✓</span>附件屬於這份合約</div>
    <div class="sf-checklist-item"><span class="sf-checklist-mark mono">✓</span>副檔名僅限 PDF</div>
  </div>
  <div class="sf-ticket">
    <span class="label-mono">票 · JWT</span>
    <span class="sf-ticket-t"><Term><template #tip><span class="term-tip-t">attachmentId</span>JWT 自訂 claim。值其實是後端儲存路徑的 UUID 檔名，不是使用者上傳時的原始檔名，也不是資料庫查權限用的附件 GUID。</template>檔名</Term> + <Term><template #tip><span class="term-tip-t">sub</span>標準 JWT claim，存登入帳號（loginId）字串。</template>帳號</Term>，不含合約內容</span>
    <span class="hero-num sf-ticket-num">5 分鐘</span>
  </div>
</div>

<!--
後端不會直接發票。它先做三道檢查：這個人有沒有這份合約的讀取權限？附件是不是真的
屬於這份合約？檔案是不是 PDF？三關都過，才簽出一張效期只有五分鐘的票——上面只寫
檔名跟帳號，合約內容完全不在裡面。（本頁全靜態、0 拍：含 Term 的票需常駐可 hover）
-->

---
layout: canvas
---

<div class="sf-scene sf-pad">
  <div class="sf-head">
    <span class="v-pill">資料流 · 03</span>
    <h2 class="sf-h2 v-serif-bold">瀏覽器帶著票，<span class="v-em">自己走進文件 AI 服務</span></h2>
  </div>
  <SfLanes :active="[0, 2, 3]" :link="{ from: 0, to: 2 }" />
  <div class="sf-swap">
    <div class="sf-swap-old"><span class="mono">票 · 5 分鐘</span></div>
    <svg class="sf-swap-arrow" viewBox="0 0 140 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 15 H120" fill="none" stroke-width="2" />
      <path d="M108 6 L126 15 L108 24" fill="none" stroke-width="2" />
    </svg>
    <div class="sf-swap-new"><span class="mono">文件 AI 服務自己的 session</span></div>
  </div>
  <p v-click class="sf-punch v-serif-bold">驗過票之後，<span class="v-em">票就作廢了</span></p>
</div>

<!--
接著瀏覽器開一個新分頁，帶著票走進文件 AI 服務。文件 AI 服務驗完票，發一個自己
專屬的登入狀態給這位使用者，
[click] 這張票當場作廢。
-->

---
layout: canvas
---

<div class="sf-scene sf-pad">
  <div class="sf-head">
    <span class="v-pill">資料流 · 04</span>
    <h2 class="sf-h2 v-serif-bold">剩下的事，<span class="v-em">文件 AI 服務自己來</span></h2>
  </div>
  <SfLanes :active="[3]" />
  <div class="sf-self">
    <v-clicks>
      <div class="sf-self-item"><span class="mono sf-self-idx">01</span>查全文 · 索引服務</div>
      <div class="sf-self-item"><span class="mono sf-self-idx">02</span>叫 AI · AI 引擎</div>
      <div class="sf-self-item"><span class="mono sf-self-idx">03</span>串流回來 · SSE</div>
    </v-clicks>
  </div>
</div>

<!--
之後不管是摘要還是審閱，都由文件 AI 服務自己完成：
[click] 自己查全文、
[click] 自己叫 AI、
[click] 自己把結果串流回畫面。
-->

---
layout: canvas
---

<div class="sf-scene sf-center">
  <div class="sf-thesis v-corners">
    <div class="sf-thesis-lanes">
      <span class="sf-thesis-box">系統 A 後端</span>
      <span class="sf-thesis-x mono">✕</span>
      <span class="sf-thesis-box">文件 AI 服務後端</span>
    </div>
    <p class="sf-thesis-t v-serif-bold">兩邊後端<span class="v-em">從未直接講過話</span></p>
    <p class="sf-thesis-d">中間人是使用者的瀏覽器</p>
  </div>
</div>

<!--
所以整套設計可以用一句話總結：系統 A 的後端，從頭到尾沒有把合約內容交給文件 AI
服務；兩邊後端甚至沒有直接對話過——中間人，是使用者的瀏覽器。
-->

---
layout: canvas
---

<div class="sf-scene sf-pad">
  <div class="sf-head">
    <span class="v-pill">設計亮點</span>
    <h2 class="sf-h2 v-serif-bold">同個網域，<span class="v-em">兩種選擇</span></h2>
  </div>
  <div class="sf-compare">
    <div v-click="1" class="sf-compare-col">
      <span class="label-mono">系統 C · /service-c/</span>
      <div class="sf-compare-row"><span class="mono">重用系統 A cookie</span></div>
      <span class="sf-compare-d">直接做 SSO</span>
    </div>
    <div class="sf-compare-rule"></div>
    <div v-click="2" class="sf-compare-col sf-compare-accent">
      <span class="label-mono">文件 AI 服務 · /service-b/</span>
      <div class="sf-compare-row"><span class="mono">自己發一張最小範圍短效票</span></div>
      <span class="sf-compare-d">換到登入狀態完全隔離</span>
    </div>
  </div>
</div>

<!--
這裡有個值得一提的對照。文件 AI 服務跟另一個系統（系統 C）部署在同一個網域下：
[click] 系統 C 選擇直接重用系統 A 的登入；
[click] 文件 AI 服務明明可以照做，卻堅持自己發一張範圍最小、只活五分鐘的票。多走
這一步，換到的是兩套系統的登入狀態完全隔離。
-->

---
layout: canvas
---

<div class="sf-scene sf-pad">
  <div class="sf-head">
    <span class="v-pill">交付狀態</span>
    <h2 class="sf-h2 v-serif-bold">現在只做<span class="v-em">兩件事</span></h2>
  </div>
  <div class="sf-numbers sf-numbers-compact">
    <div class="sf-num-block">
      <span class="hero-num sf-num-sm">14</span>
      <span class="sf-num-label">個開發任務 · <Term><template #tip><span class="term-tip-t">TDD — Test-Driven Development</span>先寫測試、再寫功能，確保每個任務都有測試把關。</template>TDD</Term> 全部走完</span>
    </div>
    <div class="sf-num-rule"></div>
    <div class="sf-num-block">
      <span class="hero-num sf-num-sm">43</span>
      <span class="sf-num-label">個測試全綠</span>
    </div>
  </div>
  <div v-click class="sf-slim">
    <div class="sf-slim-col">
      <span class="label-mono sf-slim-k">同步瘦身</span>
      <p class="sf-slim-summary v-strike">舊的 AI 引擎直連程式碼，整批刪除</p>
    </div>
    <div class="sf-slim-col sf-slim-col-new">
      <span class="label-mono sf-slim-k">剩下的</span>
      <div class="sf-slim-new"><span class="sf-slim-new-d">檢查權限 → 發一張短效期的票</span></div>
    </div>
  </div>
</div>

<!--
交付面：14 個開發任務全部照 TDD 走完，43 個測試全綠。
[click] 系統 A 也同步瘦身，舊的 AI 引擎直連程式碼整批刪除——現在它只剩兩件事：
檢查權限、發票。（數字區含 TDD Term，靜態常駐；瘦身區 v-click）
-->

---
layout: canvas
---

<div class="sf-scene sf-center">
  <div class="sf-close-wrap">
    <div class="sf-caveat v-corners">
      <PhaseTag kind="q">尚未上線</PhaseTag>
      <p class="sf-caveat-t v-serif-bold">還沒正式對客戶開放</p>
      <div class="sf-caveat-list">
        <span>金鑰 · 測試假值</span>
        <span>網址 · 測試假值</span>
      </div>
    </div>
    <div v-click class="sf-close">
      <span class="sf-close-from">一個功能</span>
      <svg class="sf-close-arrow" viewBox="0 0 120 28" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 14 H100" fill="none" stroke-width="2" />
        <path d="M90 5 L108 14 L90 23" fill="none" stroke-width="2" />
      </svg>
      <span class="sf-close-to v-serif-bold">可以單獨賣的<span class="v-em">產品</span></span>
    </div>
  </div>
</div>

<!--
要老實說的是：這個服務還沒對客戶開放，金鑰跟網址目前都是測試用的假值，上線前得
換成真值。但方向已經確定——
[click] 這是把「一個功能」，升級成「一個可以單獨賣的產品」。
-->
