import type { ReactNode } from "react";

/*
  Field —— 卡片里的「字段名 + 内容」一行

  它最早写在 CountryCard 里（TASK 03）。TASK 04 的 ConceptCard 也要用同样的结构，
  与其抄第二遍，不如提到 ui/ 层复用 —— 以后 Companies 卡片大概率还要用。

  为什么用 <dl> / <dt> / <dd>？
  因为这在语义上就是「一个术语 + 它的解释」，不是随便两行文字。
  屏幕阅读器读到时会知道这是描述列表，比两个 <p> 更准确。

  注意：它必须放在 <dl> 里面用，first:border-t-0 依赖它是第一个子元素。
*/
export default function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 border-t border-line py-3 first:border-t-0 first:pt-0">
      <dt className="w-28 shrink-0 pt-0.5 font-medium tracking-label text-caption text-mist uppercase">
        {label}
      </dt>
      <dd className="text-small text-ink">{children}</dd>
    </div>
  );
}
