import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain",
  description: "A knowledge base of supply chain concepts, from procurement to risk management.",
};

export default function SupplyChainPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-xs font-medium tracking-[0.3em] text-mist uppercase">
        Supply Chain
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
        SUPPLY CHAIN
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
        Procurement, manufacturing, inventory, warehousing, transportation,
        distribution and risk management.
      </p>
      <p className="mt-10 border-t border-line pt-6 text-xs text-mist">
        Page content is planned for an upcoming task. (TASK 01: layout only)
      </p>
    </div>
  );
}
