import { Card, CardLink } from "../ui/Card";
import Badge from "../ui/Badge";
// 字段名 + 内容这一行，与 CountryCard / ConceptCard 共用同一个原语（TASK 04 提炼）
import Field from "../ui/Field";

/*
  CompanyCard — Companies 页面的一张企业卡（TASK 05）

  设计约定（和其他卡片一致）：
  这张卡「很笨」—— 它只接收已经翻译好的字符串，自己不知道当前是什么语言。
  翻译由页面做（页面调用 useLanguage + pick），卡片将来搬到别处或改成服务端渲染都不用改。

  信息的轻重顺序是刻意排的（指令 §11）：
    公司名 → 行业 → 供应链角色 → 所在地 → 简介 → 关键活动 → 优势 → 风险
  前几项让人一眼知道「这是谁、干什么、在哪」，后面几项才展开供应链视角的细节。

  为什么默认不可点击？
  因为 TASK 05 明确不做 /companies/[slug] 企业详情页。
  没有目标页面就不要做成可点击的样子 —— 点了进不去比不能点更糟。

  那 href 为什么还留着？
  首页的 Companies 区块原本就让卡片跳到 /companies（一个真实存在的页面）。
  为了不改动首页既有行为，这里保留一个可选的 href：传了才变可点击。
  Companies 页面本身不传 —— 那一页的卡片就是不可点击的。
*/

type CompanyCardProps = {
  name: string;
  industry: string; // 已翻译好的行业名，例如 半导体
  role: string; // 已翻译好的供应链角色，例如 制造商
  country: string; // 已翻译好的国家 / 地区名
  region: string; // 已翻译好的大区名
  summary: string;
  keyActivities: string[];
  strength: string; // 定性描述，不是评分
  risk: string; // 定性描述，不是评分
  labels: {
    location: string;
    keyActivities: string;
    strength: string;
    risk: string;
  };
  /* 可选。传了整张卡变成链接（首页用它跳 /companies）；不传就是静态卡片。 */
  href?: string;
};

export default function CompanyCard({
  name,
  industry,
  role,
  country,
  region,
  summary,
  keyActivities,
  strength,
  risk,
  labels,
  href,
}: CompanyCardProps) {
  const content = (
    <>
      {/* 第一行：行业 + 供应链角色。角色用 accent（深蓝）—— 品牌规范里深蓝可用于数据高亮 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{industry}</Badge>
        <Badge tone="accent">{role}</Badge>
      </div>

      <h3 className="mt-4 text-h3 text-ink">{name}</h3>

      <p className="mt-4 text-small text-mist">{summary}</p>

      <dl className="mt-6">
        <Field label={labels.location}>
          {country} · {region}
        </Field>

        <Field label={labels.keyActivities}>
          {keyActivities.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4">
              {keyActivities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          ) : null}
        </Field>

        <Field label={labels.strength}>{strength}</Field>
        <Field label={labels.risk}>{risk}</Field>
      </dl>
    </>
  );

  // 传了 href 才用可点击外壳，否则就是一张普通卡片
  return href ? (
    <CardLink href={href} className="flex flex-col">
      {content}
    </CardLink>
  ) : (
    <Card className="flex flex-col">{content}</Card>
  );
}
