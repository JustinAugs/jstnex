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
  featuredConcepts,
  COMPANIES,
  regionKey,
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
          {/*
            数据来自 concepts.json 里 featured = true 的那几条 ——
            和 Supply Chain 页是同一份数据，不留两份内容各自维护。
            跳转目标固定为 /supply-chain（V1 还没有概念详情子页）。
          */}
          {featuredConcepts().map((concept) => (
            <InsightCard
              key={concept.id}
              title={pick(concept.title, language)}
              summary={pick(concept.summary, language)}
              href="/supply-chain"
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
          {/*
            TASK 05 起，首页和 Companies 页读同一份 data/companies.json。
            这里只取前 6 家（companies.json 的前 6 条刻意覆盖了不同行业 / 角色 / 大区），
            保持和改造前接近的两行卡片密度，完整列表留给 /companies。
          */}
          {COMPANIES.slice(0, 6).map((company) => (
            <CompanyCard
              key={company.id}
              name={pick(company.name, language)}
              industry={dict.companies.industries[company.industry]}
              role={dict.companies.roles[company.role]}
              country={pick(company.country, language)}
              region={dict.regions[regionKey(company.region)]}
              summary={pick(company.summary, language)}
              keyActivities={company.keyActivities.map((activity) =>
                pick(activity, language),
              )}
              strength={pick(company.supplyChainStrength, language)}
              risk={pick(company.supplyChainRisk, language)}
              labels={dict.companies.labels}
              // 沿用改造前的行为：首页卡片点进去是 /companies（真实存在的页面，不是死链）
              href="/companies"
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
