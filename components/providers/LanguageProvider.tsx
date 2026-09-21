"use client";

/*
  LanguageProvider — 全站语言状态的「广播站」

  为什么要这个东西？
  因为 Navbar 里点了「中文」之后，首页、Footer 都要跟着变。
  如果让它们各自去读 localStorage，代码就会重复且不同步。
  所以用 React 的 Context（上下文）：Provider 存一份状态，
  任何组件用 useLanguage() 就能拿到当前语言 + 对应字典。

  "use client" 是必须的：Context、useSyncExternalStore 都只能在浏览器里工作。
*/

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary, type Language } from "@/lib/i18n";
import {
  getServerSnapshot,
  getSnapshot,
  setLanguage as storeSetLanguage,
  subscribe,
} from "@/lib/i18n/languageStore";

type LanguageContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
  dict: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  /*
    useSyncExternalStore 的三个参数：
      1. subscribe         —— 语言变化时通知 React
      2. getSnapshot       —— 浏览器里当前是什么语言（第一次会读 localStorage）
      3. getServerSnapshot —— 服务端渲染时用什么语言（默认英文）

    好处：刷新页面时能立刻拿到用户上次选的语言，
    不用像 useEffect 那样「先渲染英文、再改成中文」多渲染一次。
  */
  const language = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // 同步 <html lang="...">，对屏幕阅读器和 SEO 有用
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  // useMemo：只在 language 变化时才重新创建对象，避免无意义的重复渲染
  const value = useMemo(
    () => ({
      language,
      setLanguage: storeSetLanguage,
      dict: dictionaries[language],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/** 任何需要翻译的组件都调用它：const { language, dict } = useLanguage(); */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage 必须在 LanguageProvider 内部使用");
  }
  return context;
}
