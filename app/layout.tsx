import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

/*
  layout.tsx 是「根布局」：所有页面都会被塞进这里的 children 里。
  Navbar 和 Footer 写在这里，就不需要在每个页面重复写一遍。
*/

export const metadata: Metadata = {
  // template 会让子页面只需要写 title: "Global"，最终显示成 "Global | JSTNEX"
  title: {
    default: "JSTNEX — Global Supply Network Intelligence",
    template: "%s | JSTNEX",
  },
  description:
    "JSTNEX maps how the world moves — global trade, logistics, ports, companies and supply networks.",
  applicationName: "JSTNEX",
  keywords: [
    "supply chain",
    "global trade",
    "logistics",
    "ports",
    "supply network intelligence",
  ],
  openGraph: {
    title: "JSTNEX — Global Supply Network Intelligence",
    description: "Mapping How The World Moves.",
    siteName: "JSTNEX",
    type: "website",
  },
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
