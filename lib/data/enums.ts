/*
  lib/data/enums.ts — 受控词表的「唯一来源」（TASK 08.01）

  为什么要把这些数组单独放在一个文件里？

  以前这些取值只以「联合类型」的形式存在（例如
  `type IndustryId = "technology" | "automotive" | ...`）。
  联合类型只能在编译期用，运行时拿不到 —— 于是出现了两个问题：

    1. 筛选按钮的顺序要在 index.ts 里再手写一遍数组（INDUSTRY_ORDER），
       等于同一份清单写了两处，加一个行业要改两个地方。
    2. 将来写数据校验脚本（TASK 08.02）时，脚本是运行时执行的，
       它读不到联合类型，只能再抄一遍清单 —— 三处清单，迟早不同步。

  改法：先用 `as const` 写「运行时真实存在的数组」，再由它推导类型：

      const INDUSTRIES = [...] as const;
      type IndustryId = (typeof INDUSTRIES)[number];

  这样数组和类型是同一份东西，永远不可能不一致。
  而且这个文件不 import 任何东西 —— 校验脚本可以直接读它，不会牵连
  `@/` 路径别名、React 或 i18n。

  什么该放进来、什么不该？

  只放「业务上封闭、不会随内容增长」的取值。
  下面这些刻意没有放进来（保持自由字符串 + 运行时校验）：
    · `Country.code`        —— ISO alpha-2，国家会陆续增加
    · `Concept.topicId`     —— 主题列表来自 supply-chain-topics.json
    · `Concept.scorProcess` —— 流程列表来自 scor-processes.json
    · `Company.country`     —— 显示用的国家名，不是一个受控 ID
    · `FormulaId`           —— 已经在 lib/formulas.ts 里由 FORMULAS 的键约束，
                               硬搬到这里反而会变成第二份来源
  把它们写成封闭枚举，就等于「每加一条数据都要改类型」，那不是简化而是负担。
*/

/*
  大区 —— Global 的国家卡与 Companies 的企业卡共用同一套取值（TASK 08.01 统一）。

  以前 `Country.region` 是裸 string，而 `Company.region` 是联合类型。
  同一个概念两套约束：国家数据写错地区照样编译通过，企业数据写错就报错。
  现在两边都用这个 `Region`。

  注意：这里只是「合法取值清单」，不代表数据里已经用到了全部取值。
  界面上实际显示哪些筛选按钮，仍然由数据里出现过的值决定（见 index.ts 的 REGIONS）。
*/
export const REGIONS = ["Asia", "Europe", "North America"] as const;
export type Region = (typeof REGIONS)[number];

/*
  行业 —— 受控清单（TASK 05 §5）。
  数据里存稳定的英文 id，显示名放在字典里（dict.companies.industries），
  这样中文模式下不会把 "semiconductors" 这种内部 id 暴露给用户。
*/
export const INDUSTRIES = [
  "technology",
  "automotive",
  "logistics",
  "manufacturing",
  "retail",
  "energy",
  "pharmaceuticals",
  "semiconductors",
] as const;
export type IndustryId = (typeof INDUSTRIES)[number];

/*
  供应链角色 —— 企业在供应网络里「扮演什么角色」（TASK 05 §6）。
  刻意不使用「行业龙头 / 市场领先 / 最佳供应商」这类主观评价：
  这一页讲的是角色，不是排名。
*/
export const SUPPLY_CHAIN_ROLES = [
  "brand-integrator",
  "manufacturer",
  "supplier",
  "logistics-provider",
  "retailer",
  "technology-provider",
  "raw-material-energy",
] as const;
export type SupplyChainRoleId = (typeof SUPPLY_CHAIN_ROLES)[number];

/*
  概念的学习层级。V1 主要用 fundamental / intermediate；
  advanced 目前没有数据使用，但保留在清单里，因为字典（dict.supplyChain.levels）
  已经为它准备了显示文案，属于「允许出现但暂时为空」的合法取值。
*/
export const CONCEPT_LEVELS = [
  "fundamental",
  "intermediate",
  "advanced",
] as const;
export type ConceptLevel = (typeof CONCEPT_LEVELS)[number];

/*
  溯源的性质（TASK 08.01.1 从 lib/data/provenance.ts 并入）。

  它和其他词表放在一起的原因和上面几个一样：
  08.02 的校验脚本只 import 这个文件，就能拿到全部 allowlist ——
  「curated / official / dataset」不该是脚本里再手抄的第四份清单。

  「人工整理」和「官方口径」是两种不同的可信度声明，而前者根本没有 URL 可填，
  所以 kind 是必要字段（详见 provenance.ts 的说明）。
  类型本体（Provenance）和读取函数（provenanceOf）仍在 provenance.ts。
*/
export const PROVENANCE_KINDS = [
  "curated",
  "official",
  "dataset",
] as const;
export type ProvenanceKind = (typeof PROVENANCE_KINDS)[number];
