import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { buildMetadata } from "@/lib/seo";

/*
  layout.tsx 是「根布局」：所有页面都会被塞进这里的 children 里。
  Navbar 和 Footer 写在这里，就不需要在每个页面重复写一遍。

  metadata（SEO）现在统一由 @/lib/seo 的 buildMetadata() 生成：
  站点名、简介、地址、分享卡片都在那一个文件里维护，
  子页面只需要填自己的标题和一句话。
*/

export const metadata: Metadata = buildMetadata();

/*
  viewport —— 移动端显示方式，以及浏览器主题色。
  现在放在这里，是因为未来可能要根据品牌视觉调整 themeColor。
*/
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        {/* LanguageProvider 包住整个站点：Navbar、页面、Footer 都能拿到当前语言 */}
        <LanguageProvider>
          <Navbar />
          {/* flex-1 让主内容区撑开，把 Footer 顶到页面最底部 */}
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
