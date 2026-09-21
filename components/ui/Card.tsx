/*
  Card — 全站统一的卡片外壳（TASK 02.6 Design System）

  之前五张卡片（DataCard / NetworkCard / InsightCard / CompanyCard / ToolCard）
  各自写了一遍「边框 + 留白 + hover 变色」，是典型的重复代码。
  现在统一到这里，一共四个东西：

    cardStyles()   只拼 className —— 给本身就想用 Link 当外壳的卡片用
    <Card>         渲染一个普通 div 卡片 —— 给静态卡片（如 DataCard）用
    <CardLink>     渲染一个整块可点击的卡片 —— 给 NetworkCard 这类用
    <CardAction>   卡片底部的「Explore —」小字 + 横线箭头

  参数说明：
    tone        "default" = 白底；"surface" = 极浅灰底（静态数据卡用它）
    interactive true 时鼠标悬停边框转黑、底色转浅灰（可点击卡片用它）
*/

import Link from "next/link";
import type { ReactNode } from "react";

type CardTone = "default" | "surface";

const BASE = "border border-line p-6 transition-colors duration-200";

const TONES: Record<CardTone, string> = {
  default: "bg-white",
  surface: "bg-surface",
};

// 可交互卡片才有 hover：鼠标移上去边框变黑、底色微变
const INTERACTIVE = "hover:border-ink hover:bg-surface";

type StyleOptions = {
  tone?: CardTone;
  interactive?: boolean;
  className?: string;
};

/* 拼出卡片的 className。自己写外壳（比如 <Link>）时用这个。 */
export function cardStyles({
  tone = "default",
  interactive = false,
  className = "",
}: StyleOptions = {}) {
  return [BASE, TONES[tone], interactive ? INTERACTIVE : "", className]
    .filter(Boolean)
    .join(" ");
}

/* 静态卡片：不可点击，用来展示信息（如首页的四个数据指标） */
export function Card({
  tone,
  className,
  children,
}: {
  tone?: CardTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cardStyles({ tone, className })}>{children}</div>
  );
}

/* 可点击卡片：整张卡都是一个链接，点哪里都能跳转 */
export function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    // group 是 Tailwind 的关键字：标在外壳上，内部元素就能用 group-hover 响应「整张卡悬停」
    <Link href={href} className={cardStyles({ interactive: true, className: `group ${className ?? ""}` })}>
      {children}
    </Link>
  );
}

/*
  CardAction — 卡片底部的「Explore —」「Read —」「Open —」

  这行原本在三张卡片里各写了一遍，连 group-hover 的都一样。
  抽出来之后，改一次全站生效。

  箭头用一根 1px 的横线表示，悬停时变长 —— 不引入图标库，保持克制。
*/
export function CardAction({ label }: { label: string }) {
  return (
    <span className="mt-auto flex items-center gap-2 font-medium tracking-label text-caption text-deep uppercase">
      {label}
      <span
        aria-hidden
        className="h-px w-5 bg-deep transition-all duration-200 group-hover:w-9"
      />
    </span>
  );
}
