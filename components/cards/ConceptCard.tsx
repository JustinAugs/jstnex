import { Card } from "../ui/Card";
import Badge from "../ui/Badge";
import Field from "../ui/Field";

/*
  ConceptCard — Supply Chain 概念库的一张概念卡（TASK 04）

  和别的卡片一样，这张卡「很笨」：只接收已经翻译好的字符串，
  自己不知道当前是什么语言。翻译由 ConceptLibrary 做（useLanguage + pick）。

  为什么不用 CardLink、整张卡不可点击？
  因为 V1 没有概念详情子页。一个点了没反应的链接，比没有链接更糟。
  将来做了 /supply-chain/[slug]，把外壳从 <Card> 换成 <CardLink> 即可，
  slug 已经在数据里准备好了（concept.id）。

  展示什么、不展示什么：
  数据里还有 summary / source / updatedAt / relatedConcepts 四个字段，
  但这里刻意不全部铺出来 —— 卡片信息过载就没人看了。
    · summary  首页 Insights 已经用过了，概念卡里换成更正式的 definition
    · source   按数据诚实原则，V1 全是 null，所以「有才显示、没有就不显示」
    · relatedConcepts  留给将来的图谱 / 详情页，V1 不渲染
*/
export type ConceptMetricView = {
  name: string;
  formula: string; // 公式与数学符号不翻译
  unit?: string; // 单位与缩写不翻译（DIO / TEU / %）
};

type ConceptCardProps = {
  title: string;
  topic: string; // 已翻译好的主题名
  level: string; // 已翻译好的层级（基础 / 进阶）
  definition: string;
  whyItMatters: string;
  metrics: ConceptMetricView[] | null;
  scorProcess: string | null; // 已翻译好的流程名，没有则传 null
  relatedCountries: string[] | null; // 已翻译好的国家名，没有则传 null
  labels: {
    definition: string;
    whyItMatters: string;
    metrics: string;
    relatedCountries: string;
    scorProcess: string;
  };
};

export default function ConceptCard({
  title,
  topic,
  level,
  definition,
  whyItMatters,
  metrics,
  scorProcess,
  relatedCountries,
  labels,
}: ConceptCardProps) {
  return (
    <Card className="flex h-full flex-col">
      {/* 第一行：主题 + 学习层级 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{topic}</Badge>
        <Badge>{level}</Badge>
      </div>

      <h3 className="mt-4 text-h3 text-ink">{title}</h3>

      {/* 落在 SCOR 的哪个流程 —— 没有就不渲染，不留空行 */}
      {scorProcess ? (
        <p className="mt-2 text-caption text-mist">
          {labels.scorProcess} · {scorProcess}
        </p>
      ) : null}

      {/* @container：让 Field 的并排/堆叠按这个 dl 的实际宽度决定，而不是按屏幕宽度 */}
      <dl className="@container mt-5">
        <Field label={labels.definition}>{definition}</Field>
        <Field label={labels.whyItMatters}>{whyItMatters}</Field>

        {/* 指标：只解释，不计算（计算是 Tools 页的事） */}
        {metrics && metrics.length > 0 ? (
          <Field label={labels.metrics}>
            <ul className="flex flex-col gap-2">
              {metrics.map((metric) => (
                <li key={metric.formula}>
                  <span className="text-ink">{metric.name}</span>
                  <span className="mt-1 block text-mist">
                    {metric.formula}
                    {metric.unit ? ` · ${metric.unit}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Field>
        ) : null}

        {/*
          相关国家：这里刻意只是文字，不做链接。
          Global 页目前没有「按国家筛选/定位」的入口，强行加链接就是死链。
        */}
        {relatedCountries && relatedCountries.length > 0 ? (
          <Field label={labels.relatedCountries}>
            {relatedCountries.join(" · ")}
          </Field>
        ) : null}
      </dl>
    </Card>
  );
}
