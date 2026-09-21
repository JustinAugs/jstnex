/*
  languageStore.ts — 语言「存储器」

  为什么需要这个文件？
  当前语言存在浏览器的 localStorage 里，它属于「React 之外的外部数据」。
  如果在 useEffect 里读它、再 setState，页面会多渲染一次（先英文后中文，还会闪），
  React 官方也不推荐这么写（ESLint 会报错）。

  正确做法是把语言放在 React 外面管，再用 useSyncExternalStore 订阅：
    subscribe        → 告诉 React「语言变了吗」
    getSnapshot      → 浏览器里当前是什么语言（第一次会去读 localStorage）
    getServerSnapshot→ 服务端渲染时用什么语言（默认英文）
*/

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "./index";

let currentLanguage: Language = DEFAULT_LANGUAGE;
let hasReadFromStorage = false;

// 所有正在监听语言变化的组件
const listeners = new Set<() => void>();

/** 判断从 localStorage 读出来的值是不是合法语言 */
function isLanguage(value: string | null): value is Language {
  return value === "zh" || value === "en";
}

/** 组件通过它订阅变化，返回的函数用于取消订阅 */
export function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** 浏览器端读取当前语言（第一次调用时顺便取回用户上次的设置） */
export function getSnapshot(): Language {
  if (!hasReadFromStorage) {
    hasReadFromStorage = true;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) {
      currentLanguage = stored;
    }
  }
  return currentLanguage;
}

/** 服务端渲染和首次 hydration 时用默认语言（英文） */
export function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

/** 切换语言：写入 localStorage，并通知所有组件重新渲染 */
export function setLanguage(next: Language) {
  currentLanguage = next;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}
