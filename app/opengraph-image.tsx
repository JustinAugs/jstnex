/*
  app/opengraph-image.tsx — Open Graph 分享图（TASK 02.11）

  这是什么？
  把 JSTNEX 的链接贴到微信 / Notion / Twitter / Slack 时，对方看到的那张卡片配图。
  Next.js 有个约定：只要在这里放一个叫 opengraph-image 的文件，
  它会自动接管 og:image，并在页面上生成正确的 <meta> 标签，不需要我们手写。

  为什么用代码画图，而不是放一张 PNG？
  因为我们现在还没有正式的品牌视觉稿。用代码画的版本可以随时改（改完重新部署即可），
  而且它用的是「和网站一致的品牌色」，不会跑偏。将来设计好正式 OG 图，
  把这个文件删掉、放一张 static（静态图）进去就行。

  注意两个限制（Satori 这个画图引擎的脾气）：
  1. 这里不能用 Tailwind 的 className，样式必须写成内联 style
  2. 每个有子元素的容器都要显式写 display: "flex"
  3. 字体要显式指定，所以文案用英文（中文需要额外加载字体文件）
*/

import { ImageResponse } from "next/og";

// 图片尺寸：1200×630 是业界通用的 OG 图规格
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "JSTNEX — Global Supply Network Intelligence";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // 品牌黑做底，和网站的配色保持一致
          backgroundColor: "#0A0A0A",
          padding: "80px",
        }}
      >
        {/* 左上：品牌名。宽字距是 JSTNEX 的视觉特征，这里必须保留 */}
        <div
          style={{
            display: "flex",
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "0.25em",
            color: "#FFFFFF",
          }}
        >
          JSTNEX
        </div>

        {/* 中间：定位 + Slogan */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* 这一根深蓝细线是唯一的强调色 —— 深蓝只做点缀，这也是品牌规范 */}
          <div
            style={{
              display: "flex",
              width: 120,
              height: 4,
              backgroundColor: "#0A2F5C",
              marginBottom: 32,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 600,
              lineHeight: 1.1,
              color: "#FFFFFF",
              maxWidth: 860,
            }}
          >
            Global Supply Network Intelligence
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#9A9A9A",
              marginTop: 20,
            }}
          >
            Mapping How The World Moves.
          </div>
        </div>

        {/* 底部：一行小字说明这是独立学生项目 */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#6B6B6B",
            letterSpacing: "0.08em",
          }}
        >
          INDEPENDENT STUDENT PROJECT
        </div>
      </div>
    ),
    size,
  );
}
