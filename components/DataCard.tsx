import { cardStyles } from "./ui/Card";

/*
  DataCard — 首页 Global Snapshot 的一张数据卡（静态，不可点击）

  它是静态展示，所以用 tone="surface"（极浅灰底）和可点击卡片区分开。
  数字用深蓝 —— 对应品牌规范里深蓝的四种允许用法之一：数据高亮。
*/
type DataCardProps = {
  label: string; // 指标名称，例如 GLOBAL TRADE
  value: string; // 数值，例如 24.0
  unit?: string; // 单位，例如 T / M TEU
  note?: string; // 一句话补充说明
};

export default function DataCard({ label, value, unit, note }: DataCardProps) {
  return (
    <div className={cardStyles({ tone: "surface" })}>
      <p className="font-medium tracking-label text-caption text-mist uppercase">
        {label}
      </p>
      {/* 数字是数据平台的重点，所以字号最大、用深蓝做高亮 */}
      <p className="mt-4 text-h1 text-deep">
        {value}
        {unit && <span className="ml-1 text-body font-medium">{unit}</span>}
      </p>
      {note && <p className="mt-3 text-small text-mist">{note}</p>}
    </div>
  );
}
