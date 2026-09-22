"use client";

/*
  SupplyChainView —— Supply Chain 页面的内容组合层

  为什么需要这一层，而不是让 page.tsx 自己拼？

  因为整页的文案（页头、SCOR、概念库）都要跟着语言变，
  而 page.tsx 必须留在服务端导出 metadata（"use client" 不允许 export metadata）。
  所以：page.tsx 只管 SEO，这一层负责把三个区块按顺序列出来。

  这个「服务端外壳 + 客户端组合层」的写法，TASK 05 / 06 的页面会原样复用。
*/

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import ScorFramework from "./ScorFramework";
import ConceptLibrary from "./ConceptLibrary";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function SupplyChainView() {
  const { dict } = useLanguage();

  return (
    <>
      {/* 1. 页头：这一页回答什么问题 */}
      <Section>
        <SectionHeader
          eyebrow={dict.supplyChain.eyebrow}
          title={dict.supplyChain.title}
          description={dict.supplyChain.description}
        />
      </Section>

      {/* 2. SCOR 七个流程 —— 给整页一个坐标系 */}
      <ScorFramework />

      {/* 3. 概念库（含主题筛选） */}
      <ConceptLibrary />
    </>
  );
}
