# 主題系統

每個簡報從頭到尾跑**一個主題**。不要在章節間切換主題——那會打斷視覺
連貫性。

主題 = `theme.json`（metadata）+ `tokens.css`（必要，純 `:root` token）+
`extras.css`（可選，選擇器層覆寫）。

## 為什麼是兩個 CSS 檔，不是姊妹 skill `web-video-presentation` 的單一 `tokens.css`

`base.css` 除了定義 `:root` token，本身也直接定義了具體選擇器規則
（`.stage-frame`、`.card`、`.v-*` 以外的 primitive）並用 `var()` 消費
token。純 CSS 的 cascade 規則是：**同一個選擇器（或同一個 `:root` 區
塊裡的同一個自訂屬性）、同樣 specificity，後載入的規則贏**。

一個主題需要 `extras.css` 有兩種獨立的理由，都是同一條 cascade 規則
的不同表現形式：

- **理由一：同一個選擇器要贏過 `base.css` 的同選擇器規則。** 如果一
  個主題只需要換 token 值（顏色、字體、圓角、陰影的**值**），
  `tokens.css` 就夠了——它載入在 `base.css` 之前，`base.css` 的規則會
  用 `var()` 讀到新值，不需要主題自己再覆寫選擇器。`dbx-style` 就是
  這種情況。但如果一個主題需要對**同一個選擇器**（例如 `.stage-frame`）
  覆寫具體屬性值（不是透過 token），這條規則必須放進 `extras.css`——
  它載入在 `base.css` **之後**，才會贏過 `base.css` 自己的同選擇器規
  則。`paper-grid` 主題的 `.stage-frame` 紙張邊緣陰影、`.v-corners`/
  `.v-pill`/`.v-breadcrumb`/`.v-strike` 這些**新增** primitive（`base.css`
  完全沒有），都屬於這一類。`.v-serif-bold` 稍有不同：`base.css` 已提供
  一個 theme-agnostic 基線（襯線家族＋`var(--headline-weight, 800)`），
  讓每個主題的標題都有粗體地板；`paper-grid` 的 `extras.css` 只是**覆寫**
  這條規則成自己的 serif-900 樣式，靠載入在後而續贏。

- **理由二（容易漏掉）：`base.css` 自己的 `:root` 區塊，也對一批「性
  格旋鈕」自訂屬性宣告了 fallback 預設值。** 目前兩個主題實際踩過、
  已知會撞的是：`--r-card`、`--rule-w`、`--rule-style`、`--dur-base`、
  `--dur-slow`、`--dur-cinematic`、`--hero-num-font`、
  `--hero-num-style`、`--hero-num-weight`、`--hero-num-track`、
  `--stage-pad-x`、`--stage-pad-y`、`--shadow-stage`。**但這份清單只
  是「目前踩過的」，不是「窮盡的」**——`base.css` 的 `:root` 其實還多
  宣告了一個目前兩個主題都還沒覆寫、所以還沒被踩到的 `--dur-quick`，
  一旦有主題想覆寫它就會是第 14 個同類地雷。**判斷標準永遠是「回頭去
  查 `base.css` 的 `:root` 有沒有再宣告同一個屬性名」，不是背這份清
  單。** `tokens.css` 載入在 `base.css` 之前，而兩者都是純 `:root`
  選擇器、相同 specificity——所以「後載入者贏」：`base.css` 自己對這
  些屬性的預設宣告，會悄悄蓋掉主題在 `tokens.css` 裡對同一批屬性的覆
  寫，即使 `tokens.css` 裡看起來寫得好好的。

  這一點**光看一個主題的 `tokens.css` 本身完全看不出來**——你必須同
  時打開 `base.css` 才會發現它也宣告了同名 `:root` 屬性。更麻煩的
  是，**純文字 diff 也抓不到這個 bug**：`tokens.css` 裡的宣告字面上
  仍然存在、沒有被刪除，只是在瀏覽器實際算 cascade 時輸給了後面的
  `base.css`。唯一可靠的驗證方式是 `npm run build` 之後，去 grep 建出
  來的 `dist/assets/*.css`，看該自訂屬性在檔案裡「最後一次出現」的宣
  告是哪一個——那才是瀏覽器真正會用的值。

  這正是這次主題重構在 **Task 5** 修 critical bug 時實際踩到的坑：
  `paper-grid`、`dbx-style` 兩個主題原本把這批屬性寫在各自的
  `tokens.css` 裡，看起來完全正常，直到用真實 build 輸出核對才發現全
  部被 `base.css` 的預設值蓋掉。修法是把這 13 個屬性從 `tokens.css`
  搬到 `extras.css` 頂部的 `:root {}` 區塊——`extras.css` 載入在
  `base.css` 之後，`:root` 規則的 cascade 順序就反過來贏了。

