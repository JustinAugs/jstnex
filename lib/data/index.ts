/*
  lib/data/index.ts — 数据加载层

  这一层只做一件事：把 data/*.json 读进来，套上类型，再导出给页面用。

  为什么不让页面直接 import JSON？
  因为 JSON 没有类型保护，页面中途拼错字段名编译器管不了。
  多这一层（虽然只有十几行）换来的是：写错字段立刻报错。

  未来怎么换成 Python + PostgreSQL？
  只要把下面的 import xxxJson 换成 await fetch("...") 拿到的同形状数据即可，
  页面组件完全不用改 —— 这就是 UI 与数据分离的意义。

  注意：JSON 里不写注释，所以每个数据文件的说明放在这里的注释中。
*/

import snapshotJson from "@/data/snapshot.json";
import networksJson from "@/data/networks.json";
import conceptsJson from "@/data/concepts.json";
import topicsJson from "@/data/supply-chain-topics.json";
import scorProcessesJson from "@/data/scor-processes.json";
import companiesJson from "@/data/companies.json";
import calculatorsJson from "@/data/calculators.json";
import countriesJson from "@/data/countries.json";

import { formulaFor } from "@/lib/formulas";

/*
  TASK 08.01：受控词表的运行时清单来自 ./enums（单一来源）。

  这里把三个 allowlist 用 ALL_ 前缀导入，是为了和下面「数据里实际出现过的值」
  区分开 —— 后者才是页面筛选按钮要用的（不能凭空显示一个点进去 0 结果的分类）：

      ALL_INDUSTRIES   8 个合法行业（词表全集）
      INDUSTRIES       这 8 个里，companies.json 真正用到的那些

  两者名字相近但职责不同，所以刻意用前缀拉开。
*/
import {
  REGIONS as ALL_REGIONS,
  INDUSTRIES as ALL_INDUSTRIES,
  SUPPLY_CHAIN_ROLES as ALL_ROLES,
} from "./enums";

import type {
  SnapshotItem,
  NetworkModule,
  Concept,
  ConceptLevel,
  ConceptMetric,
  ConceptMetricRaw,
  Topic,
  ScorProcess,
  Company,
  IndustryId,
  SupplyChainRoleId,
  Region,
  Provenance,
  ProvenanceKind,
  CalculatorMeta,
  Tool,
  Country,
} from "./types";

/*
  演示数据说明（重要）：
  snapshot.json 里的数字是示例值，不是实时统计。
  每一项自带 note 写明 "Sample figure — not a live statistic"，
  页面上还会统一挂 Demo Data 标签，绝不让读者误以为是真实数据。
*/
export const SNAPSHOT: SnapshotItem[] = snapshotJson;

/** Global Network 的三个入口模块 */
export const NETWORK_MODULES: NetworkModule[] = networksJson;

/*
  Supply Chain 知识库（TASK 04）。

  这里是「唯一的知识源」：Supply Chain 页读它，首页 Insights 区块也读它
  （取 featured = true 的那几条）。以前那份 insights.json 已删除 ——
  同一份内容留两份，迟早会不同步。
*/
/*
  为什么这里要写 as Concept[]？
  JSON 文件里 "level": "fundamental" 只会被推断成普通的 string，
  而我们需要它是 "fundamental" | "intermediate" | "advanced" 这个联合类型，
  TypeScript 自己收窄不了，只能在这里断言一次。

  代价要清楚：断言之后，如果 JSON 里写错成 "basic"，编译器不再报错。
  所以 level 的取值请对照 lib/data/enums.ts 里的 CONCEPT_LEVELS。
*/
/*
  TASK 06：概念里的「计算器指标」不再手写公式字符串，
  而是写 formulaId；这里统一从 lib/formulas.ts 回填 formula。

  为什么要多一层 enrich？
  因为 ConceptCard / ConceptLibrary 仍然只认 { name, formula, unit }。
  在加载层把 Raw 形状补全成公开形状，组件一行都不用改。
*/
/*
  TASK 08.01：Concept 原来的 `source` / `updatedAt` 已合并成一个 `provenance`
  （定义见 lib/data/provenance.ts）。但 concepts.json 里这两个旧字段还在
  —— 14 条全是 null，本任务按「优先不改数据文件」的原则不动它。

  所以这里把旧字段声明成「只允许 null」：
    · 现在数据合规，编译通过；
    · 哪天有人往里面填了真实值，类型立刻报错，提醒他改用 provenance，
      而不是让旧字段悄悄复活、变成第二套并存的溯源结构。
*/
type ConceptRaw = Omit<Concept, "metrics"> & {
  metrics: ConceptMetricRaw[] | null;
  source?: null;
  updatedAt?: null;
};

