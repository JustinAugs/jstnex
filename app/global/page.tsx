import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global",
  description: "Observe the global supply network by country, trade, port and logistics.",
};

export default function GlobalPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-xs font-medium tracking-[0.3em] text-mist uppercase">
        Global
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
        GLOBAL NETWORK
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
        Countries, trade flows, ports and logistics — the building blocks of the
        global supply network.
      </p>
      <p className="mt-10 border-t border-line pt-6 text-xs text-mist">
        Page content is planned for an upcoming task. (TASK 01: layout only)
      </p>
    </div>
  );
}
