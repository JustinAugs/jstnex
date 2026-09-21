/*
  lib/i18n/index.ts — 双语系统的入口

  这个文件负责三件事：
  1. 定义 Language 类型（目前支持 zh / en，以后加日语只要在这里加一个值）
  2. 把两个语言的字典汇总成 dictionaries
  3. 提供 pick() 小工具：从 { en: "...", zh: "..." } 里按当前语言取出对应文字
*/
import en from "./en";
import zh from "./zh";

export type Language = "zh" | "en";

/** 语言切换器里显示的顺序：中文在前，EN 在后 */
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "zh", label: "中文" },
  { code: "en", label: "EN" },
];

/** 默认英文 —— JSTNEX 是全球化定位 */
export const DEFAULT_LANGUAGE: Language = "en";

/** localStorage 的键名：用户选过语言后，刷新仍然保留 */
export const LANGUAGE_STORAGE_KEY = "jstnex-language";

/** 以英文字典为准推导类型，zh.ts 必须长成一样的形状 */
export type Dictionary = typeof en;

export const dictionaries: Record<Language, Dictionary> = { en, zh };

/**
 * LocalizedText：一段「同时有中英文」的文字。
 * 例如 { en: "Global Trade", zh: "全球贸易" }
 */
export type LocalizedText = Record<Language, string>;

/** 按当前语言取出文字 */
export function pick(text: LocalizedText, language: Language): string {
  return text[language];
}