`styles/index.ts` 的載入順序（已接好，不要改）：

```
fonts.css → tokens.css（主題 token） → base.css → 元件 css（term / phase-tag / progress-bar…） → animations.css → extras.css（主題選擇器層 + 上面理由二那批性格旋鈕 :root 覆寫，可選）
```

元件層 css（`term.css`、`phase-tag.css`、`progress-bar.css`，以及每章自己的
章節 css）固定插在 **`base.css` 之後、`animations.css` 之前**——這樣它們能用
`base.css` 定好的 token/primitive、又不會蓋掉入場動畫；`extras.css` 則**永遠
排最後**，才能贏過前面一切同 specificity 的規則。這個順序是 cascade 契約，
不是隨意排列（見下方「唯一可靠的驗證方式」與 `GUIDE.md` §6.23：贏過 UnoCSS
preflight 靠的是**載入順序**、不是 specificity，所以絕不能重排 import）。

## `extras.css` 反模式（讀完再動手）

`extras.css` 是「例外閥門」，不是主題的常態設計位置：

- **能用 token 做到的效果，不要搬進 `extras.css`。** 90% 的主題個性
  （顏色、字體、圓角、陰影、hero 數字風格、裝飾層）都該留在
  `tokens.css`，只用主題已提供的 token 插槽表達。`dbx-style` 的
  `extras.css` 完全沒有**選擇器層**規則（沒有 `.stage-frame` 覆寫、
  沒有新增 primitive、沒有章節 class 補丁）就是證明——它的
  `extras.css` 只有一個 `:root {}` 區塊，裝著上面理由二那 13 個
  base.css 會碰撞的性格旋鈕覆寫，不是完全空白。先想清楚能不能用既
  有插槽做到，想不到才動用 `extras.css`；就算真的動用了，也盡量只
  加 `:root` 覆寫（理由二那種），不要加選擇器層規則（理由一那種）。
- **`paper-grid` 目前的 `extras.css` 有一段歷史技術債**：其中「Part 2」
  是逐字搬過來的舊 `paper-grid-cards.css`，內容是對 `.co-` `.av-`
  `.at-` `.cl-` `.mn-` `.pl-` 這些**特定歷史章節 class 前綴**的
  `!important` 硬覆寫。這不是「主題」該管的事——正常情況下章節應該
  只用 primitive class（`.hero-num` `.rule` `.card` `.v-pill` 等）
  跟 token，不該有這種跟具體章節 class 名稱綁死的覆寫層。保留它純粹
  是因為「跟 `ai-project-lifecycle-slides` 零視覺差異」優先於「架構
  乾淨」這條硬性前提。**新主題不要模仿這個模式**——如果你發現自己在
  寫 `.scene .xx-something { ... !important }`，先回頭檢查是不是該
  改章節的 CSS 用 primitive class，而不是加一條主題規則去補丁章節。

## 內建主題

