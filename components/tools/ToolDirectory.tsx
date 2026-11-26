"use client";

/*
  ToolDirectory — Tools 页的「切换器 + 当前计算器」（TASK 06）

  交互方案 C：不建详情子页，四个计算器在同一个页面里切换。
  切换条与国家目录和概念库共用 SegmentedControl。

  为什么 Calculator 要加 key？
  key 变化会让 React 卸载旧组件、挂载新组件，
  useState 于是重新按 defaultValue 初始化 —— 输入和结果自然清空。
  比在 useEffect 里手动 reset 更简单，也不会漏字段。
*/

import SegmentedControl from "@/components/ui/SegmentedControl";
import { useState } from "react";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
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
    <Section className="atlas-workspace">
      <SectionHeader
        title={dict.tools.title}
        description={dict.tools.description}
        // 页面唯一主标题用 h1（G-01）；视觉仍是 text-h2，只改语义
        headingLevel="h1"
      />

      {/* ---------- 计算器切换 ---------- */}
      <SegmentedControl
        label={dict.tools.selectLabel}
        options={CALCULATORS.map(calculator => ({ value: calculator.id, label: pick(calculator.title, language) }))}
        value={selected.id}
        onChange={setSelectedId}
      />

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
