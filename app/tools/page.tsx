import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools",
  description: "Supply chain calculators: EOQ, safety stock, inventory turnover and reorder point.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-xs font-medium tracking-[0.3em] text-mist uppercase">
        Tools
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
        SUPPLY CHAIN TOOLS
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
        EOQ, Safety Stock, Inventory Turnover and Reorder Point — transparent
        formulas built for learning.
      </p>
      <p className="mt-10 border-t border-line pt-6 text-xs text-mist">
        Page content is planned for an upcoming task. (TASK 01: layout only)
      </p>
    </div>
  );
}