| id | 性格 |
|---|---|
| `paper-grid` | 暖紙編輯風＋磚紅 accent＋藍圖網格簽名。**本 skill 目前實際使用與驗收的預設主題**，切換主題前先確認你真的需要換掉它。 |
| `dbx-style` | 深色科技感＋玻璃質感工程師風，取自 DBX 官網色票，固定角落光暈裝飾。 |
| `midnight-press` | 電影感編輯級深色，暖色 espresso 底、單一火熱橙 accent。此 skill 的舊主題殘留，保留相容、非目前使用對象。 |
| `modern-minimal` | 白底編輯式極簡：暖 monochrome 底、霧面粉彩點綴、sans 大標、髮絲分隔線、趨近於零的陰影。依 `minimalist-ui` 協定。另備 `--sem-*` 非契約 token 做狀態色。 |
| `mountain-ink` | 宣紙米白底＋墨綠 accent＋明體中文大標＋山水底圖（三段氣壓，見下「主題自帶靜態資源」）。五個 primitive：`.v-seal`（朱砂印）`.v-enso`（圓相）`.v-brush-rule`（毛筆掃痕）`.v-mist`（霧靄）`.v-safe`（底圖頁的文字安全寬，隨氣壓自動變）。**唯一自帶靜態資產的主題**。 |

隨時列出可用主題：

```bash
bash <skill-root>/scripts/scaffold.sh --list-themes
```

## 套用主題

```bash
# 1. 先照 GUIDE.md 建專案（預設就是 paper-grid，這步可跳過主題切換）
cp -r <skill-root>/template/presentation <新專案>/presentation

# 2. 需要換主題才跑這步
bash <skill-root>/scripts/scaffold.sh <新專案>/presentation --theme=dbx-style
```

之後切換主題 = 重跑上面第 2 步（會覆蓋 `tokens.css`/`extras.css`/`.theme`，並依
`theme.json` 的 `colorSchema` 欄位 patch `slides.md` headmatter 的 `colorSchema:`
——深色主題自動設 `dark`，免得 Slidev 內建工具列白底白 icon，見 GUIDE §6.30）。
刷新 dev server，完成，章節程式碼一行沒動。

如果切換後某章節看起來有問題，那是該章節在某處硬編碼了顏色/字體/尺寸，
而不是用語義 token——bug 在章節裡，不在主題裡。

## 完整 token 契約

`base.css` 給性格 token 都準備了合理預設值。主題的 `tokens.css` 只需
要覆蓋**調色板 + 字體 + 性格旋鈕 + 裝飾**這四類。

### 必填（主題必須定義）

#### 表面色（4 個）

| token | 作用 |
|---|---|
| `--shell` | letterbox / 舞台外的頁面背景 |
| `--surface` | 舞台主背景 |
| `--surface-2` | 凸起 —— 卡片、代碼塊、嵌入面板 |
| `--surface-3` | 最裡層 —— surface-2 裡再嵌一層時用 |

#### 文字（4 個）

| token | 作用 |
|---|---|
| `--text` | 主 |
| `--text-2` | 次（副標題、正文） |
| `--text-mute` | 靜音 —— 標籤 / 元數據 |
| `--text-faint` | 三級 —— 提示 / 禁用 |

#### 線條（1 個）

| token | 作用 |
|---|---|
| `--rule` | 髮絲分割線顏色 |

#### Accent（3 個）

| token | 作用 |
|---|---|
| `--accent` | accent 本體（一個品牌強色，全站唯一） |
| `--accent-soft` | 低透明度疊層 —— pill 背景、懸浮光暈 |
| `--accent-glow` | 中透明度疊層 —— text shadow、圓點發光 |

#### 字型家族（4 個）

| token | 作用 |
|---|---|
| `--font-display-cn` | 中文顯示家族 |
| `--font-display-en` | 拉丁顯示家族 |
| `--font-body` | 正文家族 |
| `--font-mono` | 等寬家族（終端、mono caps、badge——即使品牌本身沒有等寬字體，此 skill 的 primitive 仍需要一個，見 `dbx-style` 的做法） |

### 可選的性格覆蓋

