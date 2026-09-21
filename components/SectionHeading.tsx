/*
  区块标题：全站统一的小标签 + 主标题 + 说明。
  props（属性）就是「调用这个组件时传进来的参数」。

  样式走 Design System 的字号阶梯：
    text-caption  全大写小标签
    text-h2       区块主标题（手机 24px → 桌面 30px，自动过渡）
    text-body     说明文字
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
      <p className="font-medium tracking-[0.3em] text-caption text-mist uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-h2 text-ink">{title}</h2>
      {description && (
        <p className="mt-3 max-w-2xl text-body text-mist">{description}</p>
      )}
    </div>
  );
}
