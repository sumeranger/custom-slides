import { defineAppSetup } from "@slidev/types";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

// Slidev 已於內部 app.use(FloatingVue)（shiki twoslash 帶入），再 use 會被去重；
// 故以直接改 options 的方式註冊自訂 theme（見 spec Phase 0 Findings 補充 1）
FloatingVue.options.themes.term = {
  $extend: "tooltip",
  triggers: ["hover", "focus"],
  delay: { show: 0, hide: 120 },
  distance: 14,
};

export default defineAppSetup(() => {});