| token | base 默認 | 作用 |
|---|---|---|
| `--font-features` | `"tnum","ss01"` | body 上的 OpenType 特性 |
| `--headline-weight` | `800`（僅 fallback） | `.v-serif-bold` 標題字重。**寫 `tokens.css` 安全**——`base.css` 只用行內 `var(--headline-weight, 800)` 引用、**未**在自己的 `:root` 另宣告一次，所以沒有下面「理由二」的碰撞問題（跟 `--font-features` 同一類對照組，不是標 † 的那批） |
| `--r-card` † | `--r-md`（16px） | 卡片圓角 |
| `--r-stage` | `0` | 舞台本身圓角 |
| `--rule-w` † | `1px` | rule 粗細 |
| `--rule-style` † | `solid` | rule 樣式 |
| `--hero-num-font` † | `--font-display-en` | `.hero-num` 字體 |
| `--hero-num-style` † | `italic` | `italic`/`normal` |
| `--hero-num-weight` † | `400` | 400/500/700/900 |
| `--hero-num-track` † | `--track-tight` | hero 數字字距 |
| `--stage-pad-x` † | `96px` | 舞台橫向內邊距 |
| `--stage-pad-y` † | `80px` | 舞台縱向內邊距 |
| `--card-shadow` | none | `.card` 的 box-shadow |
| `--card-glass-bg` | `rgba(255,255,255,0.06)` | `.card-glass` 背景 |
| `--card-glass-border` | `rgba(255,255,255,0.12)` | `.card-glass` 邊框 |
| `--shadow-stage` † | dark drop | 舞台 box-shadow |
| `--stage-border` | `none` | 舞台可選邊框 |

† **這幾列受「理由二」的 `base.css` 碰撞規則影響**（見上面「為什麼是
兩個 CSS 檔」一節）：`--r-card`、`--rule-w`、`--rule-style`、
`--hero-num-font`/`--hero-num-style`/`--hero-num-weight`/
`--hero-num-track`、`--stage-pad-x`/`--stage-pad-y`、`--shadow-stage`
（以及未在此表出現、但同樣受影響的 `--dur-base`/`--dur-slow`/
`--dur-cinematic` 動畫時長 token）——這些屬性如果寫在 `tokens.css`
裡，覆寫會被 `base.css` 自己的 `:root` 預設值悄悄蓋掉、不會生效。
**這些屬性的覆寫必須放進 `extras.css` 的 `:root` 區塊，不能放
`tokens.css`。**

對照組：`--font-features` 與 `--headline-weight` 雖然也在這張表裡，但
**沒有**這個問題——`base.css` 只在具體規則裡用
`var(--font-features, "tnum","ss01")` /
`var(--headline-weight, 800)` 這種行內 fallback 語法引用它們，並沒有
在自己的 `:root` 區塊另外宣告一次同名屬性，所以在 `tokens.css` 裡設
定完全安全（`dbx-style` 的 `--headline-weight: 900` 就直接寫在
`tokens.css`）。這個對比是為
了說明：這條規則是**逐屬性判斷**的，不是「所有可選 token 都有這個
問題」——判斷標準永遠是「`base.css` 的 `:root` 區塊有沒有再宣告同名
屬性」，不是這張表的分類。

### 可選的裝飾層

| token | 作用 |
|---|---|
| `--surface-pattern` ‡ | 疊在舞台上的 `background-image`（噪聲/網格/掃描線） |
| `--surface-pattern-size` ‡ | 配套的 `background-size` |
| `--surface-pattern-blend` ‡ | pattern 層的 `mix-blend-mode` |
| `--surface-pattern-opacity` ‡ | pattern 層透明度乘子 |
| `--surface-vignette` | vignette/光暈疊層的 `background`（可放多個 `radial-gradient`，逗號分隔對應多個固定角落光暈——`dbx-style` 就是這樣做兩個角的固定光暈裝飾；`mountain-ink` 則用它掛整張底圖，見下） |
| `--text-shadow` | 應用在 `.serif-cn`/`.serif-it`/`.display-en` 上 |

