import type { ReactNode } from "react";

/*
  Field —— 卡片里的「字段名 + 内容」一行

  它最早写在 CountryCard 里（TASK 03）。TASK 04 的 ConceptCard 也要用同样的结构，
  与其抄第二遍，不如提到 ui/ 层复用 —— Companies 卡片后来也用上了。

  为什么用 <dl> / <dt> / <dd>？
  因为这在语义上就是「一个术语 + 它的解释」，不是随便两行文字。
  屏幕阅读器读到时会知道这是描述列表，比两个 <p> 更准确。

  注意：它必须放在 <dl> 里面用，first:border-t-0 依赖它是第一个子元素。

  ------------------------------------------------------------------
  TASK 06.8：为什么不再「永远把标签固定在左边」
  ------------------------------------------------------------------
  原来的写法是 dt 固定占 w-28（112px），dd 拿剩下的宽度。
  实测：三列网格下的卡片只有 357px，减去卡片左右内边距 48px、
  标签 112px、两者间距 16px，dd 只剩 179px ——
  一行大概只能放 28 个英文字符，长句子反复换行，
  卡片被撑到 579–746px 高，右半边却是空的。

  现在的做法分两层：

  第一层：容器足够宽时（≥ 28rem / 448px），标签在左、正文在右。
    448 = 112（标签）+ 16（间距）+ 320（能舒服读一段话的最小宽度）
    也就是只有「并排之后正文仍有约 320px」时才值得并排。
    此时 dt 恢复成 w-28，同一张卡里每行的正文左边缘是对齐的。

  第二层：容器不够宽时（也就是现在绝大多数卡片的情况），
    交给 flex-wrap 按「这一行的标签和正文各有多长」自己决定：
      · 标签短 + 正文短（并排后正文仍有 ≥12rem）→ 保持并排，不浪费标签那一行
      · 标签长 或 正文长（并排会挤到 <12rem） → 正文落到标签下面，占满整行
    这一步不需要写断点 —— 浏览器算「这一行装不装得下」就够了。
    12rem（192px）来自实测：低于这个宽度，短句也会被压成碎行。

  为什么判据是容器宽度而不是屏幕宽度？
  因为 Field 的可用宽度取决于「这张卡所在的网格是几列」，与屏幕多宽不等价：
  同一台机器上，两列布局的卡片可能 560px，三列布局只有 357px。
  所以用了容器查询（@md: + <dl> 上的 @container），而不是媒体查询（md:）。

  窄栏时为什么给 dt 加 whitespace-nowrap？
  因为一旦宽受限到 112px，"STRUCTURAL STRENGTH" 这类标签会折成两行，
  白占一行高度。不换行 + 宽度随文字，它就永远是一行。
  容器变宽以后会恢复成 w-28 的对齐列（@md:w-28 + @md:whitespace-normal）。
*/
export default function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line py-3 first:border-t-0 first:pt-0 @md:flex-nowrap">
      <dt className="font-medium tracking-label text-caption text-mist uppercase whitespace-nowrap @md:w-28 @md:shrink-0 @md:whitespace-normal @md:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-48 max-w-full grow text-small text-ink @md:flex-1">
        {children}
      </dd>
    </div>
  );
}
