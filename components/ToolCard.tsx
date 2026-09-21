import Link from "next/link";

/*
  ToolCard — 一个供应链计算器的入口卡

  公式直接用 font-mono（等宽字体）显示出来：
  专业、透明，也提醒用户这不是黑盒。
*/
type ToolCardProps = {
  name: string;
  description: string;
  formula: string;
};

export default function ToolCard({
  name,
  description,
  formula,
}: ToolCardProps) {
  return (
    <Link
      href="/tools"
      className="group flex h-full flex-col border border-line p-6 transition-colors hover:border-ink hover:bg-surface"
    >
      <h3 className="text-sm font-semibold text-ink">{name}</h3>

      <p className="mt-2 text-xs leading-relaxed text-mist">{description}</p>

      <p className="mt-5 border-t border-line pt-4 font-mono text-xs text-deep">
        {formula}
      </p>

      <span className="mt-5 flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-deep uppercase">
        Open
        <span
          aria-hidden
          className="h-px w-4 bg-deep transition-all group-hover:w-8"
        />
      </span>
    </Link>
  );
}
