/*
  lib/formulas.ts — 计算器公式的唯一来源（TASK 06）

  为什么单独建这个文件？
  同一个公式会出现在两个地方：
    1. Supply Chain 的概念卡（解释「它是什么」）
    2. Tools 页的计算器（真的拿它算一次）
  如果两边各写一份公式字符串，改了这边忘了那边，就会出现「概念卡写一个公式、
  计算器用另一个公式」的情况。所以这里做唯一来源，两个页面都通过 formulaId 引用。

  哪些东西翻译、哪些不翻译？
    · expression / symbol / unit / resultUnit —— 数学符号与单位，不翻译
    · label / hint / assumptions / presetNote —— 人类可读说明，翻译（LocalizedText）
    · presets 的 label/value —— 例如 "90% · 1.28"，数字与百分比不翻译

  这个文件只描述「公式长什么样、需要哪些输入」，
  不做任何计算。计算在 lib/calculators.ts。
*/

import type { LocalizedText } from "@/lib/i18n";

/** 四个计算器的稳定英文 id。JSON 里的 formulaId 必须是这四个之一。 */
export type FormulaId =
  | "eoq"
  | "safetyStock"
  | "reorderPoint"
  | "inventoryTurnover";

/**
 * 一个输入字段的完整元数据。
 *
 * 为什么 defaultValue 是 string 而不是 number？
 * React 的受控输入用 string 最安全：用户清空输入框时得到的是 ""，
 * 不会被类型转换悄悄变成 0。解析成 number 是 lib/calculators.ts 的事。
 */
export type FormulaVariable = {
  key: string; // 输入字段键，例如 "annualDemand"
  symbol: string; // 数学符号，例如 "D" —— 不翻译
  unit: string; // 单位，例如 "units/year" —— 不翻译
  label: LocalizedText; // 人类可读标签 —— 翻译
  inputType: "number"; // 语义类型：数值输入
  allowDecimal: boolean; // false → 只接受整数
  defaultValue: string; // "" 表示空，不预填业务数字
  hint?: LocalizedText; // 字段级输入提示
  presets?: { label: string; value: string }[]; // 快捷参考值（label/value 不翻译）
  presetNote?: LocalizedText; // 参考值的适用说明
};

/** 一个公式的完整定义 */
export type FormulaDefinition = {
  id: FormulaId;
  name: LocalizedText;
  expression: string; // 公式字符串 —— 不翻译
  resultUnit: string; // 结果单位 —— 不翻译
  variables: FormulaVariable[];
  assumptions?: LocalizedText; // 公式成立的假设 —— 翻译
};

