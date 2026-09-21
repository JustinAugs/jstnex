/*
  Button — 全站统一的按钮样式（TASK 02.6 Design System）

  为什么要有这个文件？
  以前 Hero 里直接写了一长串 className。等以后 Tools 计算器页面、
  Global 搜索页面也要按钮时，同样的样式会被复制很多遍，改一次要改 N 处。
  现在按钮只在这里定义一次。

  三种外观（variant）：
    primary    深蓝实心 —— 页面上最重要的那个动作
    secondary  黑框空心 —— 次重要的动作
    ghost      纯文字   —— 弱化动作（比如 Footer 里的链接）

  两种尺寸（size）：
    sm  小按钮
    md  常规按钮

  状态都统一处理：hover（悬停）/ focus（键盘聚焦）/ disabled（禁用）。
  动画只用颜色过渡，克制，不做弹跳或位移。
*/

import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

// 所有按钮共有的骨架：横向布局、居中、字距、过渡、禁用态
const BASE =
  "inline-flex items-center justify-center font-medium uppercase tracking-label transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-deep text-white hover:bg-deep-hover",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-white",
  ghost: "text-mist hover:text-deep",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-caption",
  md: "px-6 py-3 text-small",
};

type StyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/*
  buttonStyles —— 只拼出 className，不渲染任何元素。
  用处：想把别的东西（比如某个卡片）打扮成按钮样子时用。
*/
export function buttonStyles({
  variant = "primary",
  size = "md",
  className = "",
}: StyleOptions = {}) {
  return [BASE, VARIANTS[variant], SIZES[size], className]
    .filter(Boolean)
    .join(" ");
}

/* Button —— 真正的 <button>，用于提交表单、触发动作 */
export function Button({
  variant,
  size,
  className,
  ...rest
}: StyleOptions & ComponentProps<"button">) {
  return <button className={buttonStyles({ variant, size, className })} {...rest} />;
}

/* ButtonLink —— 长得像按钮的链接，用于页面跳转 */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...rest
}: StyleOptions & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
