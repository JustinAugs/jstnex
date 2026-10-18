"use client";

/*
  Calculator — 一个计算器的通用外壳（TASK 06）

  它只做四件事：
    1. 根据 lib/formulas.ts 的字段元数据渲染输入框
    2. 把用户输入（string）交给 parseXxx
    3. 把解析后的强类型对象交给 calculateXxx
    4. 显示三态结果：正常 / 无效 / 无法计算

  为什么输入状态是 Record<string, string>？
  因为用户可能把输入框清空。如果状态是 number，清空时很容易被写成 0；
  用 string 就能原样保留 ""，由 parse 层判断「这是没填」而不是「填了 0」。

  为什么切换计算器会重置？
  父组件用 <Calculator key={selectedId} …>，key 一变 React 就会卸载再挂载，
  useState 重新按 defaultValue 初始化。不需要 useEffect 手动清理。
*/

import { useState, type FormEvent } from "react";

import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick, type Language } from "@/lib/i18n";
import type { CalculatorMeta } from "@/lib/data";
import type { FormulaDefinition } from "@/lib/formulas";
import {
  calculateEoq,
  calculateInventoryTurnover,
  calculateReorderPoint,
  calculateSafetyStock,
  parseEoq,
  parseInventoryTurnover,
  parseReorderPoint,
  parseSafetyStock,
  type CalcResult,
  type FieldError,
} from "@/lib/calculators";

type CalculatorProps = {
  calculator: CalculatorMeta;
  formula: FormulaDefinition;
};

/* 每个字段的初始值都来自元数据；V1 全部是 ""（不预填业务数字） */
function createInitialValues(formula: FormulaDefinition): Record<string, string> {
  return Object.fromEntries(
    formula.variables.map((variable) => [variable.key, variable.defaultValue]),
  );
}

/* 显示用：最多两位小数。存储的 value 本身不四舍五入。 */
function formatNumber(value: number, language: Language): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(
    value,
  );
}

