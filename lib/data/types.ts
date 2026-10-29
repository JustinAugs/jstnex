/*
  lib/data/types.ts — 数据层的「形状说明书」

  JSON 文件本身不带类型（它只是一堆字），TypeScript 看不出来里面该有什么字段。
  所以我们在这一层用 type 描述每个数据文件的结构，
  加载时把 JSON 断言成这些类型 —— 好处是：

  1. 写错字段（比如把 supplyChainModel 拼错）会在编译时就报错
  2. 编辑器会自动补全字段名
  3. 将来数据换成 Python API 返回，只要返回值还是这个形状，前端一行都不用改

  双语约定（和 i18n 一致）：
  需要翻译的字段写成 { en: "...", zh: "..." }（LocalizedText）；
  数字、单位、公式、品牌名不翻译，保持普通字符串。
*/

import type { LocalizedText } from "@/lib/i18n";
import type { FormulaId } from "@/lib/formulas";

/*
  TASK 08.01：受控词表搬到 lib/data/enums.ts，溯源类型在 lib/data/provenance.ts。

  为什么这里要「import 进来再 re-export」？
  因为下面 Country / Company / Concept 的定义要用到这些类型，
  同时又不希望外部代码改成从 enums.ts 导入 —— 页面一直只认 @/lib/data 这一层。
  在这里统一转出，等于保持「数据层只有一个入口」的既有约定。

  `import type` 编译后会被完全擦除，所以这些运行时数组（REGIONS 等）
  不会被带进任何组件的 bundle。
*/
import type { Region, IndustryId, SupplyChainRoleId, ConceptLevel } from "./enums";
import type { Provenance } from "./provenance";

export type { Region, IndustryId, SupplyChainRoleId, ConceptLevel };
export type { Provenance, ProvenanceKind } from "./provenance";

/** 首页 Global Snapshot 的一个指标（例如 Global Trade） */
export type SnapshotItem = {
  kind: "demo" | "coverage";
  label: LocalizedText; // 指标名称
  value: string; // 数值，例如 $24.0
  unit?: string; // 单位，例如 T / M TEU（可选）
  note: LocalizedText; // 一句话说明是否真实数据
};

/** Global Network 的一个模块（Trade / Logistics / Networks） */
export type NetworkModule = {
  title: LocalizedText;
  description: LocalizedText;
  href: string; // 点击后去哪个页面
};

/* ---------- Supply Chain 知识库（TASK 04） ---------- */

/* 概念的学习层级（ConceptLevel）的取值清单在 lib/data/enums.ts。 */

/*
  ConceptMetric —— 一个概念「怎么衡量」。

  重要分工：Supply Chain 页只解释指标，Tools 页（TASK 06）才负责计算。
  两边将来共用同一份指标数据，不各抄一份公式。

  formula 和 unit 刻意保持普通 string：
  数学符号与单位（DIO / TEU / VMI / %）在任何语言下都一样，不做翻译。
*/
export type ConceptMetric = {
  name: LocalizedText;
  formula: string;
  unit?: string;
};

/*
  ConceptMetricRaw —— JSON 文件里的原始形状（TASK 06）。

  四个计算器相关的指标不再手写 formula 字符串，而是写 formulaId，
  由 lib/data/index.ts 在加载时从 lib/formulas.ts 回填 formula。
  这样「概念卡」和「计算器」永远用同一条公式，不会各写一份。

  为什么单独定义 Raw 类型？
  因为公开的 ConceptMetric 要求 formula 必填（组件直接渲染它），
  而 JSON 里这四条只有 formulaId。用 Raw 类型接住 JSON，
  回填后再变成 ConceptMetric，组件的接口一行都不用改。
*/
export type ConceptMetricRaw = {
  name: LocalizedText;
  formula?: string; // 非计算器指标（例如 DIO）仍然直接写公式
  formulaId?: FormulaId; // 计算器指标引用共享公式
  unit?: string;
};

/** 知识库的一个主题（库存 / 运输 / 采购 …）。id 是稳定英文 key，不随语言变 */
export type Topic = {
  id: string;
  name: LocalizedText;
  order: number;
};

/** SCOR Digital Standard 的一个流程（Orchestrate … Return，共 7 个） */
export type ScorProcess = {
  id: string;
  name: LocalizedText;
  summary: LocalizedText;
};

/*
  知识库的一个概念 —— 同时也是首页 Insights 区块的数据源（featured = true）。

  字段分三层：
    必需：id / title / summary / topicId / level / definition / whyItMatters / featured
    建议：scorProcess / metrics / relatedCountries
    预留：provenance / relatedConcepts          ← 现在用 null / [] 占位，
                                                   将来接 API 与真实数据源不用改结构
*/
export type Concept = {
  id: string; // 稳定英文 slug，将来可能成为 /supply-chain/[slug] 的 URL
  title: LocalizedText;
  summary: LocalizedText;
  topicId: string;
  level: ConceptLevel;
  definition: LocalizedText;
  whyItMatters: LocalizedText;
  featured: boolean;
  scorProcess: string | null;
  metrics: ConceptMetric[] | null;
  relatedCountries: string[] | null; // ISO 代码，复用 countries.json 的 code
  /*
    溯源（TASK 08.01）—— 取代原来的 `source` + `updatedAt` 两个字段。

    可缺省：concepts.json 里 14 条目前一条都没填（不为现有内容编造来源）。
    缺省时的语义由 lib/data/provenance.ts 的 provenanceOf() 明确给出
    （即 kind = "curated"），不要在这里自己判空。
  */
  provenance?: Provenance | null;
  relatedConcepts: string[];
};

