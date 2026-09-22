import CountryDirectory from "@/components/global/CountryDirectory";
import { buildMetadata } from "@/lib/seo";

/*
  Global 页面（TASK 03）

  这个文件刻意保持得很短，只做两件事：
    1. 导出 metadata（SEO 信息）—— 统一用 buildMetadata 生成，站点级配置在 lib/seo.ts
    2. 渲染真正的页面内容组件

  为什么不把内容也写在这里？
  因为内容组件需要筛选交互，必须是客户端组件（"use client"）；
  而客户端组件里不允许 export metadata。两者不能混在一个文件里。
  所以：这个服务端外壳负责 SEO，交互部分在 components/global/CountryDirectory.tsx。
*/

export const metadata = buildMetadata({
  title: "Global",
  description:
    "Observe the global supply network by country, trade, port and logistics.",
  path: "/global",
});

export default function GlobalPage() {
  return <CountryDirectory />;
}
