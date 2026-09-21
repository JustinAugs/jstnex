import { CardLink, CardAction } from "./ui/Card";

/*
  NetworkCard — Global Network 区块的一张卡片（Trade / Logistics / Networks）

  CardLink 内部用的是 Next.js 的 Link：整张卡点哪都能跳转，
  而且是站内快速跳转（不整页刷新）。卡片边框、hover 样式统一由它负责。
*/
type NetworkCardProps = {
  title: string;
  description: string;
  href: string;
  exploreLabel: string; // "Explore" / "查看"
};

export default function NetworkCard({
  title,
  description,
  href,
  exploreLabel,
}: NetworkCardProps) {
  return (
    <CardLink href={href} className="flex h-full flex-col justify-between">
      <div>
        <h3 className="tracking-label text-h3 text-ink uppercase">{title}</h3>
        <p className="mt-3 text-body text-mist">{description}</p>
      </div>

      <div className="mt-8">
        <CardAction label={exploreLabel} />
      </div>
    </CardLink>
  );
}
