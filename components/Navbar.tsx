"use client";

/*
  "use client" 表示这个组件在浏览器里运行（客户端组件）。
  原因：用到了 useState（保存菜单是否打开）、usePathname（读取当前网址），
  以及 useLanguage（读取当前语言）—— 这些都只能在浏览器里工作。
*/

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

export default function Navbar() {
  const pathname = usePathname(); // 当前页面路径，例如 /global
  const [isMenuOpen, setIsMenuOpen] = useState(false); // false = 手机菜单关闭
  const { dict } = useLanguage();

  /*
    导航文字从「当前语言的字典」里取。
    dict.nav.home 在英文下是 "Home"，中文下是 "首页"。
    所以切语言时，导航、页面、Footer 会一起变，不会只变一半。
  */
  const navLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/global", label: dict.nav.global },
    { href: "/supply-chain", label: dict.nav.supplyChain },
    { href: "/companies", label: dict.nav.companies },
    { href: "/tools", label: dict.nav.tools },
  ];

  // 判断某个导航项是不是当前页面：首页要精确匹配，其他页面用前缀匹配
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* 文字 Logo：品牌名不翻译，任何语言下都显示 JSTNEX */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="text-lg font-bold tracking-[0.25em] text-ink"
        >
          JSTNEX
        </Link>

        {/* 右侧一组：桌面导航 + 语言切换 + 手机汉堡按钮 */}
        <div className="flex items-center gap-6">
          {/* 桌面端导航：md 以下隐藏（手机上不显示） */}
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
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

          {/* 语言切换：桌面和手机都显示 */}
          <LanguageSwitcher />

          {/* 手机端汉堡按钮：md 以上隐藏 */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={dict.nav.openMenu}
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
        </div>
      </nav>

      {/* 手机端展开的菜单：isMenuOpen 为 true 时才渲染 */}
      {isMenuOpen && (
        <ul className="border-t border-line bg-white px-6 py-4 md:hidden">
          {navLinks.map((link) => (
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
