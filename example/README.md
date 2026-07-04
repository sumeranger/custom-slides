# example/ — 去識別化參考章節

這裡的 `01-service-flow/` 是從真實月報去識別化而來的**參考章節**，供開發新章節時
對照閱讀——它扮演的角色等同舊模板裡外部參考 deck 的角色，差別是：它直接 bundle
在這個 skill 裡，不依賴任何人機器上的絕對路徑。

## 這不是一個可獨立執行的 app

`01-service-flow/ServiceFlow.tsx` 從 `../../components/...` 與 `../../registry/types`
匯入，這些路徑只在完整的 presentation 專案樹（`template/presentation/src/...`）下才解
得到。單獨對這個資料夾跑 `tsc` 或建置一定會失敗——這是預期行為，不代表檔案壞掉。

## 這裡示範了什麼

`01-service-flow` 講一個通用情境：使用者觸發「讀取/摘要一份文件」的功能時，資料如何
在兩套系統（一個既有主系統、一個新拆出來的文件 AI 微服務）之間流動、彼此如何互不信任
地簽發短效票證。內容已完全去識別化——不含任何真實公司、產品、內部代號或人名，純粹
作為架構敘事範例。

同時它示範了 paper-grid 章節的幾個慣例，這些是寫新章節時該抄的樣板：

- **`step` 純函數**：`ServiceFlowChapter({ step })` 用 `if (step === N) return (...)`
  逐步 return 對應畫面，不用 class 元件、不用內部 state 存目前步驟。
- **`Term` tooltip**：技術詞（如 `attachmentId`、`sub`）用 `<Term tip={...}>` 包起來，
  hover 才顯示解釋，正文維持乾淨。
- **逐步揭示（step-by-step reveal）**：每個 step 只呈現該步驟需要的資訊，靠切換 step
  推進敘事，而非一次全部攤開。
- **CSS 動畫 + class 前綴**：`ServiceFlow.css` 全部用 `.da-` 前綴命名，搭配
  `@keyframes da-rise` / `da-fade` / `da-stamp` 等做進場動畫，`animation-delay`
  控制節奏——這是 paper-grid 章節命名與動畫的標準寫法。
- **`narrations.ts` 與 step 一一對應**：`narrations` 陣列的長度就是章節的步數，
  不另外維護 `totalSteps`，避免口播稿、逐步 UI、audio pipeline 三邊漂移。

## 如果你想實際跑跑看

把它接進模板的 presentation 專案，取代或新增到章節清單：

```bash
cp -r example/01-service-flow <你的 presentation 專案>/src/chapters/01-service-flow
```

然後在 `src/registry/chapters.ts` 註冊（參考模板內建的 `01-example` 寫法）：

```ts
import ServiceFlowChapter from "../chapters/01-service-flow/ServiceFlow";
import { narrations as serviceFlowNarrations } from "../chapters/01-service-flow/narrations";

export const CHAPTERS: ChapterDef[] = [
  {
    id: "service-flow",
    title: "示範：資料流如何在兩套系統之間走",
    narrations: serviceFlowNarrations,
    Component: ServiceFlowChapter,
  },
];
```

視覺樣式（顏色、字體）全部來自當前 theme，章節本身不寫死配色，細節見
`references/GUIDE.md` 與 `template/presentation/src/styles/`。
