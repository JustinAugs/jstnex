"use client";

/*
  ToolDirectory — Tools 页的「切换器 + 当前计算器」（TASK 06）

  交互方案 C：不建详情子页，四个计算器在同一个页面里切换。
  切换条复用了 Supply Chain 页主题筛选的视觉语言：
  选中项用 secondary（黑底白字），未选中用 ghost + 细边框。
  这样全站的「选中」看起来是同一件事，用户不用重新学。

  为什么 Calculator 要加 key？
  key 变化会让 React 卸载旧组件、挂载新组件，
  useState 于是重新按 defaultValue 初始化 —— 输入和结果自然清空。
  比在 useEffect 里手动 reset 更简单，也不会漏字段。
*/

import { useState } from "react";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { buttonStyles } from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import { CALCULATORS } from "@/lib/data";
import { formulaFor } from "@/lib/formulas";
import Calculator from "./Calculator";

export default function ToolDirectory() {
  const { language, dict } = useLanguage();

  const [selectedId, setSelectedId] = useState(CALCULATORS[0]?.id ?? "");

  const selected =
    CALCULATORS.find((calculator) => calculator.id === selectedId) ??
    CALCULATORS[0];

  if (!selected) {
    return null;
  }

  return (
    <Section>
      <SectionHeader
        eyebrow={dict.tools.eyebrow}
        title={dict.tools.title}
        description={dict.tools.description}
      />

      {/* ---------- 计算器切换 ---------- */}
      <div
        role="group"
        aria-label={dict.tools.selectLabel}
        className="grid grid-cols-2 gap-2 md:grid-cols-4"
      >
        {CALCULATORS.map((calculator) => {
          const active = calculator.id === selected.id;

          return (
            <button
              key={calculator.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(calculator.id)}
              className={buttonStyles({
                variant: active ? "secondary" : "ghost",
                size: "sm",
                className: active ? "w-full" : "w-full border border-line",
              })}
            >
              {pick(calculator.title, language)}
            </button>
          );
        })}
      </div>

      {/* ---------- 当前计算器 ---------- */}
      <div className="mt-6">
        <Calculator
          key={selected.id}
          calculator={selected}
          formula={formulaFor(selected.formulaId)}
        />
      </div>

      {/* 诚实说明：这些是教学模型，不是企业级预测系统 */}
      <p className="mt-8 text-small text-mist">{dict.tools.disclaimer}</p>
    </Section>
  );
}