function enrichConcept(concept: ConceptRaw): Concept {
  if (!concept.metrics) {
    return { ...concept, metrics: null };
  }

  return {
    ...concept,
    metrics: concept.metrics.map((metric) => {
      if (!metric.formulaId) {
        if (!metric.formula) {
          throw new Error(
            `Concept metric "${metric.name.en}" has neither formula nor formulaId.`,
          );
        }

        return {
          name: metric.name,
          formula: metric.formula,
          unit: metric.unit,
        };
      }

      const formula = formulaFor(metric.formulaId);

      return {
        name: metric.name,
        formula: formula.expression,
        unit: metric.unit ?? formula.resultUnit,
      };
    }),
  };
}

export const CONCEPTS: Concept[] = (conceptsJson as ConceptRaw[]).map(
  enrichConcept,
);

/** 知识库的 7 个主题（库存 / 运输 / 采购 …） */
export const TOPICS: Topic[] = topicsJson;

/** SCOR Digital Standard 的 7 个流程 */
export const SCOR_PROCESSES: ScorProcess[] = scorProcessesJson;

/** 首页 Insights 区块展示的概念（featured），与 Supply Chain 页同源 */
export function featuredConcepts(): Concept[] {
  return CONCEPTS.filter((concept) => concept.featured);
}

/* 主题筛选按钮上显示的个数 —— 一律从数据算出来，不手写死数字 */
export function countConceptsByTopic(topicId: string): number {
  return CONCEPTS.filter((concept) => concept.topicId === topicId).length;
}

/** 按主题 id 取出显示名（找不到就退回 id，避免页面直接把内部 id 暴露给用户） */
export function topicName(topicId: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === topicId);
}

/*
  Companies（TASK 05）。

  为什么这里要写 as Company[]？和 CONCEPTS 同一个原因：
  JSON 里的 "industry": "technology" 只会被推断成普通的 string，
  而我们需要它是 IndustryId 这个联合类型，TypeScript 自己收窄不了，只能断言一次。

  代价要清楚：断言之后，如果 JSON 里写错成 "tech"，编译器不再报错。
  所以 industry / role / region 的取值请对照 lib/data/enums.ts
  （TASK 08.02 会加一个运行时校验脚本，专门补上断言丢掉的这层检查）。
*/
export const COMPANIES: Company[] = companiesJson as Company[];

/*
  行业 / 角色 / 大区的筛选清单：
  只保留数据里真实出现过的项 —— 这样以后往 companies.json 加一家新行业的公司，
  按钮会自动多出来，而不会凭空显示一个点进去 0 结果的分类。

  顺序来自 ./enums 的 allowlist（TASK 08.01 之前的 INDUSTRY_ORDER / ROLE_ORDER
  就是手工抄了一遍同样 8 项、7 项，属于同一份清单的第二份来源，已删除）。
*/
export const INDUSTRIES: IndustryId[] = ALL_INDUSTRIES.filter((id) =>
  COMPANIES.some((company) => company.industry === id),
);

export const COMPANY_ROLES: SupplyChainRoleId[] = ALL_ROLES.filter((id) =>
  COMPANIES.some((company) => company.role === id),
);

/* 大区顺序来自 ./enums 的 REGIONS（TASK 08.01 之前是这里手写字面量，已删除） */
export const COMPANY_REGIONS: Region[] = ALL_REGIONS.filter((region) =>
  COMPANIES.some((company) => company.region === region),
);

/* 筛选按钮上的个数 —— 一律从数据算出来，绝不手写死数字 */
export function countCompaniesByIndustry(industry: IndustryId): number {
  return COMPANIES.filter((company) => company.industry === industry).length;
}

export function countCompaniesByRole(role: SupplyChainRoleId): number {
  return COMPANIES.filter((company) => company.role === role).length;
}

export function countCompaniesByRegion(region: Region): number {
  return COMPANIES.filter((company) => company.region === region).length;
}

