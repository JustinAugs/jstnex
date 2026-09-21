import Badge from "./ui/Badge";

/*
  DemoBadge — 「演示数据」标签

  总控 Prompt 的硬性要求：只要是模拟数据，必须明确标记，
  不能把虚构数字伪装成实时数据。做成组件后全站复用，标签文字跟着语言变。

  外观交给 Design System 的 Badge，这里只负责语义。
*/
type DemoBadgeProps = {
  label: string; // 由调用方传入当前语言的 "Demo Data" / "演示数据"
};

export default function DemoBadge({ label }: DemoBadgeProps) {
  return <Badge>{label}</Badge>;
}
