import { CardLink, CardAction } from "./ui/Card";

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
    <CardLink href={href} className="flex h-full flex-col">
      <h3 className="text-h3 text-ink">{title}</h3>

      <p className="mt-3 flex-1 text-body text-mist">{summary}</p>

      <div className="mt-6">
        <CardAction label={readLabel} />
      </div>
    </CardLink>
  );
}
