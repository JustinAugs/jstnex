import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import DataCard from "@/components/DataCard";
import DemoBadge from "@/components/DemoBadge";
import NetworkCard from "@/components/NetworkCard";
import InsightCard from "@/components/InsightCard";
import CompanyCard from "@/components/CompanyCard";
import ToolCard from "@/components/ToolCard";

// 首页的文字内容全部来自 data/home.ts
import {
  SNAPSHOT,
  NETWORK_MODULES,
  INSIGHTS,
  COMPANIES,
  TOOLS,
} from "@/data/home";

/*
  首页（Home）

  这一页现在只做一件事：把各个区块按顺序「组装」起来。
  所有文案在 data/home.ts，所有卡片样式在 components/ 下各自的组件里。
  好处：以后要改内容不用碰布局，要改样式不用翻数据。
*/
export default function Home() {
  return (
    <>
      {/* ---------- 2. Hero ---------- */}
      <Hero />

      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {/* ---------- 3. Global Snapshot ---------- */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              eyebrow="Global Snapshot"
              title="The network in four numbers"
            />
            {/* 演示数据必须明确标注 */}
            <DemoBadge />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SNAPSHOT.map((item) => (
              <DataCard
                key={item.label}
                label={item.label}
                value={item.value}
                unit={item.unit}
                note={item.note}
              />
            ))}
          </div>
        </section>

        {/* ---------- 4. Global Network ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Global Network"
            title="Three ways to see the world"
            description="Trade flows, transportation systems and the connections that bind them together."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {NETWORK_MODULES.map((module) => (
              <NetworkCard
                key={module.title}
                title={module.title}
                description={module.description}
                href={module.href}
              />
            ))}
          </div>
        </section>

        {/* ---------- 5. Supply Chain Insights ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Supply Chain Insights"
            title="Start with the fundamentals"
            description="Short, practical explanations written for students — not textbook filler."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {INSIGHTS.map((insight) => (
              <InsightCard
                key={insight.title}
                title={insight.title}
                summary={insight.summary}
                href={insight.href}
              />
            ))}
          </div>
        </section>

        {/* ---------- 6. Companies ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Companies"
            title="Global supply network companies"
            description="Understood through their networks, assets and supply chain models."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANIES.map((company) => (
              <CompanyCard
                key={company.name}
                name={company.name}
                sector={company.sector}
                focus={company.focus}
                supplyChainModel={company.supplyChainModel}
              />
            ))}
          </div>
        </section>

        {/* ---------- 7. Tools ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Tools"
            title="Supply chain calculators"
            description="Simple, transparent formulas with the reasoning shown."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <ToolCard
                key={tool.name}
                name={tool.name}
                description={tool.description}
                formula={tool.formula}
              />
            ))}
          </div>

          {/* 诚实标注：不要把简单公式包装成企业级预测系统 */}
          <p className="mt-6 text-xs leading-relaxed text-mist">
            Calculators use simplified educational models, not enterprise
            forecasting systems.
          </p>
        </section>
      </div>
    </>
  );
}
