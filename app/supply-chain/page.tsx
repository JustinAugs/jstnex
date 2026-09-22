import SupplyChainView from "@/components/supplyChain/SupplyChainView";
import { buildMetadata } from "@/lib/seo";

/*
  Supply Chain 页面（TASK 04）

  这个文件刻意保持得很短，只做两件事：
    1. 导出 metadata（SEO）—— 统一用 buildMetadata，站点级配置在 lib/seo.ts
    2. 渲染页面内容组件

  为什么不把内容直接写在这里？
  "use client" 的文件不允许 export const metadata。
  而整页文案都要跟随语言（语言状态在客户端），所以内容必须放在客户端组件里。
  于是这里留在服务端负责 SEO，内容交给 components/supplyChain/SupplyChainView.tsx。

  这一页不做筛选逻辑、不加 "use client" —— 保持薄。
*/

export const metadata = buildMetadata({
  title: "Supply Chain",
  description:
    "Supply chain concepts, processes and metrics — how goods are sourced, made, moved and returned.",
  path: "/supply-chain",
});

export default function SupplyChainPage() {
  return <SupplyChainView />;
}
