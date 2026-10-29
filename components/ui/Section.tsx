/*
  Section — 全站统一的区块容器（TASK 02.6 Design System）

  以前每个区块都要自己写：
    <section id={id} className="mx-auto max-w-6xl px-6 py-20 md:mt-24">
  宽度、左右留白、上下留白散落各处，很容易不一致。

  现在只要写：
    <Section>...</Section>
  它自动带上 container-page（统一宽度与左右留白）
  和 section-spacing（统一上下呼吸感）。
*/

import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

export default function Section({ children, id, className = "" }: SectionProps) {
  return (
    <section id={id} className={["container-page section-spacing", className].join(" ")}>
      {children}
    </section>
  );
}
