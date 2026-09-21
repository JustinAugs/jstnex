import type { ReactNode } from "react";

/*
  SectionHeader — 全站统一的区块标题（TASK 02.7 Component System）

  四样东西，全部可选（但至少要给 eyebrow 或 title）：
    eyebrow     上方的小标签，例如 GLOBAL SNAPSHOT
    title       区块主标题
    description 一句话说明
    action      右上角放的东西，例如「Demo Data」标签、一个「查看全部」链接

  为什么要有 action？
  以前首页为了把 Demo Data 标签顶到标题右边，外面套了一层 flex justify-between 的 div。
  但那个标签其实是「标题的一部分」，不该由每个页面自己拼布局。
  现在标题自带右上角插槽，页面只要把它传进来就行。

  样式走 Design System 的字号阶梯：text-caption / text-h2 / text-body。
*/
type SectionHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* 左上角那道细横线是 JSTNEX 区块的标志 */}
        <div className="border-t border-ink pt-6">
          {eyebrow && (
            <p className="font-medium tracking-[0.3em] text-caption text-mist uppercase">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="mt-3 text-h2 text-ink">{title}</h2>}
        </div>

        {/* 有 action 才渲染，没有就不占空间 */}
        {action && <div className="pt-6">{action}</div>}
      </div>

      {description && (
        <p className="mt-4 max-w-2xl text-body text-mist">{description}</p>
      )}
    </div>
  );
}
