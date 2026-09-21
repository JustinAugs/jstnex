"use client";

import { LANGUAGES } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

/*
  LanguageSwitcher — Navbar 右侧的「中文 | EN」
  当前语言用深蓝显示，另一个用灰色，hover 时变深蓝。
  中间的分隔线是一个 1px 的竖线（不是图标库，保持克制）。
*/
export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 font-medium tracking-label text-small uppercase">
      {LANGUAGES.map((item, index) => (
        <span key={item.code} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden className="h-3 w-px bg-line" />}
          <button
            type="button"
            onClick={() => setLanguage(item.code)}
            aria-current={language === item.code}
            className={
              language === item.code
                ? "text-deep"
                : "text-mist transition-colors hover:text-deep"
            }
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
}
