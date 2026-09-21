import type { Metadata } from "next";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Global",
  description: "Observe the global supply network by country, trade, port and logistics.",
};

// 占位页：结构已经在用 Design System（Section + 字号令牌），内容等 TASK 03 填
export default function GlobalPage() {
  return (
    <Section>
      <p className="font-medium tracking-[0.3em] text-caption text-mist uppercase">
        Global
      </p>
      <h1 className="mt-4 text-h1 text-ink">GLOBAL NETWORK</h1>
      <p className="mt-4 max-w-2xl text-body text-mist">
        Countries, trade flows, ports and logistics — the building blocks of the
        global supply network.
      </p>
      <p className="mt-10 border-t border-line pt-6 text-caption text-mist">
        Page content is planned for an upcoming task. (TASK 01: layout only)
      </p>
    </Section>
  );
}
