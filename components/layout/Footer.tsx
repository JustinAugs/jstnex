"use client";

/*
  Footer 也要 "use client"：因为它要用 useLanguage() 读当前语言的文案。
  （它虽然在服务器渲染的 layout 里，但被 LanguageProvider 包住了，所以能拿到语言状态。）

  样式走 Design System：容器 container-page，字号 text-* 令牌。
*/

import Link from "next/link";
import { useLanguage } from "../providers/LanguageProvider";

export default function Footer() {
  const { dict } = useLanguage();

  const footerLinks = [
    { href: "/global", label: dict.nav.global },
    { href: "/supply-chain", label: dict.nav.supplyChain },
    { href: "/companies", label: dict.nav.companies },
    { href: "/tools", label: dict.nav.tools },
  ];

  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:justify-between">
        <div>
          {/* 品牌名不翻译 */}
          <p className="text-body font-bold tracking-[0.25em] text-ink">
            JSTNEX
          </p>
          <p className="mt-3 font-medium tracking-label text-caption text-mist uppercase">
            {dict.footer.tagline}
          </p>
          <p className="mt-2 text-body text-ink">{dict.footer.slogan}</p>
        </div>

        <nav>
          <ul className="flex flex-col gap-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="tracking-label text-small uppercase text-mist transition-colors hover:text-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-caption text-mist md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {dict.footer.copyright}</p>
          <p>{dict.footer.demoNote}</p>
        </div>
      </div>
    </footer>
  );
}
