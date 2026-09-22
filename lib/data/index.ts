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
import toolsJson from "@/data/tools.json";
import countriesJson from "@/data/countries.json";

import type {
  SnapshotItem,
  NetworkModule,
  Concept,
  ConceptLevel,
  ConceptMetric,
  ConceptSource,
  Topic,
  ScorProcess,
  Company,
  IndustryId,
  SupplyChainRoleId,
  CompanyRegion,
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
  所以 level 的取值请对照 lib/data/types.ts 里的 ConceptLevel。
*/
export const CONCEPTS: Concept[] = conceptsJson as Concept[];

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
  所以 industry / role / region 的取值请对照 lib/data/types.ts。
*/
export const COMPANIES: Company[] = companiesJson as Company[];

/*
  行业 / 角色 / 大区的「受控清单」：
  顺序写死（决定筛选按钮的显示顺序），但只保留数据里真实出现过的项 ——
  这样以后往 companies.json 加一家新行业的公司，按钮会自动多出来，
  而不会凭空显示一个点进去 0 结果的分类。
*/
const INDUSTRY_ORDER: IndustryId[] = [
  "technology",
  "automotive",
  "logistics",
  "manufacturing",
  "retail",
  "energy",
  "pharmaceuticals",
  "semiconductors",
];

const ROLE_ORDER: SupplyChainRoleId[] = [
  "brand-integrator",
  "manufacturer",
  "supplier",
  "logistics-provider",
  "retailer",
  "technology-provider",
  "raw-material-energy",
];

export const INDUSTRIES: IndustryId[] = INDUSTRY_ORDER.filter((id) =>
  COMPANIES.some((company) => company.industry === id),
);

export const COMPANY_ROLES: SupplyChainRoleId[] = ROLE_ORDER.filter((id) =>
  COMPANIES.some((company) => company.role === id),
);

export const COMPANY_REGIONS: CompanyRegion[] = (
  ["Asia", "Europe", "North America"] as CompanyRegion[]
).filter((region) => COMPANIES.some((company) => company.region === region));

/* 筛选按钮上的个数 —— 一律从数据算出来，绝不手写死数字 */
export function countCompaniesByIndustry(industry: IndustryId): number {
  return COMPANIES.filter((company) => company.industry === industry).length;
}

export function countCompaniesByRole(role: SupplyChainRoleId): number {
  return COMPANIES.filter((company) => company.role === role).length;
}

export function countCompaniesByRegion(region: CompanyRegion): number {
  return COMPANIES.filter((company) => company.region === region).length;
}

/** 四个计算器工具 */
export const TOOLS: Tool[] = toolsJson;

/** Global 页面的国家列表（TASK 03：每个国家 9 个字段） */
export const COUNTRIES: Country[] = countriesJson;

/*
  大区的英文值（"Asia" / "Europe" / "North America"）只是一把钥匙，
  真正显示给用户的大区名放在字典里（见 en.ts 的 regions —— TASK 05 起由 Global 与
  Companies 共用，所以不再放在 global 段内）。
  这个函数负责把「数据里的英文值」翻译成「字典的字段名」。
*/
export type RegionKey = "asia" | "europe" | "northAmerica";

export function regionKey(region: string): RegionKey {
  if (region === "Europe") return "europe";
  if (region === "North America") return "northAmerica";
  return "asia";
}

/* 数据里实际出现过的大区，按顺序去重 —— 筛选按钮直接遍历它生成 */
export const REGIONS: string[] = Array.from(
  new Set(COUNTRIES.map((country) => country.region)),
);

// 类型也顺手导出，将来写页面时不用到处找它定义在哪
export type {
  SnapshotItem,
  NetworkModule,
  Concept,
  ConceptLevel,
  ConceptMetric,
  ConceptSource,
  Topic,
  ScorProcess,
  Company,
  IndustryId,
  SupplyChainRoleId,
  CompanyRegion,
  Tool,
  Country,
};