function formatInteger(value: number, language: Language): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(language, { maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function Calculator({ calculator, formula }: CalculatorProps) {
  const { language, dict } = useLanguage();

  const [values, setValues] = useState<Record<string, string>>(() =>
    createInitialValues(formula),
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, FieldError>>
  >({});
  const [result, setResult] = useState<CalcResult | null>(null);

  function updateValue(key: string, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    // 输入变了，旧结果就不再对应当前输入，先清掉。
    setResult(null);
    setFieldErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function handleReset() {
    setValues(createInitialValues(formula));
    setFieldErrors({});
    setResult(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /*
      四个分支显式写出来，不使用泛型适配器。
      这样每个计算器的输入类型、parse 函数、calculate 函数都一目了然，
      也不会为了「通用」而丢掉字段级类型。
    */
    switch (formula.id) {
      case "eoq": {
        const parsed = parseEoq(values);
        if (!parsed.ok) {
          setFieldErrors({ ...parsed.errors });
          setResult(null);
          return;
        }
        setFieldErrors({});
        setResult(calculateEoq(parsed.value));
        return;
      }

      case "safetyStock": {
        const parsed = parseSafetyStock(values);
        if (!parsed.ok) {
          setFieldErrors({ ...parsed.errors });
          setResult(null);
          return;
        }
        setFieldErrors({});
        setResult(calculateSafetyStock(parsed.value));
        return;
      }

      case "reorderPoint": {
        const parsed = parseReorderPoint(values);
        if (!parsed.ok) {
          setFieldErrors({ ...parsed.errors });
          setResult(null);
          return;
        }
        setFieldErrors({});
        setResult(calculateReorderPoint(parsed.value));
        return;
      }

      case "inventoryTurnover": {
        const parsed = parseInventoryTurnover(values);
        if (!parsed.ok) {
          setFieldErrors({ ...parsed.errors });
          setResult(null);
          return;
        }
        setFieldErrors({});
        setResult(calculateInventoryTurnover(parsed.value));
        return;
      }
    }
  }

  return (
    <Card className="max-w-3xl">
      <h3 className="text-h3 text-ink">{pick(calculator.title, language)}</h3>
      <p className="mt-2 max-w-xl text-small text-mist">
        {pick(calculator.summary, language)}
      </p>

      {/* 公式直接摆在最上面：透明，不做黑盒 */}
      <div className="mt-5 border-t border-line pt-4">
        <p className="text-caption text-mist">{dict.tools.formulaLabel}</p>
        <p className="mt-1 break-words font-mono text-small text-deep">
          {formula.expression}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex flex-col gap-6">
          {formula.variables.map((variable) => {
            const error = fieldErrors[variable.key];

            const describedBy = [
              variable.hint ? `${variable.key}-hint` : null,
              error ? `${variable.key}-error` : null,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={variable.key}>
                <label
                  htmlFor={variable.key}
                  className="flex flex-wrap items-baseline gap-2"
                >
                  <span className="text-small font-medium text-ink">
                    {pick(variable.label, language)}
                  </span>
                  <span className="font-mono text-caption text-mist">
                    {variable.symbol}
                  </span>
                  {variable.unit !== "—" ? (
                    <span className="text-caption text-mist">
                      {variable.unit}
                    </span>
                  ) : null}
                </label>

                <Input
                  id={variable.key}
                  type="text"
                  inputMode={
                    variable.inputType === "number"
                      ? variable.allowDecimal
                        ? "decimal"
                        : "numeric"
                      : "text"
                  }
                  value={values[variable.key] ?? ""}
                  onChange={(event) =>
                    updateValue(variable.key, event.target.value)
                  }
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy || undefined}
                  className="mt-2"
                />

                {variable.hint ? (
                  <p
                    id={`${variable.key}-hint`}
                    className="mt-1 text-caption text-mist"
                  >
                    {pick(variable.hint, language)}
                  </p>
                ) : null}

                {/* Safety Stock 的 Z：参考服务水平 chips，可点选也可手动改 */}
                {variable.presets ? (
                  <div className="mt-3">
                    <p className="text-caption text-mist">
                      {dict.tools.safetyStock.serviceLevelReference}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {variable.presets.map((preset) => {
                        const current = values[variable.key]?.trim() ?? "";
                        const active =
                          current !== "" &&
                          Number(current) === Number(preset.value);

                        return (
                          <button
                            key={preset.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() =>
                              updateValue(variable.key, preset.value)
                            }
                            className={buttonStyles({
                              variant: active ? "secondary" : "ghost",
                              size: "sm",
                              className: active ? "" : "border border-line",
                            })}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {variable.presetNote ? (
                      <p className="mt-2 text-caption text-mist">
                        {pick(variable.presetNote, language)}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {error ? (
                  <p
                    id={`${variable.key}-error`}
                    role="alert"
                    className="mt-1 text-caption text-ink"
                  >
                    {dict.tools.errors[error]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="submit">{dict.tools.calculate}</Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            {dict.tools.reset}
          </Button>
        </div>
      </form>

      {/* ---------- 结果 ---------- */}
      <div
        className="mt-6 border-t border-line pt-6"
        aria-live="polite"
      >
        {result === null ? (
          <p className="text-small text-mist">{dict.tools.enterValues}</p>
        ) : result.status === "ok" ? (
          <div>
            <p className="text-caption text-mist">
              {dict.tools.exactValue}
            </p>
            <p className="mt-1 text-h2 text-ink">
              {formatNumber(result.value, language)}
              <span className="ml-2 text-small text-mist">
                {formula.resultUnit}
              </span>
            </p>

            {result.integerReference !== null ? (
              <div className="mt-4">
                <p className="text-caption text-mist">
                  {dict.tools.integerReference}
                </p>
                <p className="mt-1 text-h3 text-ink">
                  {formatInteger(result.integerReference, language)}
                  <span className="ml-2 text-small text-mist">
                    {formula.resultUnit}
                  </span>
                </p>
                <p className="mt-2 text-caption text-mist">
                  {dict.tools.integerReferenceNote}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p role="alert" className="text-small text-ink">
            {result.status === "invalid"
              ? (dict.tools.reasons[result.reason] ??
                dict.tools.reasons.resultNotFinite)
              : dict.tools.reasons.resultNotFinite}
          </p>
        )}
      </div>

      {/* ---------- 假设说明 ---------- */}
      {formula.assumptions ? (
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-caption text-mist">
            {dict.tools.assumptionsLabel}
          </p>
          <p className="mt-1 text-caption text-mist">
            {pick(formula.assumptions, language)}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
