/*
  区块标题：全站统一的小标题 + 大标题样式。
  props（属性）就是「调用这个组件时传进来的参数」。
*/
type SectionHeadingProps = {
  eyebrow: string; // 上方的小字，例如 GLOBAL SNAPSHOT
  title: string; // 主标题
  description?: string; // 可选的一句说明
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 border-t border-ink pt-6">
      <p className="text-xs font-medium tracking-[0.3em] text-mist uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink md:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
          {description}
        </p>
      )}
    </div>
  );
}