/*
  Tools（TASK 06）。

  data/calculators.json 是唯一的计算器数据集：只写 formulaId + 标题 + 简介 + 顺序。
  公式、输入字段、单位全部来自 lib/formulas.ts —— 不再有第二份公式字符串。

  为什么这里要写 as CalculatorMeta[]？
  和 CONCEPTS / COMPANIES 一样：JSON 里的 "formulaId": "eoq" 只会推断成 string，
  收窄不到 FormulaId。断言一次，代价是写错 id 编译器不再报错 ——
  所以 formulaFor() 在运行时还会再检查一次，写错会直接抛错，绝不静默失败。
*/
export const CALCULATORS: CalculatorMeta[] = [
  ...(calculatorsJson as CalculatorMeta[]),
].sort((a, b) => a.order - b.order);

/*
  首页 ToolCard 仍然读 TOOLS（为了不修改已完成的首页）。
  但 TOOLS 现在是从 CALCULATORS + FORMULAS 派生出来的视图，不是第二份数据：
  首页和 /tools 永远读同一份 calculators.json、同一条公式。
*/
export const TOOLS: Tool[] = CALCULATORS.map((calculator) => ({
  name: calculator.title,
  description: calculator.summary,
  formula: formulaFor(calculator.formulaId).expression,
  href: "/tools",
}));

/** Global 页面的国家列表（TASK 03：每个国家 9 个字段 + 可选 provenance） */
export const COUNTRIES: Country[] = countriesJson as Country[];

/*
  大区的英文值（"Asia" / "Europe" / "North America"）只是一把钥匙，
  真正显示给用户的大区名放在字典里（见 en.ts 的 regions —— TASK 05 起由 Global 与
  Companies 共用，所以不再放在 global 段内）。
  这个函数负责把「数据里的英文值」翻译成「字典的字段名」。
*/
export type RegionKey = "asia" | "europe" | "northAmerica";

/*
  TASK 08.01：改成穷尽 switch，不再有「兜底算亚洲」的分支。

  以前是 if / if / return "asia" —— 于是 "Africa"、拼错的 "Aisa"、甚至空字符串
  都会被当成亚洲显示出来。筛选按钮和卡片都拿这个结果去查字典，
  页面看起来一切正常，只是地区名错了，没有任何报错。这是最难发现的一类错。

  现在：
    · 参数类型是 `Region`（联合类型），传进未知字符串编译就过不去；
    · `default` 分支把 region 赋给 `never` —— 往 REGIONS 里加一个地区却忘了
      在这里处理，编译立刻失败；
    · 万一运行时真的收到脏数据（JSON 被手改、未来接口返回异常值），
      抛错而不是伪装成一个合法地区 —— 宁可整页报错，也不要静默显示错的地区名。
*/
export function regionKey(region: Region): RegionKey {
  switch (region) {
    case "Asia":
      return "asia";
    case "Europe":
      return "europe";
    case "North America":
      return "northAmerica";
    default: {
      // 编译期检查：新增地区若未处理，下面这行会报错（Region 不能赋给 never）
      const unhandled: never = region;
      // 运行时兜底：脏数据必须显式失败
      throw new Error(
        `Unknown region: ${String(unhandled)}. Expected one of ${ALL_REGIONS.join(", ")}.`,
      );
    }
  }
}

/*
  数据里实际出现过的大区，按权威词表的固定顺序排列 —— 筛选按钮直接遍历它生成。

  注意：这里给的是「数据里有国家的大区」，不等于 enums.ts 的 REGIONS（合法值全集）。
  两者刻意分开：合法但暂时没有国家的大区，不应该在筛选器里显示成 0 结果的按钮。
  TASK 08.04：固定 Asia → Europe → North America，不依赖 JSON 的书写顺序。
*/
export const REGIONS: Region[] = ALL_REGIONS.filter((region) =>
  COUNTRIES.some((country) => country.region === region),
);

// 类型也顺手导出，将来写页面时不用到处找它定义在哪
export type {
  SnapshotItem,
  NetworkModule,
  Concept,
  ConceptLevel,
  ConceptMetric,
  Topic,
  ScorProcess,
  Company,
  IndustryId,
  SupplyChainRoleId,
  /* TASK 08.01：国家与企业共用的大区类型（原来的 CompanyRegion 已合并进它） */
  Region,
  /* TASK 08.01：统一的溯源类型（取代原来的 ConceptSource） */
  Provenance,
  ProvenanceKind,
  CalculatorMeta,
  Tool,
  Country,
};

// 统一的缺省溯源语义，供 UI 从数据层入口读取。
export { provenanceOf } from "./provenance";
