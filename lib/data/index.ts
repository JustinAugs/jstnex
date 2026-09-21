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
import insightsJson from "@/data/insights.json";
import companiesJson from "@/data/companies.json";
import toolsJson from "@/data/tools.json";
import countriesJson from "@/data/countries.json";

import type {
  SnapshotItem,
  NetworkModule,
  Insight,
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

/** 首页展示的四篇供应链洞察 */
export const INSIGHTS: Insight[] = insightsJson;

/** 首页展示的五家公司 */
export const COMPANIES: Company[] = companiesJson;

/** 四个计算器工具 */
export const TOOLS: Tool[] = toolsJson;

/** 国家列表（目前只有基础字段，TASK 03 做 Global 页面时再扩展） */
export const COUNTRIES: Country[] = countriesJson;

// 类型也顺手导出，将来写页面时不用到处找它定义在哪
export type {
  SnapshotItem,
  NetworkModule,
  Insight,
  Company,
  Tool,
  Country,
};
