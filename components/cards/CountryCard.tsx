import { CardLink } from "../ui/Card";
import Badge from "../ui/Badge";
// 字段名 + 内容这一行，现在统一用 ui/Field（TASK 04 从本文件提炼出去，ConceptCard 也用）
import Field from "../ui/Field";

/*
  CountryCard — Global 页面的一张国家卡

  设计约定（和其他卡片一致）：
  这张卡「很笨」—— 它只接收已经翻译好的字符串，自己不知道当前是什么语言。
  翻译的工作由页面做（页面调用 useLanguage + pick），这样卡片组件
  将来搬到别的地方、或者换成服务端渲染，都不用改。

  TASK 06.12B：外壳从 <Card> 换成 <CardLink>，新增 href。
  之前（TASK 03）没有国家详情子页，所以故意不用 CardLink ——
  没有目标页面就不做可点击的样子，点了没反应比不能点更糟。
  现在 /global/[code] 详情页已建好，卡片可以真实跳转了。

  为什么 ports 是数组而别的字段是字符串？
  港口是「多个并列的事物」，用数组存最自然；
  页面上用 · 连接显示，不做成 pill（屏幕上会太吵）。
*/

type CountryCardProps = {
  code: string; // 国家代码，例如 CN
  href: string; // 详情页链接，例如 /global/cn（由页面传入，不在组件里写死路由）
  name: string;
  region: string; // 已翻译好的地区名，例如 亚洲
  role: string; // 供应链角色，例如 制造中枢
  summary: string; // 两三句简介
  exports: string; // 主要出口品类
  strength: string; // 结构性优势
  risk: string; // 主要脆弱点
  ports: string[]; // 港口名列表（不翻译）
  labels: {
    ports: string;
    exports: string;
    strength: string;
    risk: string;
  };
};

export default function CountryCard({
  code,
  href,
  name,
  region,
  role,
  summary,
  exports,
  strength,
  risk,
  ports,
  labels,
}: CountryCardProps) {
  return (
    <CardLink href={href} className="flex flex-col">
      {/* 第一行：国家代码 + 所属大区 */}
      <div className="flex items-center gap-2">
        <Badge tone="accent">{code}</Badge>
        <Badge>{region}</Badge>
      </div>

      <h3 className="mt-4 text-h3 text-ink">{name}</h3>

      {/* 角色用深蓝 —— 品牌规范里深蓝的四种允许用法之一：数据高亮 */}
      <p className="mt-1 text-small font-medium text-deep">{role}</p>

      <p className="mt-4 text-small text-mist">{summary}</p>

      {/*
        @container 声明一个「容器查询上下文」：
        Field 里的 @md: 判断依据是这个 dl 自己的宽度（也就是卡片内部可用宽度），
        而不是屏幕宽度 —— 卡片有几列、在哪个页面都不会判断错。
      */}
      <dl className="@container mt-6">
        <Field label={labels.ports}>
          {/* join(" · ") 把数组拼成一行，比做成一堆小标签干净 */}
          {ports.join(" · ")}
        </Field>
        <Field label={labels.exports}>{exports}</Field>
        <Field label={labels.strength}>{strength}</Field>
        <Field label={labels.risk}>{risk}</Field>
      </dl>
    </CardLink>
  );
}
