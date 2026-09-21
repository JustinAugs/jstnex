type DataCardProps = {
  label: string; // 指标名称，例如 GLOBAL TRADE
  value: string; // 数值，例如 24.0
  unit?: string; // 单位，例如 T / M TEU
  note?: string; // 一句话补充说明
};

export default function DataCard({ label, value, unit, note }: DataCardProps) {
  return (
    <div className="border border-line bg-surface p-6 transition-colors hover:border-ink">
      <p className="text-xs font-medium tracking-[0.18em] text-mist uppercase">
        {label}
      </p>
      {/* 数字是数据平台的重点，所以字号最大、用深蓝做高亮 */}
      <p className="mt-4 text-3xl font-bold text-deep md:text-4xl">
        {value}
        {unit && <span className="ml-1 text-base font-medium">{unit}</span>}
      </p>
      {note && <p className="mt-3 text-xs leading-relaxed text-mist">{note}</p>}
    </div>
  );
}
