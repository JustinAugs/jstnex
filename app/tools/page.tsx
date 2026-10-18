import ToolDirectory from "@/components/tools/ToolDirectory";
import { buildMetadata } from "@/lib/seo";

// 页面级的 SEO 信息统一用 buildMetadata 生成（站点级配置在 lib/seo.ts）
export const metadata = buildMetadata({
  title: "Tools",
  description:
    "Supply chain calculators: EOQ, safety stock, inventory turnover and reorder point, with formulas and assumptions shown.",
  path: "/tools",
});

/*
  服务端薄壳：只负责 metadata + 渲染客户端组件。
  为什么真正的页面内容在 ToolDirectory 里？
  因为计算器要切换、要读语言状态，必须是客户端组件；
  而 "use client" 的文件不能 export metadata，所以拆成两层。
*/
export default function ToolsPage() {
  return <ToolDirectory />;
}
