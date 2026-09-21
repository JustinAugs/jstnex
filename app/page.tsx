import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import DataCard from "@/components/DataCard";

/*
  首页由 6 个区块组成。
  这些数组目前直接写在页面里（V1 阶段够用），
  后面的任务会把它们搬到 data/*.json，方便统一维护和接爬虫/数据库。
*/

// Global Snapshot：注意 — 这些是演示数字，不是实时统计
const SNAPSHOT = [
  { label: "Global Trade", value: "24.0", unit: "T USD", note: "Sample figure for layout only" },
  { label: "Container Shipping", value: "180", unit: "M TEU", note: "Sample figure for layout only" },
  { label: "Major Ports", value: "850", unit: "", note: "Sample figure for layout only" },
  { label: "Countries", value: "195+", unit: "", note: "Recognised states and territories" },
];

// Global Network：三个观察全球供应网络的角度
const NETWORK_MODULES = [
  {
    title: "Trade",
    description: "Global import & export",
  },
  {
    title: "Logistics",
    description: "Global transportation",
  },
  {
    title: "Networks",
    description: "Supply chain connections",
  },
];

// Supply Chain Insights：未来会进入 Supply Chain 知识库
const INSIGHTS = [
  "Why Inventory Matters",
  "What Is Just-in-Time?",
  "How Global Shipping Works",
  "Supply Chain Risk Management",
];

// Companies：第一版 5 家，重点是「从供应链角度理解企业」
const COMPANIES = [
  { name: "DHL", focus: "Global express & contract logistics" },
  { name: "Maersk", focus: "Ocean shipping & port terminals" },
  { name: "UPS", focus: "Integrated parcel & air network" },
  { name: "FedEx", focus: "Time-definite air express" },
  { name: "Kuehne+Nagel", focus: "Sea freight & air logistics" },
];

// Tools：V1.0 要实现的 4 个计算器
const TOOLS = [
  { name: "EOQ Calculator", description: "Economic Order Quantity" },
  { name: "Safety Stock Calculator", description: "Buffer against uncertainty" },
  { name: "Inventory Turnover", description: "COGS / Average Inventory" },
  { name: "Reorder Point", description: "When to place the next order" },
];

export default function Home() {
  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {/* ---------- Global Snapshot ---------- */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading
              eyebrow="Global Snapshot"
              title="The network in four numbers"
            />
            {/* 演示数据必须明确标注，不能假装成实时数据 */}
            <span className="border border-line px-3 py-1 text-xs font-medium tracking-[0.18em] text-mist uppercase">
              Demo Data
            </span>
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

        {/* ---------- Global Network ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Global Network"
            title="Three ways to see the world"
            description="Trade flows, transportation systems and the connections that bind them."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {NETWORK_MODULES.map((module) => (
              <div
                key={module.title}
                className="group border border-line p-6 transition-colors hover:border-ink"
              >
                <h3 className="text-sm font-semibold tracking-[0.18em] text-ink uppercase">
                  {module.title}
                </h3>
                <p className="mt-3 text-sm text-mist">{module.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Supply Chain Insights ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Supply Chain Insights"
            title="Start with the fundamentals"
            description="Short, practical explanations written for students — not textbook filler."
          />

          <ul className="divide-y divide-line border-y border-line">
            {INSIGHTS.map((title) => (
              <li key={title}>
                <Link
                  href="/supply-chain"
                  className="flex items-center justify-between py-5 transition-colors hover:bg-surface"
                >
                  <span className="text-sm font-medium text-ink">{title}</span>
                  {/* 箭头是纯 CSS 画的一条线 + 折角，不引入图标库 */}
                  <span
                    aria-hidden
                    className="h-px w-6 bg-mist transition-all group-hover:w-10"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Companies ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Companies"
            title="Global supply network companies"
            description="Understood through their networks, assets and supply chain models."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANIES.map((company) => (
              <div
                key={company.name}
                className="border border-line p-6 transition-colors hover:border-ink"
              >
                <h3 className="text-base font-semibold text-ink">
                  {company.name}
                </h3>
                <p className="mt-2 text-sm text-mist">{company.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Tools ---------- */}
        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Tools"
            title="Supply chain calculators"
            description="Simple, transparent formulas with the reasoning shown."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="border border-line p-6 transition-colors hover:border-ink"
              >
                <h3 className="text-sm font-semibold text-ink">{tool.name}</h3>
                <p className="mt-2 text-xs text-mist">{tool.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
