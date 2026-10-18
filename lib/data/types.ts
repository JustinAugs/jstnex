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

/** 首页 Global Snapshot 的一个指标（例如 Global Trade） */
export type SnapshotItem = {
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

/** 概念的学习层级。V1 主要用 fundamental / intermediate */
export type ConceptLevel = "fundamental" | "intermediate" | "advanced";

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

/*
  ConceptSource —— 数据来源溯源。

  V1 全部为 null：内容是我们自己整理的教学内容，不是抓取来的统计数据。
  将来接 Python 爬虫 / 数据库时填上真实来源；
  UI 只在 source 不为 null 时才渲染「来源 + 日期」，绝不显示 "Source: —"。
*/
export type ConceptSource = {
  name: string;
  url: string;
  retrievedAt: string;
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
    预留：source / updatedAt / relatedConcepts   ← 现在就用 null / [] 占位，
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
  source: ConceptSource | null;
  updatedAt: string | null;
  relatedConcepts: string[];
};

/** Companies 页面的一家公司 */
/*
  行业 —— 受控清单（TASK 05 §5）。
  数据里存稳定的英文 id，显示名放在字典里（dict.companies.industries），
  这样中文模式下不会把 "semiconductors" 这种内部 id 暴露给用户。
*/
export type IndustryId =
  | "technology"
  | "automotive"
  | "logistics"
  | "manufacturing"
  | "retail"
  | "energy"
  | "pharmaceuticals"
  | "semiconductors";

/*
  供应链角色 —— 企业在供应网络里「扮演什么角色」（TASK 05 §6）。
  刻意不使用「行业龙头 / 市场领先 / 最佳供应商」这类主观评价：
  这一页讲的是角色，不是排名。
*/
export type SupplyChainRoleId =
  | "brand-integrator"
  | "manufacturer"
  | "supplier"
  | "logistics-provider"
  | "retailer"
  | "technology-provider"
  | "raw-material-energy";

/*
  大区 —— 直接沿用 Global 页面的英文值（"Asia" / "Europe" / "North America"），
  不另起一套。显示名复用字典里共享的 regions 段。
*/
export type CompanyRegion = "Asia" | "Europe" | "North America";

/** Companies 页面的一家企业 */
export type Company = {
  id: string; // 稳定 slug，将来可能用作 URL
  name: LocalizedText; // 公司名有通用中文写法（Apple → 苹果）
  industry: IndustryId;
  country: LocalizedText;
  region: CompanyRegion;
  role: SupplyChainRoleId;
  summary: LocalizedText;
  keyActivities: LocalizedText[];
  supplyChainStrength: LocalizedText; // 定性描述，不给分数或百分比
  supplyChainRisk: LocalizedText;
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
  category: string;
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
  region: string; // 大区 key：Asia / Europe / North America（显示名走字典翻译）
  role: LocalizedText; // 在全球供应链里的角色
  summary: LocalizedText; // 两三句说明它为什么重要
  ports: string[]; // 主要港口，专有名词不翻译
  exports: LocalizedText; // 主要出口品类
  strength: LocalizedText; // 结构性优势
  risk: LocalizedText; // 主要脆弱点
};
