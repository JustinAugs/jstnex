"use client";

/*
  首页（Home）

  这一页只做一件事：把各个区块按顺序「组装」起来。
  文字从哪来？分两类：
    1. 界面文字（区块标题、按钮、标签）→ lib/i18n 的字典，用 dict.xxx 取
    2. 内容数据（公司、工具、洞察）  → data/*.json（由 lib/data 加载成带类型的数据）
       用 pick(字段, language) 取出当前语言的那一条

  组件从哪来？按职责分层（TASK 02.7）：
    @/components/home/*       首页专属区块（Hero）
    @/components/cards/*      业务卡片（数据卡 / 网络卡 / 洞察卡 / 公司卡 / 工具卡）
    @/components/ui/*         通用原语（Section / SectionHeader / Badge…）

  每个区块套在 <Section> 里：自带统一宽度、左右留白和上下呼吸感。

  为什么加 "use client"？
  因为要调用 useLanguage() 读当前语言状态，这个必须在浏览器里跑。
  注意：客户端组件依然会先在服务端渲染成 HTML，所以 SEO 不受影响。
*/

import Hero from "@/components/home/Hero";
import DataCard from "@/components/cards/DataCard";
import NetworkCard from "@/components/cards/NetworkCard";
import InsightCard from "@/components/cards/InsightCard";
import CompanyCard from "@/components/cards/CompanyCard";
import ToolCard from "@/components/cards/ToolCard";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
// 内容数据全部来自 lib/data —— 它背后是 data/*.json，数量和文案改那里即可
import {
  SNAPSHOT,
  NETWORK_MODULES,
  INSIGHTS,
  COMPANIES,
  TOOLS,
} from "@/lib/data";

// 卡片网格间距也统一，避免每个区块自己定 gap
const GRID = "grid gap-4";

export default function Home() {
  const { language, dict } = useLanguage();

  return (
    <>
      {/* ---------- 2. Hero ---------- */}
      <Hero content={dict.hero} />

      {/* ---------- 3. Global Snapshot ---------- */}
      <Section>
        <SectionHeader
          eyebrow={dict.snapshot.eyebrow}
          title={dict.snapshot.title}
          // Demo Data 标签放进标题自带的右上角插槽，页面不用再拼 flex
          action={<DemoBadge label={dict.snapshot.demoBadge} />}
        />

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
        <SectionHeader
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
        <SectionHeader
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
        <SectionHeader
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
              href={company.href}
            />
          ))}
        </div>
      </Section>

      {/* ---------- 7. Tools ---------- */}
      <Section>
        <SectionHeader
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
              href={tool.href}
            />
          ))}
        </div>

        {/* 诚实标注：不要把简单公式包装成企业级预测系统 */}
        <p className="mt-6 text-small text-mist">{dict.tools.disclaimer}</p>
      </Section>
    </>
  );
}
