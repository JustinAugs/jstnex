import { CardLink } from "../ui/Card";

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
  /*
    href 由调用方决定，而不是写死在组件里：
    首页用它跳到 /companies，将来 Companies 页面用它跳到某家公司的详情页。
    同一个组件因此能在两个地方复用。
  */
  href: string;
};

export default function CompanyCard({
  name,
  sector,
  focus,
  supplyChainModel,
  modelLabel,
  href,
}: CompanyCardProps) {
  return (
    <CardLink href={href} className="flex h-full flex-col">
      <p className="font-medium tracking-label text-caption text-mist uppercase">
        {sector}
      </p>

      <h3 className="mt-3 text-h3 text-ink">{name}</h3>

      <p className="mt-2 text-body text-mist">{focus}</p>

      {/* 上半部分讲「它是谁」，下半部分讲「它的供应链怎么运作」 */}
      <div className="mt-5 border-t border-line pt-4">
        <p className="font-medium tracking-label text-caption text-mist uppercase">
          {modelLabel}
        </p>
        <p className="mt-2 text-small text-ink">{supplyChainModel}</p>
      </div>
    </CardLink>
  );
}