export const FORMULAS: Record<FormulaId, FormulaDefinition> = {
  eoq: {
    id: "eoq",
    name: { en: "EOQ", zh: "经济订货批量（EOQ）" },
    expression: "EOQ = √(2DS / H)",
    resultUnit: "units",
    variables: [
      {
        key: "annualDemand",
        symbol: "D",
        unit: "units/year",
        label: { en: "Annual Demand", zh: "年需求量" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Total units demanded in a year.",
          zh: "全年总需求量。",
        },
      },
      {
        key: "orderingCost",
        symbol: "S",
        unit: "currency/order",
        label: { en: "Ordering Cost per Order", zh: "每次订货成本" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Cost of placing one order.",
          zh: "下达一次订单的成本。",
        },
      },
      {
        key: "holdingCost",
        symbol: "H",
        unit: "currency/unit/year",
        label: { en: "Annual Holding Cost per Unit", zh: "单位年持有成本" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Cost of holding one unit for a year.",
          zh: "持有一单位一年的成本。",
        },
      },
    ],
    assumptions: {
      en: "Assumes constant demand, instantaneous replenishment and no quantity discounts. A simplified teaching model.",
      zh: "假设需求恒定、瞬时补货且无数量折扣，是简化教学模型。",
    },
  },

  safetyStock: {
    id: "safetyStock",
    name: { en: "Safety Stock", zh: "安全库存" },
    expression: "SS = Z × σd × √L",
    resultUnit: "units",
    variables: [
      {
        key: "serviceLevelZ",
        symbol: "Z",
        unit: "—",
        label: { en: "Service Level Factor (Z)", zh: "服务水平系数（Z）" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Enter Z directly, or choose a reference service level below.",
          zh: "可直接输入 Z，也可选择下方参考服务水平。",
        },
        presets: [
          { label: "90% · 1.28", value: "1.28" },
          { label: "95% · 1.645", value: "1.645" },
          { label: "98% · 2.054", value: "2.054" },
          { label: "99% · 2.326", value: "2.326" },
        ],
        presetNote: {
          en: "Reference values based on common normal-distribution approximations. They are a starting point, not a universal rule.",
          zh: "参考值基于常见正态分布近似，仅作起点，并非所有场景的通用规则。",
        },
      },
      {
        key: "demandStdDev",
        symbol: "σd",
        unit: "units/period",
        label: { en: "Demand Standard Deviation (σd)", zh: "需求标准差（σd）" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Standard deviation of demand per period. Use the same time unit as lead time.",
          zh: "每个时间单位的需求标准差，时间单位需与提前期一致。",
        },
      },
      {
        key: "leadTime",
        symbol: "L",
        unit: "periods",
        label: { en: "Lead Time (L)", zh: "提前期（L）" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Lead time in the same time unit as demand standard deviation.",
          zh: "提前期，时间单位需与需求标准差一致。",
        },
      },
    ],
    assumptions: {
      en: "Assumes normally distributed demand and a constant lead time. σd and L must use the same time unit. This is a simplified model, not the only valid method.",
      zh: "假设需求服从正态分布且提前期恒定；σd 与 L 必须使用相同时间单位。这是简化模型，并非唯一有效方法。",
    },
  },

  reorderPoint: {
    id: "reorderPoint",
    name: { en: "Reorder Point", zh: "再订货点" },
    expression: "ROP = d̄L + SS",
    resultUnit: "units",
    variables: [
      {
        key: "demandDuringLeadTime",
        symbol: "d̄L",
        unit: "units",
        label: {
          en: "Demand During Lead Time (d̄L)",
          zh: "提前期内需求（d̄L）",
        },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Expected demand during the lead time. Use the same unit as safety stock.",
          zh: "提前期内的预期需求，单位需与安全库存一致。",
        },
      },
      {
        key: "safetyStock",
        symbol: "SS",
        unit: "units",
        label: { en: "Safety Stock (SS)", zh: "安全库存（SS）" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Buffer stock. Use the same unit as demand during lead time.",
          zh: "缓冲库存，单位需与提前期内需求一致。",
        },
      },
    ],
    assumptions: {
      en: "Both terms must use the same quantity unit.",
      zh: "两项必须使用相同的数量单位。",
    },
  },

  inventoryTurnover: {
    id: "inventoryTurnover",
    name: { en: "Inventory Turnover", zh: "库存周转率" },
    expression: "Inventory turnover = COGS ÷ Average Inventory",
    resultUnit: "times / year",
    variables: [
      {
        key: "cogs",
        symbol: "COGS",
        unit: "currency/year",
        label: { en: "Annual COGS", zh: "年度销货成本（COGS）" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Annual cost of goods sold. Use the same period and valuation basis as average inventory.",
          zh: "年度销货成本，期间与计价口径需与平均库存一致。",
        },
      },
      {
        key: "averageInventory",
        symbol: "Inv̄",
        unit: "currency",
        label: { en: "Average Annual Inventory", zh: "年度平均库存" },
        inputType: "number",
        allowDecimal: true,
        defaultValue: "",
        hint: {
          en: "Average annual inventory. Must be greater than zero; use the same period and valuation basis as COGS.",
          zh: "年度平均库存，必须大于零；期间与计价口径需与 COGS 一致。",
        },
      },
    ],
    assumptions: {
      en: "Annual basis: COGS and average inventory must cover the same period and use a comparable valuation basis. V1 does not convert between periods.",
      zh: "年度口径：COGS 与平均库存必须覆盖同一期间并采用可比的计价基础。V1 不做期间换算。",
    },
  },
};

/**
 * 按 id 取公式。
 *
 * JSON 里的 formulaId 只是普通 string，TypeScript 在运行时帮不上忙。
 * 这里显式检查一次：写错 id 会立刻抛错（build / 页面加载时就能发现），
 * 而不是让计算器静默显示空白。
 */
export function formulaFor(id: FormulaId): FormulaDefinition {
  const formula = FORMULAS[id];
  if (!formula) {
    throw new Error(`Unknown formula id: ${id}`);
  }
  return formula;
}

/** 某个字段是否允许小数 —— 解析层复用同一份元数据，避免规则漂移 */
export function allowDecimal(formulaId: FormulaId, key: string): boolean {
  return (
    formulaFor(formulaId).variables.find((variable) => variable.key === key)
      ?.allowDecimal ?? false
  );
}