‡ **這四個不只餵舞台，也餵底部進度條。** `styles/progress-bar.css` 的
`.pb-chapters::before` 也消費它們（用途：讓 paper-grid 的藍圖網格延伸進 footer，
使舞台+footer 讀成同一張卡），而且用 `background-size: var(--pb-grid, 48px)`
**覆寫尺寸**。所以：**細碎、可平鋪的紋理**（網格、噪聲、掃描線）掛這裡沒問題；
**一張具體的插畫/照片**掛這裡會在進度條裡被縮成 48×48 平鋪成一排碎圖——那種要
改掛 `--surface-vignette`（只有 `.stage-frame::before` 消費）。`.pb-chapters::before`
是 theme-agnostic 在 base 層，主題無法只關掉自己那半。詳見 GUIDE §6.33。

另外兩個非 base 契約、但主題可覆寫的 token（宣告在 `progress-bar.css` 的行內
fallback，`base.css` 的 `:root` **沒有**同名宣告，所以寫 `tokens.css` 安全）：

| token | fallback | 作用 |
|---|---|---|
| `--stage-edge` | `rgba(60,40,20,0.15)` | 舞台邊線色；進度條 footer 借用它續接舞台的三面邊 |
| `--stage-drop` | `0 40px 100px rgba(60,40,20,0.22)` | 舞台落影；footer 與舞台共用一坨影子 |

fallback 是 paper-grid 的暖棕。**冷色系主題應該覆寫這兩個**，否則 footer 會掛著
一圈暖棕邊（目前 `dbx-style` / `midnight-press` / `modern-minimal` 都還沒覆寫，
是已知的既有小瑕疵，等有人要修時各加兩行即可）。

## 主題自帶靜態資源（`themes/<id>/assets/`）

主題可以自帶靜態檔（底圖、材質、logo…），放 `themes/<id>/assets/`。
`scripts/scaffold.sh` 套用主題時會**整包複製**到 `<target>/styles/assets/`，並在
切換主題時先清掉上一個主題留下的資產（`rm -rf <target>/styles/assets`）。
沒有 `assets/` 的主題不受任何影響（清一個不存在的目錄是 no-op）。

主題 CSS 用**相對路徑**引用：

```css
--mi-art-far: url("./assets/mi-far.webp");
```

**為什麼相對路徑兩邊都成立**：Vite 解析 CSS `url()` 是以「該 CSS 檔自己的實體
路徑」為基準（`UrlRewritePostcssPlugin` 走所有宣告，含自訂屬性宣告）。所以同一行
字面路徑，在 `themes/<id>/tokens.css`（旁邊就是 `assets/`）與被複製後的
`<target>/styles/tokens.css`（旁邊也是 `assets/`）都解析得到。dev、`npm run build`、
`slidev export` 三種模式皆然（export 走的也是 dev server 路徑）。

慣例：

- **`url()` 只寫在 `tokens.css`**（收成幾個 `--xxx-art-*` 變數），`extras.css` 只引用
  變數——資產依賴集中一處，好稽核。
- **放 `styles/assets/`，不要新建 `public/`。** 走模組圖的好處是 **fail-loud**：
  資產漏了 `npm run build` 直接報 `Failed to resolve`，而 `public/` 只會靜默 404。
  清理面積也小（只動一個目錄，不會誤刪使用者自己放在 `public/` 的東西），且天然
  帶 base 前綴與 hash。
- **使用者換自己的圖 = 覆蓋 `<target>/styles/assets/` 的同名檔**，不必動 CSS。但要
  知道那是 scaffold 的產物，**重跑 scaffold 會被蓋掉**（與 `tokens.css`/`extras.css`
  同規則）；要永久化就放進自己的 `themes/<id>/assets/`。
- 資產會隨 `npx skills add` 分發，**控制體積**（`mountain-ink` 的三張 1920×1080
  WebP 合計 &lt;25KB）。

## 新增主題

