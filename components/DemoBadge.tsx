/*
  DemoBadge — 演示数据标签

  总控 Prompt 第四十一条：只要是模拟数据，必须明确标记 Demo Data，
  不能把虚构数字伪装成实时数据。
  做成组件的好处：以后任何页面要标，直接引入就行，写法统一。
*/
export default function DemoBadge() {
  return (
    <span className="border border-line px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-mist uppercase">
      Demo Data
    </span>
  );
}
