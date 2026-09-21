import Section from "@/components/ui/Section";
import { buildMetadata } from "@/lib/seo";

// 页面的 SEO 信息统一用 buildMetadata 生成（站点级配置在 lib/seo.ts）
export const metadata = buildMetadata({
  title: "Companies",
  description:
    "Global supply network companies, explained from a supply chain perspective.",
  path: "/companies",
});

// 占位页：结构已经在用 Design System（Section + 字号令牌），内容等后续任务填
export default function CompaniesPage() {
  return (
    <Section>
      <p className="font-medium tracking-label text-caption text-mist uppercase">
        Companies
      </p>
      <h1 className="mt-4 text-h1 text-ink">GLOBAL SUPPLY NETWORK COMPANIES</h1>
      <p className="mt-4 max-w-2xl text-body text-mist">
        DHL, Maersk, UPS, FedEx and Kuehne+Nagel — understood through their
        networks, assets and supply chain models.
      </p>
      <p className="mt-10 border-t border-line pt-6 text-caption text-mist">
        Page content is planned for an upcoming task. (TASK 01: layout only)
      </p>
    </Section>
  );
}
