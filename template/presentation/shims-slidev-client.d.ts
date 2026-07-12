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
 *                   isPrintMode 均在 SlidevContextNav(+State) 介面上）
 *   useSlideContext → client/context.ts（$frontmatter = injectLocal(...)）
 * 升級 Slidev 時請重新核對。Runtime 不受影響（Vite 不讀 tsconfig paths，
 * 執行期仍載入真正的 @slidev/client）。
 */
import type { ComputedRef } from "vue";

export declare function useNav(): {
  /** 前進一步（下一個 click，或下一頁） */
  next: () => Promise<void>;
  /** 目前是否在 presenter 路由 */
  isPresenter: ComputedRef<boolean>;
  /** print / export 渲染模式 */
  isPrintMode: ComputedRef<boolean>;
};

export declare function useSlideContext(): {
  /** 當前 slide 的 frontmatter（layout 讀 chapter / eyebrow 用） */
  $frontmatter: Record<string, any>;
};
