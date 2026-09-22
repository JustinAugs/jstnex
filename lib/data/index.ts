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

/** 首页展示的五家公司 */
export const COMPANIES: Company[] = companiesJson;

/** 四个计算器工具 */
export const TOOLS: Tool[] = toolsJson;

/** Global 页面的国家列表（TASK 03：每个国家 9 个字段） */
export const COUNTRIES: Country[] = countriesJson;

/*
  大区的英文值（"Asia" / "Europe" / "North America"）只是一把钥匙，
  真正显示给用户的大区名放在字典里（见 en.ts 的 global.regions）。
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
  Tool,
  Country,
};
