/*
  DemoBadge — 「演示数据」标签

  总控 Prompt 的硬性要求：只要是模拟数据，必须明确标记，
  不能把虚构数字伪装成实时数据。做成组件后全站复用，标签文字跟着语言变。
*/
type DemoBadgeProps = {
  label: string; // 由调用方传入当前语言的 "Demo Data" / "演示数据"
};

export default function DemoBadge({ label }: DemoBadgeProps) {
  return (
    <span className="border border-line px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-mist uppercase">
      {label}
    </span>
  );
}
