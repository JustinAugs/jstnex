"use client";

/*
  CountryDirectory —— Global 页面的「国家目录」（列表 + 大区筛选）

  为什么这个组件单独一个文件，而不是直接写在 app/global/page.tsx 里？

  因为筛选要记住「你现在选的是 Asia」，这需要 React 的 useState，
  而 useState 只能在客户端组件里用 —— 文件必须加 "use client"。

  但 Next.js 有一条硬规则：
    加了 "use client" 的文件，不能再 export const metadata。
    （metadata 必须在服务端生成，浏览器里跑的代码没法交给搜索引擎）

  所以分工是这样：
    app/global/page.tsx          服务端组件 —— 只负责 SEO 信息，再渲染这个组件
    components/global/CountryDirectory.tsx  客户端组件 —— 负责交互和内容

  这是 Next.js 最常见的写法：外壳留在服务端，交互拆到客户端。
*/

import SegmentedControl from "@/components/ui/SegmentedControl";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import DemoBadge from "@/components/ui/DemoBadge";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateBlock";
import CountryCard from "@/components/cards/CountryCard";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import { COUNTRIES, REGIONS, regionKey } from "@/lib/data";
import type { Region } from "@/lib/data";

/* 筛选状态的一种特殊值：不筛选，显示全部 */
const ALL = "all";

/*
  ------------------------------------------------------------------
  TASK 07.02 G-02：把筛选状态放在组件外面，返回目录时不丢
  ------------------------------------------------------------------
  原来的问题：筛选值存在组件的 useState 里。用户从目录点进国家详情页时，
  CountryDirectory 被卸载；点「返回」再回来时组件重新挂载，useState 回到
  ALL —— 刚才选的「欧洲」没了，8 张卡全部重新出现。

  为什么放在模块级变量，而不是 localStorage / URL 参数？
    · localStorage：刷新也保留，但「直接新开页面应默认全部」就不再成立，
      而且会跨标签页共享一个筛选状态，语义上过重。
    · URL 参数（?region=Europe）：可分享，但要改路由行为、处理未知参数、
      canonical 也会受影响 —— 审计报告（G-02 推荐方案）刻意避开这条。
    · 模块级变量：只在「同一个页面会话内的客户端导航」中保留；
      刷新或新开标签页自然回到 ALL。正好符合审计的验收标准。

  为什么用 useSyncExternalStore 而不是 useState + useEffect 读回？
    首页/目录页是构建时预渲染的静态 HTML（筛选默认 ALL）。若在 hydration
    时用 useState 的初始值直接读模块变量，客户端首个 render 可能和预渲染
    HTML 不一致，触发 hydration mismatch；而在 useEffect 里 setState 又被
    React 19 的 lint 规则禁止（会多渲染一次并闪烁）。
    useSyncExternalStore 的正确用法：hydration 先用 getServerSnapshot（ALL）
    保证与 HTML 一致，hydration 完成后再切到客户端快照（可能已选欧洲）。
    与 lib/i18n/languageStore.ts 的模式一致。
*/
let savedRegion: string | null = null;
let directoryReturn: { href: string; y: number } | null = null;

const regionListeners = new Set<() => void>();

function subscribeRegion(onChange: () => void) {
  regionListeners.add(onChange);
  return () => {
    regionListeners.delete(onChange);
  };
}

function getRegionSnapshot(): string | null {
  return savedRegion;
}

/** 服务端渲染与首次 hydration 用 null（= ALL），保证和预渲染 HTML 一致 */
function getRegionServerSnapshot(): string | null {
  return null;
}

function setSavedRegion(next: string) {
  savedRegion = next;
  regionListeners.forEach((listener) => listener());
}

