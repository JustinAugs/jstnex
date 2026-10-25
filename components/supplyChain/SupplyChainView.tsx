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

/*
  TASK 06.10：页头不再单独占一个 Section。

  原来的结构是这样的：
    <Section>页头</Section>       ← 391px 高，内容只有 159px，中间空了一大截
    <ScorFramework />             ← 又一个 Section（又一个 96px 上下留白）
    <ConceptLibrary />

  两段各带 96px 的上下留白，中间就凭空多出近 200px 的空白带，
  用户点进来要滚一下才看得到「七个流程」。

  现在把页头和 SCOR 放进同一个 Section —— 和 Global 的 CountryDirectory、
  Companies 的 CompanyDirectory 完全一致（那两个页面本来就是这么做的）。
  这样页面顶部是连续的一块，进入页面立刻看到流程。
*/
export default function SupplyChainView() {
  const { dict } = useLanguage();

  return (
    <>
      {/* 1 + 2. 页头 + SCOR 七个流程（同一区块） */}
      <Section>
        <SectionHeader
          eyebrow={dict.supplyChain.eyebrow}
          title={dict.supplyChain.title}
          description={dict.supplyChain.description}
          // 页面唯一主标题用 h1（G-01）；视觉仍是 text-h2，只改语义
          headingLevel="h1"
        />

        {/* SCOR：给整页一个坐标系 */}
        <ScorFramework />
      </Section>

      {/* 3. 概念库（含主题筛选） */}
      <ConceptLibrary />
    </>
  );
}
