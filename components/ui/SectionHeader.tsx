import type { ReactNode } from "react";

/*
  SectionHeader — 全站统一的区块标题（TASK 02.7 Component System）

  四样东西，全部可选（但至少要给 eyebrow 或 title）：
    eyebrow       上方的小标签，例如 GLOBAL SNAPSHOT
    title         区块主标题
    description   一句话说明
    action        右上角放的东西，例如「Demo Data」标签、一个「查看全部」链接
    headingLevel  标题的语义层级：默认 "h2"（区块标题）；
                  页面级用法（Global / Companies / Supply Chain / Tools 的
                  页面主标题）传 "h1"——这些页面此前没有 <h1>，搜索引擎和
                  屏幕阅读器都拿不到页面主标题信号（TASK 07.02 G-01）。
                  注意：无论 h1 还是 h2，视觉字号都是 text-h2，只有语义变化。

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
  headingLevel?: "h1" | "h2";
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  headingLevel = "h2",
}: SectionHeaderProps) {
  // 动态标签：h1 只给「页面唯一主标题」用，其余区块一律 h2。
  // 视觉完全相同（text-h2），改的只是 HTML 语义。
  const Heading = headingLevel === "h1" ? "h1" : "h2";
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* 左上角那道细横线是 JSTNEX 区块的标志 */}
        <div className="border-t border-ink pt-6">
          {eyebrow && (
            <p className="font-medium tracking-label text-caption text-mist uppercase">
              {eyebrow}
            </p>
          )}
          {title && <Heading className="mt-3 text-h2 text-ink">{title}</Heading>}
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
