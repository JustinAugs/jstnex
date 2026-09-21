"use client";

/*
  Footer 也要 "use client"：因为它要用 useLanguage() 读当前语言的文案。
  （它虽然在服务器渲染的 layout 里，但被 LanguageProvider 包住了，所以能拿到语言状态。）
*/

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

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
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:justify-between">
        <div>
          {/* 品牌名不翻译 */}
          <p className="text-base font-bold tracking-[0.25em] text-ink">
            JSTNEX
          </p>
          <p className="mt-3 text-xs font-medium tracking-[0.18em] text-mist uppercase">
            {dict.footer.tagline}
          </p>
          <p className="mt-2 text-sm text-ink">{dict.footer.slogan}</p>
        </div>

        <nav>
          <ul className="flex flex-col gap-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs tracking-[0.18em] uppercase text-mist transition-colors hover:text-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-mist md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {dict.footer.copyright}</p>
          <p>{dict.footer.demoNote}</p>
        </div>
      </div>
    </footer>
  );
}
