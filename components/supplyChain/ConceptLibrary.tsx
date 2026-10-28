"use client";

/*
  ConceptLibrary —— Supply Chain 页面的概念库（列表 + 主题筛选）

  和 Global 页的 CountryDirectory 是同一个套路：
    useState 记住「现在选了哪个主题」→ 算出可见列表 → 渲染卡片
  这样两个页面的交互体验是一致的，用户不用重新学。

  为什么它必须是客户端组件？
  两个原因：①筛选要记住状态；②所有文案要走 useLanguage() 取当前语言。

  个数怎么来的？
  一律用 countConceptsByTopic() 从数据算出来，绝不手写死数字。
  这样以后往 concepts.json 加一条，按钮上的数字自动跟着变。
*/

import { useState } from "react";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateBlock";
import ConceptCard from "@/components/cards/ConceptCard";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import {
  CONCEPTS,
  TOPICS,
  SCOR_PROCESSES,
  COUNTRIES,
  countConceptsByTopic,
  topicName,
  provenanceOf,
} from "@/lib/data";

/* 筛选状态的一种特殊值：不筛选，显示全部 */
const ALL = "all";

export default function ConceptLibrary() {
  const { language, dict } = useLanguage();

  const [selected, setSelected] = useState<string>(ALL);

  const visible =
    selected === ALL
      ? CONCEPTS
      : CONCEPTS.filter((concept) => concept.topicId === selected);

  const countOf = (topicId: string) =>
    topicId === ALL ? CONCEPTS.length : countConceptsByTopic(topicId);

  /* 按钮上的主题名 —— 中文模式下不能把 inventory 这种内部 id 显示给用户 */
  const topicLabel = (topicId: string) => {
    if (topicId === ALL) return dict.supplyChain.library.filterAll;
    const topic = topicName(topicId);
    return topic ? pick(topic.name, language) : topicId;
  };

  /* 概念卡上的 SCOR 流程名；数据里是 null 就返回 null，卡片会自动不渲染 */
  const scorLabel = (processId: string | null) => {
    if (!processId) return null;
    const process = SCOR_PROCESSES.find((item) => item.id === processId);
    return process ? pick(process.name, language) : null;
  };

  /*
    相关国家：数据里存的是 ISO 代码（CN / VN），
    显示时要换成国家名 —— 而且要用当前语言的国家名。
    代码直接复用 countries.json 现有的 code，没有新增任何国家代码。
  */
  const countryNames = (codes: string[] | null) => {
    if (!codes || codes.length === 0) return null;
    return codes.map((code) => {
      const country = COUNTRIES.find((item) => item.code === code);
      return country ? pick(country.name, language) : code;
    });
  };

  return (
    <Section>
      <SectionHeader
        eyebrow={dict.supplyChain.library.eyebrow}
        title={dict.supplyChain.library.title}
        description={dict.supplyChain.library.description}
      />

      {/* ---------- 主题筛选 ---------- */}
      <div
        role="group"
        aria-label={dict.supplyChain.library.filterLabel}
        className="flex flex-wrap gap-3"
      >
        {[ALL, ...TOPICS.map((topic) => topic.id)].map((topicId) => {
          const active = selected === topicId;
          return (
            <button
              key={topicId}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(topicId)}
              className={buttonStyles({
                variant: active ? "secondary" : "ghost",
                size: "sm",
                className: active ? "" : "border border-line",
              })}
            >
              {topicLabel(topicId)}
              <span className="ml-2 text-caption text-mist">
                {countOf(topicId)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-caption text-mist">
        {visible.length} {dict.supplyChain.library.countLabel}
      </p>

      {/* ---------- 概念卡片 ---------- */}
      {visible.length === 0 ? (
        <EmptyState className="mt-6" />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((concept) => (
            <ConceptCard
              key={concept.id}
              provenance={provenanceOf(concept)}
              title={pick(concept.title, language)}
              topic={topicLabel(concept.topicId)}
              level={dict.supplyChain.levels[concept.level]}
              definition={pick(concept.definition, language)}
              whyItMatters={pick(concept.whyItMatters, language)}
              metrics={
                concept.metrics
                  ? concept.metrics.map((metric) => ({
                      // 公式、数学符号、单位保持原样，不做翻译
                      name: pick(metric.name, language),
                      formula: metric.formula,
                      unit: metric.unit,
                    }))
                  : null
              }
              scorProcess={scorLabel(concept.scorProcess)}
              relatedCountries={countryNames(concept.relatedCountries)}
              labels={dict.supplyChain.labels}
            />
          ))}
        </div>
      )}

      {/* 数据说明：这一页是真知识，所以不挂全站 Demo Data 徽章，只在这里说明来源政策 */}
      <p className="mt-10 border-t border-line pt-6 text-caption text-mist">
        {dict.supplyChain.note}
      </p>
    </Section>
  );
}
