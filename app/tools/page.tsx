import type { Metadata } from "next";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Tools",
  description: "Supply chain calculators: EOQ, safety stock, inventory turnover and reorder point.",
};

// 占位页：结构已经在用 Design System（Section + 字号令牌），内容等后续任务填
export default function ToolsPage() {
  return (
    <Section>
      <p className="font-medium tracking-[0.3em] text-caption text-mist uppercase">
        Tools
      </p>
      <h1 className="mt-4 text-h1 text-ink">SUPPLY CHAIN TOOLS</h1>
      <p className="mt-4 max-w-2xl text-body text-mist">
        EOQ, Safety Stock, Inventory Turnover and Reorder Point — transparent
        formulas built for learning.
      </p>
      <p className="mt-10 border-t border-line pt-6 text-caption text-mist">
        Page content is planned for an upcoming task. (TASK 01: layout only)
      </p>
    </Section>
  );
}