/*
  行业 id（IndustryId）与角色 id（SupplyChainRoleId）的取值清单
  已移到 lib/data/enums.ts（TASK 08.01），这里不再重复定义。

  字段本身的约定没变：数据里存稳定的英文 id，显示名放在字典里
  （dict.companies.industries / dict.companies.roles），
  这样中文模式下不会把 "semiconductors" 这种内部 id 暴露给用户。
*/

/*
  大区 —— TASK 08.01 起国家与企业共用 enums.ts 里的 `Region`。

  以前这里叫 CompanyRegion 且只约束企业，而 Country.region 是裸 string：
  同一个概念两套约束，国家数据写错地区照样编译通过。现在统一了。
  显示名复用字典里共享的 regions 段。
*/

/** Companies 页面的一家企业 */
export type Company = {
  id: string; // 稳定 slug，将来可能用作 URL
  name: LocalizedText; // 公司名有通用中文写法（Apple → 苹果）
  industry: IndustryId;
  country: LocalizedText;
  region: Region;
  role: SupplyChainRoleId;
  summary: LocalizedText;
  keyActivities: LocalizedText[];
  supplyChainStrength: LocalizedText; // 定性描述，不给分数或百分比
  supplyChainRisk: LocalizedText;
  /*
    溯源（TASK 08.01）。可缺省 —— companies.json 目前一条都没填，
    缺省语义见 lib/data/provenance.ts 的 provenanceOf()。
  */
  provenance?: Provenance | null;
  /*
    relatedConcepts —— 未来 Companies → Supply Chain 的关联预留。
    V1 只存数据、不做渲染：因为 /supply-chain/[slug] 还不存在，
    做出来就是死链（指令 §21）。等详情页有了再启用。
  */
  relatedConcepts?: string[];
};

/*
  Tools 页面的一个计算器（TASK 06）。

  data/calculators.json 只存「哪个公式 + 标题 + 简介 + 顺序」，
  公式表达式、输入字段、单位全部来自 lib/formulas.ts。
  id 是稳定的英文 slug；formulaId 必须是 FormulaId 之一。
*/
export type CalculatorMeta = {
  id: string;
  formulaId: FormulaId;
  title: LocalizedText;
  summary: LocalizedText;
  order: number;
};

/*
  Tool —— 首页 ToolCard 的兼容形状（TASK 06 起改为派生视图）。

  以前它直接等于 data/tools.json；现在 data/tools.json 已删除，
  由 lib/data/index.ts 从 CALCULATORS + FORMULAS 生成。
  保留这个类型，是为了让首页 app/page.tsx 一行都不用改。
*/
export type Tool = {
  name: LocalizedText;
  description: LocalizedText;
  formula: string; // 数学符号，不翻译
  href: string;
};

/*
  Global 页面的一个国家 / 地区（TASK 03 从 3 个字段扩到 9 个）

  为什么 role / summary / exports 这些用 LocalizedText？
  因为它们是「描述性内容」，中英文都要有，比如「制造中枢」和 "Manufacturing hub"。

  为什么 name 也要翻译？
  国家名不像品牌名，它有天然的中文写法（中国 / 印度），直接显示英文体验很差。

  为什么 ports 是 string[] 且不翻译？
  港口名是专有名词，上海港在英文语境里就叫 Shanghai，保持原样最具可读性。

  为什么要有 strength 和 risk 两个字段？
  这是供应链视角区别于普通国家简介的地方：
  一个看「它凭什么不可替代」，一个看「它哪里最容易断」。
*/
export type Country = {
  name: LocalizedText;
  code: string; // ISO 3166-1 alpha-2，例如 CN
  /*
    大区（TASK 08.01）。以前是裸 string，写错地区也能编译通过；
    现在与国家/企业共用的 `Region` 联合类型一致。
  */
  region: Region;
  role: LocalizedText; // 在全球供应链里的角色
  summary: LocalizedText; // 两三句说明它为什么重要
  ports: string[]; // 主要港口，专有名词不翻译
  exports: LocalizedText; // 主要出口品类
  strength: LocalizedText; // 结构性优势
  risk: LocalizedText; // 主要脆弱点
  /*
    溯源（TASK 08.01，对应 TASK 07.01 的 G-08）。

    可缺省 —— countries.json 目前 8 条一条都没填：本任务不为现有描述
    编造来源、链接或日期。缺省语义由 provenanceOf() 给出（kind = "curated"），
    也就是「人工整理的定性描述」，这正是当前内容的真实性质。
  */
  provenance?: Provenance | null;
};
