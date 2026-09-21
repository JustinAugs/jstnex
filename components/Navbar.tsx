"use client";

/*
  "use client" 表示这个组件在浏览器里运行（客户端组件）。
  原因：我们用到了 useState（保存菜单是否打开）和 usePathname（读取当前网址），
  这两个都只能在浏览器里工作，所以必须加这一行。
*/

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/global", label: "Global" },
  { href: "/supply-chain", label: "Supply Chain" },
  { href: "/companies", label: "Companies" },
  { href: "/tools", label: "Tools" },
];

export default function Navbar() {
  const pathname = usePathname(); // 当前页面路径，例如 /global
  const [isMenuOpen, setIsMenuOpen] = useState(false); // false = 手机菜单关闭

  // 判断某个导航项是不是当前页面：首页要精确匹配，其他页面用前缀匹配
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* 文字 Logo：宽字距 + 粗体，营造现代、国际化的观感 */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="text-lg font-bold tracking-[0.25em] text-ink"
        >
          JSTNEX
        </Link>

        {/* 桌面端导航：md 以下隐藏（手机上不显示） */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-xs font-medium tracking-[0.18em] uppercase transition-colors ${
                  isActive(link.href)
                    ? "text-deep"
                    : "text-mist hover:text-deep"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 手机端汉堡按钮：md 以上隐藏 */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-5 bg-ink transition-transform ${
              isMenuOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-ink transition-opacity ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-ink transition-transform ${
              isMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* 手机端展开的菜单：isMenuOpen 为 true 时才渲染 */}
      {isMenuOpen && (
        <ul className="border-t border-line bg-white px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="border-b border-line last:border-0">
              <Link
                href={link.href}
                onClick={() => setIsMenuOpen(false)} // 点完链接自动收起菜单
                className={`block py-3 text-xs font-medium tracking-[0.18em] uppercase ${
                  isActive(link.href) ? "text-deep" : "text-mist"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
