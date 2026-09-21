import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies",
  description: "Global supply network companies, explained from a supply chain perspective.",
};

export default function CompaniesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-xs font-medium tracking-[0.3em] text-mist uppercase">
        Companies
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
        GLOBAL SUPPLY NETWORK COMPANIES
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
        DHL, Maersk, UPS, FedEx and Kuehne+Nagel — understood through their
        networks, assets and supply chain models.
      </p>
      <p className="mt-10 border-t border-line pt-6 text-xs text-mist">
        Page content is planned for an upcoming task. (TASK 01: layout only)
      </p>
    </div>
  );
}
