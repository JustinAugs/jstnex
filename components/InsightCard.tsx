import Link from "next/link";

/*
  InsightCard — Supply Chain Insights 的一张内容卡

  flex-1 加在摘要上：让摘要把中间空间撑开，
  这样同一行里几张卡片高度不同时，底部的 Read 也能对齐。
*/
type InsightCardProps = {
  title: string;
  summary: string;
  href: string;
  readLabel: string; // "Read" / "阅读"
};

export default function InsightCard({
  title,
  summary,
  href,
  readLabel,
}: InsightCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-line p-6 transition-colors hover:border-ink hover:bg-surface"
    >
      <h3 className="text-base leading-snug font-semibold text-ink">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">
        {summary}
      </p>

      <span className="mt-6 flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-deep uppercase">
        {readLabel}
        <span
          aria-hidden
          className="h-px w-5 bg-deep transition-all group-hover:w-9"
        />
      </span>
    </Link>
  );
}
