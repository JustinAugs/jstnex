/*
  Input — 全站统一的输入框样式（TASK 02.6 Design System）

  V1.0 现在还没有搜索框，但 Global 页面的「Search country...」一定会用到。
  提前把统一样式定好，到时候不用临时凑一套。

  状态：
    默认      浅灰边框 + 灰占位符
    hover     边框加深
    focus     边框变黑 + 深蓝描边（键盘聚焦时清晰可见）
    disabled  底色变浅、不可输入
*/

import type { ComponentProps } from "react";

export default function Input({ className = "", ...rest }: ComponentProps<"input">) {
  return (
    <input
      className={[
        "w-full border border-line bg-white px-4 py-3 text-small text-ink",
        "placeholder:text-mist",
        "transition-colors duration-200 hover:border-mist",
        "focus:border-ink focus:outline-none",
        "disabled:cursor-not-allowed disabled:bg-surface disabled:text-mist",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
