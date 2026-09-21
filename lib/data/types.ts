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

/** Supply Chain Insights 的一篇内容 */
export type Insight = {
  title: LocalizedText;
  summary: LocalizedText;
  category: string; // Inventory / Transportation / Risk Management…
  href: string;
};

/** Companies 页面的一家公司 */
export type Company = {
  name: string; // 品牌名不翻译
  industry: string; // Logistics / Shipping / Freight Forwarding
  sector: LocalizedText;
  focus: LocalizedText;
  supplyChainModel: LocalizedText; // 关键：从供应链角度理解这家公司
  href: string;
};

/** Tools 页面的一个计算器 */
export type Tool = {
  name: LocalizedText;
  description: LocalizedText;
  category: string;
  formula: string; // 数学符号，不翻译
  href: string;
};

/** Global 页面的一个国家 / 地区（TASK 03 会继续补充字段） */
export type Country = {
  name: string;
  code: string; // ISO 3166-1 alpha-2，例如 CN
  region: string; // Asia / Europe / North America
};
