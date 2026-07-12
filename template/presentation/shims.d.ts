import type { Tooltip } from "floating-vue";

declare module "vue" {
  export interface GlobalComponents {
    VTooltip: typeof Tooltip;
  }
}