export default function CountryDirectory() {
  // Align after hydration/fonts settle; translated content can change section positions.
  useEffect(() => {
    let cancelled = false;
    const align = () => {
      const id = window.location.hash.slice(1);
      if (["country-directory", "port-directory", "network-exploration"].includes(id)) {
        requestAnimationFrame(() => {
          if (!cancelled) document.getElementById(id)?.scrollIntoView({ block: "start" });
        });
      }
    };
    void document.fonts.ready.then(align);
    window.addEventListener("hashchange", align);
    return () => { cancelled = true; window.removeEventListener("hashchange", align); };
  }, []);

  const { language, dict } = useLanguage();

  /*
    当前选中的大区：优先用模块里记住的值（从详情页返回时还在），
    否则 ALL。selected 不再有本地 state —— 单一数据源，UI 与实际过滤
    结果不可能不一致。
  */
  const rememberedRegion = useSyncExternalStore(
    subscribeRegion,
    getRegionSnapshot,
    getRegionServerSnapshot,
  );
  const selected = rememberedRegion ?? ALL;

  useEffect(() => {
    const destination = directoryReturn;
    if (!destination || window.location.hash) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (cancelled) return;
        const link = Array.from(document.querySelectorAll<HTMLAnchorElement>("#country-directory a"))
          .find((element) => element.getAttribute("href") === destination.href);
        if (!link) return;
        link.focus({ preventScroll: true });
        window.scrollTo({ top: destination.y, behavior: "instant" });
        directoryReturn = null;
      }));
    });
    return () => { cancelled = true; };
  }, [selected]);

  // 根据选中项算出「这次要显示哪些国家」
  const visible =
    selected === ALL
      ? COUNTRIES
      : COUNTRIES.filter((country) => country.region === selected);

  /*
    筛选按钮有两种值：「全部」和某个大区。
    TASK 08.01 起 regionKey() 只接受 `Region`（不再接受任意 string），
    所以这里把参数类型写清楚：`typeof ALL | Region`。
    写成 string 的话，regionKey(region) 就编译不过了 —— 这正是我们想要的约束。
  */
  const countOf = (region: typeof ALL | Region) =>
    region === ALL
      ? COUNTRIES.length
      : COUNTRIES.filter((country) => country.region === region).length;

  /*
    按钮上的文字：
    ALL 显示「全部 / All」，其余显示字典里翻译好的地区名。
    字典的 key 由 lib/data 的 regionKey() 从 "North America" 这种英文值换算得来。
  */
  const labelOf = (region: typeof ALL | Region) =>
    region === ALL
      ? dict.global.filterAll
      : dict.regions[regionKey(region)];

  /* 「全部」+ 数据里出现过的大区。显式标类型，避免字面量被放宽成 string[] */
  const regionFilters: (typeof ALL | Region)[] = [ALL, ...REGIONS];

  return (
    <>
    <Section id="country-directory" className="atlas-workspace scroll-mt-24">
      <SectionHeader
        title={dict.global.title}
        description={dict.global.description}
        // 页面唯一主标题用 h1（G-01）；视觉仍是 text-h2，只改语义
        headingLevel="h1"
        // Demo Data 标签放进标题自带的右上角插槽
        action={<DemoBadge label={dict.global.demoBadge} />}
      />

      {/* ---------- 大区筛选 ---------- */}
      <SegmentedControl
        label={dict.global.filterLabel}
        options={regionFilters.map(region => ({ value: region, label: <>{labelOf(region)} <span className="segment-count">{countOf(region)}</span></> }))}
        value={selected}
        onChange={setSavedRegion}
      />

      <nav aria-label={dict.global.title} className="atlas-chapters my-5 flex flex-wrap gap-2 text-small font-medium text-deep">
        <a href="#country-directory">{dict.review.countries}</a><a href="#port-directory">{dict.review.ports}</a><a href="#network-exploration">{dict.review.explore}</a>
      </nav>
      <p className="text-small text-mist">{dict.review.countryScope}</p>
      {/* 当前显示多少个 */}
      <p role="status" className="mt-6 text-small text-mist">
        {visible.length} {dict.global.countLabel}
      </p>

      {/* ---------- 国家卡片网格 ---------- */}
      {visible.length === 0 ? (
        // 现在的数据一定筛得出来，这里是为将来数据变动态准备的保险
        <EmptyState className="mt-6" />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          onClickCapture={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
            if (link) directoryReturn = { href: link.getAttribute("href")!, y: window.scrollY };
          }}
        >
          {visible.map((country) => (
            <CountryCard
              key={country.code}
              code={country.code}
              // 详情页链接：小写 ISO code，例如 /global/cn
              href={`/global/${country.code.toLowerCase()}`}
              // pick() 从 { en, zh } 里取出当前语言的那一条
              name={pick(country.name, language)}
              region={dict.regions[regionKey(country.region)]}
              role={pick(country.role, language)}
              summary={pick(country.summary, language)}
              exports={pick(country.exports, language)}
              strength={pick(country.strength, language)}
              risk={pick(country.risk, language)}
              ports={country.ports}
              actionLabel={dict.global.cardAction}
              labels={dict.global.labels}
            />
          ))}
        </div>
      )}

      {/* 数据说明：明确告诉读者这些描述不是官方统计 */}
      <p className="mt-10 border-t border-line pt-6 text-caption text-mist">
        {dict.global.note}
      </p>
    </Section>
    <Section id="port-directory" className="scroll-mt-24">
      <SectionHeader title={dict.global.exploration.portsTitle} description={dict.global.exploration.portsNote} />
      <div className="grid gap-4 md:grid-cols-2">
        {COUNTRIES.map((country) => (
          <details key={country.code} className="atlas-disclosure border-b border-line py-4">
            <summary className="cursor-pointer text-small font-medium text-ink">{pick(country.name, language)} <span className="text-mist">({country.ports.length})</span></summary>
            <ul className="mt-3 flex flex-col gap-2 text-small text-mist">{country.ports.map((port) => <li key={port}>{port}</li>)}</ul>
          </details>
        ))}
      </div>
    </Section>
    <Section id="network-exploration" className="scroll-mt-24">
      <SectionHeader title={dict.global.exploration.networkTitle} description={dict.global.exploration.networkNote} />
      <div className="flex flex-wrap gap-4">
        <Link href="/companies" className={buttonStyles({variant:"secondary"})}>{dict.global.exploration.companies}</Link>
        <Link href="/supply-chain" className={buttonStyles({variant:"secondary"})}>{dict.global.exploration.concepts}</Link>
      </div>
    </Section>
    </>
  );
}
