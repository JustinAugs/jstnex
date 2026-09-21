import { CardLink, CardAction } from "../ui/Card";

/*
  ToolCard — 一个供应链计算器的入口卡

  公式直接用 font-mono（等宽字体）显示出来：
  专业、透明，也提醒用户这不是黑盒。

  注意：工具名这里用 text-body 而不是 text-h3 —— 工具区是四列密排布局，
  标题放大反而会让「Safety Stock Calculator」换行、卡片变高，显得不整齐。
*/
type ToolCardProps = {
  name: string;
  description: string;
  formula: string;
  openLabel: string; // "Open" / "打开"
  /*
    href 由调用方决定：首页跳到 /tools，将来 Tools 页面跳到该计算器本体。
    同一个组件因此能在两个地方复用。
  */
  href: string;
};

export default function ToolCard({
  name,
  description,
  formula,
  openLabel,
  href,
}: ToolCardProps) {
  return (
    <CardLink href={href} className="flex h-full flex-col">
      <h3 className="text-body font-semibold text-ink">{name}</h3>

      <p className="mt-2 text-small text-mist">{description}</p>

      <p className="mt-5 border-t border-line pt-4 font-mono text-caption text-deep">
        {formula}
      </p>

      <div className="mt-5">
        <CardAction label={openLabel} />
      </div>
    </CardLink>
  );
}
