import Link from "next/link";

/*
  NetworkCard — Global Network 区块的一张卡片（Trade / Logistics / Networks）

  整张卡片就是一个 Link，所以点哪里都能跳转。
  group-hover 的意思：鼠标悬停在「整张卡片」上时，让内部的箭头变长。
  （group 标在父元素上，group-hover: 标在子元素上，这是 Tailwind 的常用写法。）
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
    <Link
      href={href}
      className="group flex h-full flex-col justify-between border border-line p-6 transition-colors hover:border-ink hover:bg-surface"
    >
      <div>
        <h3 className="text-base font-semibold tracking-[0.18em] text-ink uppercase">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          {description}
        </p>
      </div>

      {/* 箭头用一根横线表示，hover 时变长 —— 不引入图标库，保持克制 */}
      <span className="mt-8 flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-deep uppercase">
        {exploreLabel}
        <span
          aria-hidden
          className="h-px w-5 bg-deep transition-all group-hover:w-9"
        />
      </span>
    </Link>
  );
}
