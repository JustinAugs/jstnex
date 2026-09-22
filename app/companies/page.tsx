import CompanyDirectory from "@/components/companies/CompanyDirectory";
import { buildMetadata } from "@/lib/seo";

/*
  Companies 页面（TASK 05）

  这个文件刻意保持得很短，只做两件事：
    1. 导出 metadata（SEO）—— 统一用 buildMetadata，站点级配置在 lib/seo.ts
    2. 渲染页面内容组件

  为什么不把内容直接写在这里？
  和 Global 页同一个原因："use client" 的文件不允许 export const metadata，
  而整页文案都要跟随语言（语言状态在客户端），所以内容必须放在客户端组件里。

  为什么直接渲染 CompanyDirectory，不再加一层 XxxView？
  Supply Chain 页有三个并列区块（页头 / SCOR / 概念库），所以需要一个组合层把它们排好；
  Companies 页只有「页头 + 企业目录」一块，页头已经放进 CompanyDirectory 里
  （和 Global 页的 CountryDirectory 完全一致），再多一层就是多余抽象。

  这一页不做筛选逻辑、不加 "use client" —— 保持薄。
*/

export const metadata = buildMetadata({
  title: "Companies",
  description:
    "Companies explained through their role in global supply networks — by industry, region and supply chain role.",
  path: "/companies",
});

export default function CompaniesPage() {
  return <CompanyDirectory />;
}
