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
 *   useSlideContext → client/context.ts（$frontmatter = injectLocal(...)）
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
};
