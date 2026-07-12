/**
 * 型別替身 for "@slidev/client" — tsconfig `paths` 把型別解析指到這裡。
 *
 * Why：@slidev/client 以原始 .ts 發佈（package.json main: ./public.ts），
 * 一旦 import 就把它整包原始碼拉進 vue-tsc 檢查範圍；其原始碼依賴 Vite
 * define 注入的編譯期常數（__DEV__、__SLIDEV_HAS_SERVER__ …）與 slidev
 * monorepo 自己的 tsconfig flags，在本專案 flags 下必炸（其 logic/dark.ts
 * 甚至含在我們 flags 下變 unused 的 @ts-expect-error——兩邊不可能同時滿
 * 足）。skipLibCheck 只管 .d.ts，管不到 .ts，故以 paths 替身隔離。
 *
 * 只宣告本 template 實際用到的 API 面，逐一對照 v52.17.0 原始碼核實：
 *   useNav        → client/composables/useNav.ts（next / isPresenter /
 *                   isPrintMode / slides / currentPage / go 均在
 *                   SlidevContextNav(+State) 介面上，逐欄核對簽名照抄）
 *   useSlideContext → client/context.ts（$frontmatter = injectLocal(...)；
 *                   $nav = toRef(injectLocal($$slidev-context), 'nav')）。
 *   $nav 的型別故意宣告成「currentPage: number；go: 同 useNav().go」而非
 *   ComputedRef<number>：外層 root.ts 用 reactive({ nav: useNav(), ... })
 *   包了一層，reactive() 對巢狀欄位做 ref-unwrap（UnwrapNestedRefs），取過
 *   一次 $nav.value 之後，內部欄位已是拆封的原始值，不必再取第二層
 *   .value——這與 @slidev/client 官方寫法一致（見 client/logic/slides.ts
 *   的 `$nav.value.currentSlideNo`，同一個 unwrap 規則，只取一次 .value）。
 *   用 $nav 而非 useNav() 是因為 internals/PrintSlideClick.vue 在
 *   print/export 模式下用 provideLocal 逐頁重新提供 useFixedNav()，使
 *   $nav 變成 per-page；而 useNav() 是 createSharedComposable 全域單例，
 *   export 同時掛載多頁時全部共用同一顆（永遠停在扉頁），dev 模式下兩者
 *   退化成同一顆、行為不變。
 * SlideRoute（slides 的元素型別）→ @slidev/types dist/index.d.mts：
 *   { no: number; meta: RouteMeta & Required<Pick<RouteMeta,'slide'>>; ... }。
 * RouteMeta.slide 型別 → client/shim-vue.d.ts：
 *   Omit<SlideInfo,'source'> & { noteHTML; filepath; start; sourceIndex; id; no }。
 * SlideInfo 繼承 SlideInfoBase（@slidev/types dist/index.d.mts），其中
 *   frontmatter: Record<string, any> —— 故 s.meta.slide.frontmatter 這條路徑
 *   在 v52 存在，未變。以下 SlideRouteLike 只鏡射用到的欄位（no / meta.slide.
 *   frontmatter），非完整 SlideRoute。
 * 升級 Slidev 時請重新核對。Runtime 不受影響（Vite 不讀 tsconfig paths，
 * 執行期仍載入真正的 @slidev/client）。
 */
import type { ComputedRef, Ref } from "vue";

export interface SlideRouteLike {
  /** 該 slide 在整份簡報中的頁碼（1-based） */
  no: number;
  meta?: {
    slide?: {
      /** 該 slide 的 frontmatter（chapter / chapterTitle 讀這裡） */
      frontmatter?: Record<string, any>;
    };
  };
}

export declare function useNav(): {
  /** 前進一步（下一個 click，或下一頁） */
  next: () => Promise<void>;
  /** 目前是否在 presenter 路由 */
  isPresenter: ComputedRef<boolean>;
  /** print / export 渲染模式 */
  isPrintMode: ComputedRef<boolean>;
  /** 全部 slide route（依序），含 frontmatter */
  slides: Ref<SlideRouteLike[]>;
  /** 目前頁碼（1-based） */
  currentPage: ComputedRef<number>;
  /** 跳到指定頁（可選 clicks / force） */
  go: (no: number | string, clicks?: number, force?: boolean) => Promise<void>;
};

export declare function useSlideContext(): {
  /** 當前 slide 的 frontmatter（layout 讀 chapter / eyebrow 用） */
  $frontmatter: Record<string, any>;
  /**
   * per-instance nav（見上方檔頭說明）：print/export 模式下逐頁不同，
   * dev 模式下退化為 useNav() 的同一顆單例。取過 .value 之後欄位已拆封，
   * 不需要對 currentPage 再取一次 .value。
   */
  $nav: Ref<{
    /** 目前頁碼（1-based），this 份實例對應的那一頁 */
    currentPage: number;
    /** 跳到指定頁（可選 clicks / force）；print/export 模式下為 no-op */
    go: (no: number | string, clicks?: number, force?: boolean) => Promise<void>;
  }>;
};
