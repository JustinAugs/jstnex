import Link from "next/link";

/*
  CompanyCard — 一家公司的卡片

  结构刻意和「公司百科」不同：
  sector（行业）+ name（公司名）+ focus（主营）+ supplyChainModel（供应链模式）
  最后一块才是重点 —— 从供应链角度理解这家公司怎么组织网络与资产。
*/
type CompanyCardProps = {
  name: string;
  sector: string;
  focus: string;
  supplyChainModel: string;
  modelLabel: string; // "Supply chain model" / "供应链模式"
};

export default function CompanyCard({
  name,
  sector,
  focus,
  supplyChainModel,
  modelLabel,
}: CompanyCardProps) {
  return (
    <Link
      href="/companies"
      className="flex h-full flex-col border border-line p-6 transition-colors hover:border-ink hover:bg-surface"
    >
      <p className="text-[11px] font-medium tracking-[0.18em] text-mist uppercase">
        {sector}
      </p>

      <h3 className="mt-3 text-lg font-semibold text-ink">{name}</h3>

      <p className="mt-2 text-sm leading-relaxed text-mist">{focus}</p>

      {/* 上半部分讲「它是谁」，下半部分讲「它的供应链怎么运作」 */}
      <div className="mt-5 border-t border-line pt-4">
        <p className="text-[11px] font-medium tracking-[0.18em] text-mist uppercase">
          {modelLabel}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink">
          {supplyChainModel}
        </p>
      </div>
    </Link>
  );
}
