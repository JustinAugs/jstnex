/*
  lib/seo.ts — 全站 SEO 配置的唯一来源（TASK 02.11）

  为什么单独一个文件？
  以前每个页面的 metadata 各写各的，改一句 slogan 要翻四个文件。
  现在站点级的名字、简介、地址都在这里，页面只需要调用 buildMetadata()
  填自己的标题和一句话就够了。

  这件事影响什么？
  - 搜索结果里显示的标题和摘要
  - 把链接贴到微信 / Notion / Twitter 时生成的分享卡片（靠 Open Graph）
  - 浏览器标签页上的文字
*/

import type { Metadata } from "next";

/*
  站点地址。
  上线后把真实网址写进 .env.local 的 NEXT_PUBLIC_SITE_URL 即可；
  没配的时候退回 localhost，本地开发不会报错。

  关于 NEXT_PUBLIC_ 前缀：这个变量本来就是公开信息（网址），所以用前缀没问题。
  真正的密钥永远不加这个前缀 —— 见 README 的安全规则。
*/
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (
  rawSiteUrl && rawSiteUrl.length > 0 ? rawSiteUrl : "http://localhost:3000"
).replace(/\/$/, ""); // 去掉结尾多余的斜杠，拼路径时不会变成 //global

export const SITE_NAME = "JSTNEX";

/** 站点定位的一句话说明（英文 —— JSTNEX 是全球化定位） */
export const SITE_DESCRIPTION =
  "Explore global trade, supply chains, logistics, companies and supply network data with JSTNEX.";

export const SITE_TAGLINE = "Mapping How The World Moves.";

type BuildMetadataOptions = {
  /** 页面名，最终显示成 "页面名 | JSTNEX"；不传则用站点名 */
  title?: string;
  /** 这个页面的一句话说明 */
  description?: string;
  /** 路径，例如 "/global"；用于生成 canonical 和分享卡片链接 */
  path?: string;
};

/**
 * 生成一个页面完整的 metadata。
 *
 * 用法示例（app/global/page.tsx）：
 *   export const metadata = buildMetadata({
 *     title: "Global",
 *     description: "从国家、贸易、港口和物流角度观察全球供应网络。",
 *     path: "/global",
 *   });
 */
export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
}: BuildMetadataOptions = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Global Supply Network Intelligence`;
  const url = `${SITE_URL}${path}`;

  return {
    // metadataBase：让 openGraph 里的相对图片地址能被正确解析成绝对地址
    metadataBase: new URL(SITE_URL),
    title: title ?? {
      default: `${SITE_NAME} — Global Supply Network Intelligence`,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    // canonical：告诉搜索引擎「这个页面的正式地址是这个」，避免重复内容
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      // 这张图由 app/opengraph-image.tsx 动态生成，尺寸 1200×630
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Global Supply Network Intelligence`,
        },
      ],
    },
    twitter: {
      // summary_large_image：分享时显示大图卡片，而不是小小的链接
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