1. 挑一個最接近目標氣質的主題資料夾複製當起點（`cp -r themes/paper-grid themes/my-theme` 或從 `dbx-style` 起手如果目標是「無選擇器層覆寫」——`dbx-style` 的 `extras.css` 仍可能需要一個 `:root` 區塊放理由二那批性格旋鈕覆寫，見下）。
2. 改 `tokens.css`：調色板 → 字體 → 性格旋鈕 → 裝飾。**先窮盡 token 插槽的可能性，想不到才加 `extras.css`。**
3. **逐一檢查你想覆蓋的性格旋鈕，是不是上面「可選的性格覆蓋」表格裡標 † 的那 13 個屬性**
   （`--r-card`、`--rule-w`、`--rule-style`、`--dur-base`/`--dur-slow`/
   `--dur-cinematic`、`--hero-num-*`、`--stage-pad-x`/`--stage-pad-y`、
   `--shadow-stage`）。如果是，覆寫要寫進 `extras.css` 的 `:root` 區
   塊，不能寫進 `tokens.css`——否則會被 `base.css` 的預設值悄悄蓋掉。
   **不要只憑肉眼看 `tokens.css` 源碼就判斷「應該生效了」**：跑一次
   `npm run build`，grep 建出來的 `dist/assets/*.css` 確認該屬性最後
   一次出現的值就是你要的值，這一步做完才算新主題完成。
4. 改 `theme.json`：`id` 必須等於目錄名，**別漏 `colorSchema`**（scaffold 靠它 patch
   `slides.md` headmatter；深色主題漏填會讓 Slidev chrome 白底白 icon，見 GUIDE §6.30）。
5. **若主題要掛整張插畫底圖**：掛 `--surface-vignette`（不是 `--surface-pattern`——
   那組被底部進度條共用），並在 `extras.css` 加
   `.stage-frame::before { z-index: -1 }`（否則裝飾層會蓋在扉頁大標之上）。
   完整原理與三段氣壓的 `class:` 切換法見 GUIDE §6.33；資產放法見上面
   「主題自帶靜態資源」。
6. **冷色系主題順手覆寫 `--stage-edge` / `--stage-drop`**，否則底部進度條 footer
   會掛著 paper-grid 的暖棕邊與落影（見「可選的裝飾層」末段）。
7. 用 `scripts/scaffold.sh <暫存目錄> --theme=my-theme` 套用，`npm run dev` 過一遍所有章節，用 `npm run export`（逐頁逐拍 PNG）＋ `npm run snap-sweep` 截圖檢查。
   **用了 `mask` / `clip-path` / `mix-blend-mode` 這類會影響合成的效果，就連跑兩次
   export 並 `compare -metric AE` 逐張比對**（全 0 才算穩定；不為 0 或出現白框就
   換成 inline SVG data-uri，那條路徑走一般 image 解碼、dev/export 必然一致——
   `mountain-ink` 的 `.v-enso` 就是為此從 conic+mask 改成 SVG 的）。
8. 在本文件「內建主題」表格加一行，**並且改 repo 根 `README.md` 的 `themes/` 那一列**
   （`modern-minimal` 當初就漏了這兩處，補登記時才發現）。

## 反模式

- 章節 CSS 硬編碼 hex 顏色/字體名稱——缺哪個語義就在契約裡補一個 token。
- 演示中途切換主題。
- 第二個飽和 accent 色——只能有一個，`--accent-glow`/`--accent-soft` 永遠跟 `--accent` 同色相。
- 在元件層 override 主題 token——只在 `:root` 裡覆蓋。
- 依賴主題的章節條件分支（TSX 裡判斷目前是哪個主題）。
- `extras.css` 裡塞可以用 token 做到的效果（見上面「`extras.css` 反模式」一節）。
- 把 `--r-card`/`--rule-w`/`--rule-style`/`--dur-*`/`--hero-num-*`/`--stage-pad-*`/`--shadow-stage` 這類 `base.css` 也有 `:root` 預設值的屬性寫進 `tokens.css`——只憑源碼檢查看不出來會被蓋掉，務必用真實 build 輸出核對。
