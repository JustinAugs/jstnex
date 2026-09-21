"use client";

/*
  首页（Home）

  这一页只做一件事：把各个区块按顺序「组装」起来。
  文字从哪来？分两类：
    1. 界面文字（区块标题、按钮、标签）→ lib/i18n 的字典，用 dict.xxx 取
    2. 内容数据（公司、工具、洞察）  → data/home.ts，字段是 { en, zh }
       用 pick(字段, language) 取出当前语言的那一条

  每个区块都套在 <Section> 里：它自带统一的最大宽度、左右留白和上下呼吸感，
  所以这里再也不用写 mx-auto / max-w-6xl / px-6 / mt-20 这些零散的样式。

  为什么加 "use client"？
  因为要调用 useLanguage() 读当前语言状态，这个必须在浏览器里跑。
  注意：客户端组件依然会先在服务端渲染成 HTML，所以 SEO 不受影响。
*/

import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import DataCard from "@/components/DataCard";
import DemoBadge from "@/components/DemoBadge";
import NetworkCard from "@/components/NetworkCard";
import InsightCard from "@/components/InsightCard";
import CompanyCard from "@/components/CompanyCard";
import ToolCard from "@/components/ToolCard";
import Section from "@/components/ui/Section";
import { useLanguage } from "@/components/LanguageProvider";
import { pick } from "@/lib/i18n";
import {
  SNAPSHOT,
  NETWORK_MODULES,
  INSIGHTS,
  COMPANIES,
  TOOLS,
} from "@/data/home";

// 网格间距也统一：gap-grid 是 Design System 里定的唯一卡片间距
const GRID = "grid gap-4";

export default function Home() {
  const { language, dict } = useLanguage();

  return (
    <>
      {/* ---------- 2. Hero ---------- */}
      <Hero content={dict.hero} />

      {/* ---------- 3. Global Snapshot ---------- */}
      <Section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeading
            eyebrow={dict.snapshot.eyebrow}
            title={dict.snapshot.title}
          />
          {/* 演示数据必须明确标注，文字跟着语言走 */}
          <DemoBadge label={dict.snapshot.demoBadge} />
        </div>

        <div className={`${GRID} sm:grid-cols-2 lg:grid-cols-4`}>
          {SNAPSHOT.map((item) => (
            <DataCard
              key={pick(item.label, language)}
              label={pick(item.label, language)}
              value={item.value}
              unit={item.unit}
              note={pick(item.note, language)}
            />
          ))}
        </div>
      </Section>

      {/* ---------- 4. Global Network ---------- */}
      <Section>
        <SectionHeading
          eyebrow={dict.network.eyebrow}
          title={dict.network.title}
          description={dict.network.description}
        />

        <div className={`${GRID} md:grid-cols-3`}>
          {NETWORK_MODULES.map((module) => (
            <NetworkCard
              key={pick(module.title, language)}
              title={pick(module.title, language)}
              description={pick(module.description, language)}
              href={module.href}
              exploreLabel={dict.network.explore}
            />
          ))}
        </div>
      </Section>

      {/* ---------- 5. Supply Chain Insights ---------- */}
      <Section>
        <SectionHeading
          eyebrow={dict.insights.eyebrow}
          title={dict.insights.title}
          description={dict.insights.description}
        />

        <div className={`${GRID} sm:grid-cols-2`}>
          {INSIGHTS.map((insight) => (
            <InsightCard
              key={pick(insight.title, language)}
              title={pick(insight.title, language)}
              summary={pick(insight.summary, language)}
              href={insight.href}
              readLabel={dict.insights.read}
            />
          ))}
        </div>
      </Section>

      {/* ---------- 6. Companies ---------- */}
      <Section>
        <SectionHeading
          eyebrow={dict.companies.eyebrow}
          title={dict.companies.title}
          description={dict.companies.description}
        />

        <div className={`${GRID} sm:grid-cols-2 lg:grid-cols-3`}>
          {COMPANIES.map((company) => (
            <CompanyCard
              key={company.name}
              name={company.name}
              sector={pick(company.sector, language)}
              focus={pick(company.focus, language)}
              supplyChainModel={pick(company.supplyChainModel, language)}
              modelLabel={dict.companies.modelLabel}
            />
          ))}
        </div>
      </Section>

      {/* ---------- 7. Tools ---------- */}
      <Section>
        <SectionHeading
          eyebrow={dict.tools.eyebrow}
          title={dict.tools.title}
          description={dict.tools.description}
        />

        <div className={`${GRID} sm:grid-cols-2 lg:grid-cols-4`}>
          {TOOLS.map((tool) => (
            <ToolCard
              key={pick(tool.name, language)}
              name={pick(tool.name, language)}
              description={pick(tool.description, language)}
              formula={tool.formula}
              openLabel={dict.tools.open}
            />
          ))}
        </div>

        {/* 诚实标注：不要把简单公式包装成企业级预测系统 */}
        <p className="mt-6 text-small text-mist">{dict.tools.disclaimer}</p>
      </Section>
    </>
  );
}
