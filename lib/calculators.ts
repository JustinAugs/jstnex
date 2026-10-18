/*
  lib/calculators.ts — 四个计算器的「解析层」与「计算层」

  这个文件刻意分成两半，互不越界：

    上半部分：parseXxx(state) —— 只做 string → number
      · 空字符串 → "required"（绝不变成 0）
      · "abc" / "Infinity" → "notANumber"
      · allowDecimal = false 的字段出现小数 → "notInteger"
      · 它不判断「需求量必须大于 0」这类业务规则

    下半部分：calculateXxx(input) —— 只做 number → 结果
      · 接收强类型对象，不接收 string
      · 负责业务规则（H > 0、平均库存 > 0 …）
      · 输出三态：ok / invalid / undefined
      · 永远不把 NaN 或 Infinity 交给 UI

  为什么要分开？
  输入框里是「用户打的字」，计算器要的是「数字」。
  把这两件事混在一个函数里，很容易出现「空输入被当成 0」这类 bug。
*/

import { allowDecimal, type FormulaId } from "@/lib/formulas";

/* ============================================================
   一、输入类型（字段级约束，不用 Record<string, number>）
   ============================================================ */

export interface EoqInput {
  annualDemand: number; // D
  orderingCost: number; // S
  holdingCost: number; // H
}

export interface SafetyStockInput {
  serviceLevelZ: number; // Z
  demandStdDev: number; // σd
  leadTime: number; // L
}

export interface ReorderPointInput {
  demandDuringLeadTime: number; // d̄L
  safetyStock: number; // SS
}

export interface InventoryTurnoverInput {
  cogs: number; // COGS
  averageInventory: number; // Average Inventory
}

/* ============================================================
   二、解析层：string → number（只做格式校验）
   ============================================================ */

export type FieldError = "required" | "notANumber" | "notInteger";

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Partial<Record<keyof T, FieldError>> };

/**
 * 把一个输入框的字符串读成数字。
 * 返回值是 string 时代表错误码，是 number 时代表成功。
 */
function readNumber(
  raw: string | undefined,
  formulaId: FormulaId,
  key: string,
): number | FieldError {
  if (raw === undefined || raw.trim() === "") {
    return "required";
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    return "notANumber";
  }

  if (!allowDecimal(formulaId, key) && !Number.isInteger(value)) {
    return "notInteger";
  }

  return value;
}

function collect<T extends Record<keyof T, number>>(
  entries: { key: keyof T; raw: string | undefined; formulaId: FormulaId }[],
): ParseResult<T> {
  const values: Partial<Record<keyof T, number>> = {};
  const errors: Partial<Record<keyof T, FieldError>> = {};

  for (const entry of entries) {
    const parsed = readNumber(entry.raw, entry.formulaId, String(entry.key));

    if (typeof parsed === "string") {
      errors[entry.key] = parsed;
    } else {
      values[entry.key] = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: values as T };
}

export function parseEoq(state: Record<string, string>): ParseResult<EoqInput> {
  return collect<EoqInput>([
    { key: "annualDemand", raw: state.annualDemand, formulaId: "eoq" },
    { key: "orderingCost", raw: state.orderingCost, formulaId: "eoq" },
    { key: "holdingCost", raw: state.holdingCost, formulaId: "eoq" },
  ]);
}

export function parseSafetyStock(
  state: Record<string, string>,
): ParseResult<SafetyStockInput> {
  return collect<SafetyStockInput>([
    { key: "serviceLevelZ", raw: state.serviceLevelZ, formulaId: "safetyStock" },
    { key: "demandStdDev", raw: state.demandStdDev, formulaId: "safetyStock" },
    { key: "leadTime", raw: state.leadTime, formulaId: "safetyStock" },
  ]);
}

export function parseReorderPoint(
  state: Record<string, string>,
): ParseResult<ReorderPointInput> {
  return collect<ReorderPointInput>([
    {
      key: "demandDuringLeadTime",
      raw: state.demandDuringLeadTime,
      formulaId: "reorderPoint",
    },
    { key: "safetyStock", raw: state.safetyStock, formulaId: "reorderPoint" },
  ]);
}

export function parseInventoryTurnover(
  state: Record<string, string>,
): ParseResult<InventoryTurnoverInput> {
  return collect<InventoryTurnoverInput>([
    { key: "cogs", raw: state.cogs, formulaId: "inventoryTurnover" },
    {
      key: "averageInventory",
      raw: state.averageInventory,
      formulaId: "inventoryTurnover",
    },
  ]);
}

/* ============================================================
   三、计算层：number → 结果（只做业务规则与数学）
   ============================================================ */

export type CalcErrorReason =
  | "demandMustBePositive"
  | "orderingCostMustBePositive"
  | "holdingCostMustBePositive"
  | "serviceLevelMustBeNonNegative"
  | "stdDevMustBeNonNegative"
  | "leadTimeMustBeNonNegative"
  | "valuesMustBeNonNegative"
  | "cogsMustBeNonNegative"
  | "averageInventoryMustBePositive"
  | "resultNotFinite";

export type CalcResult =
  | { status: "ok"; value: number; integerReference: number | null }
  | { status: "invalid"; reason: CalcErrorReason }
  | { status: "undefined"; reason: "resultNotFinite" };

function invalid(reason: CalcErrorReason): CalcResult {
  return { status: "invalid", reason };
}

/**
 * 检查结果是不是有限数。
 * integerReference 由调用方决定：数量型计算器传 ceil(value)，
 * 周转率传 null（周转率不是「件数」，没有整数参考值）。
 */
function ok(value: number, integerReference: number | null): CalcResult {
  if (!Number.isFinite(value)) {
    return { status: "undefined", reason: "resultNotFinite" };
  }

  return { status: "ok", value, integerReference };
}

export function calculateEoq(input: EoqInput): CalcResult {
  if (!(input.annualDemand > 0)) return invalid("demandMustBePositive");
  if (!(input.orderingCost > 0)) return invalid("orderingCostMustBePositive");
  if (!(input.holdingCost > 0)) return invalid("holdingCostMustBePositive");

  const value = Math.sqrt(
    (2 * input.annualDemand * input.orderingCost) / input.holdingCost,
  );

  return ok(value, Math.ceil(value));
}

export function calculateSafetyStock(input: SafetyStockInput): CalcResult {
  if (!(input.serviceLevelZ >= 0)) return invalid("serviceLevelMustBeNonNegative");
  if (!(input.demandStdDev >= 0)) return invalid("stdDevMustBeNonNegative");
  if (!(input.leadTime >= 0)) return invalid("leadTimeMustBeNonNegative");

  const value =
    input.serviceLevelZ * input.demandStdDev * Math.sqrt(input.leadTime);

  return ok(value, Math.ceil(value));
}

export function calculateReorderPoint(input: ReorderPointInput): CalcResult {
  if (input.demandDuringLeadTime < 0 || input.safetyStock < 0) {
    return invalid("valuesMustBeNonNegative");
  }

  const value = input.demandDuringLeadTime + input.safetyStock;

  return ok(value, Math.ceil(value));
}

export function calculateInventoryTurnover(
  input: InventoryTurnoverInput,
): CalcResult {
  if (input.cogs < 0) return invalid("cogsMustBeNonNegative");
  if (!(input.averageInventory > 0)) {
    return invalid("averageInventoryMustBePositive");
  }

  const value = input.cogs / input.averageInventory;

  // 周转率是比值，不是数量 —— 不提供整数参考值。
  return ok(value, null);
}
