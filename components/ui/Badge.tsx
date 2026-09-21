/*
  Badge — 全站统一的角标 / 小标签（TASK 02.6 Design System）

  目前用在 Demo Data（演示数据）标记上，
  以后 Companies 页面的行业标签、Global 页面的地区标签也用它。

  外观统一：细边框 + 全大写小字 + 统一字距（tracking-label）。
  不用圆角彩色药丸，保持克制的数据平台气质。
*/

import type { ReactNode } from "react";

type BadgeTone = "neutral" | "accent";

const BASE =
  "inline-flex items-center border px-3 py-1 font-medium tracking-label uppercase text-caption";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-line text-mist",
  accent: "border-deep text-deep",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export default function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span className={[BASE, TONES[tone], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
