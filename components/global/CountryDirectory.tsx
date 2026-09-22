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

import { useState } from "react";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import DemoBadge from "@/components/ui/DemoBadge";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateBlock";
import CountryCard from "@/components/cards/CountryCard";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import { COUNTRIES, REGIONS, regionKey } from "@/lib/data";

/* 筛选状态的一种特殊值：不筛选，显示全部 */
const ALL = "all";

export default function CountryDirectory() {
  const { language, dict } = useLanguage();

  // 当前选中的大区。默认是 ALL（全部）
  const [selected, setSelected] = useState<string>(ALL);

  // 根据选中项算出「这次要显示哪些国家」
  const visible =
    selected === ALL
      ? COUNTRIES
      : COUNTRIES.filter((country) => country.region === selected);

  /* 每个筛选按钮后面要显示的个数 */
  const countOf = (region: string) =>
    region === ALL
      ? COUNTRIES.length
      : COUNTRIES.filter((country) => country.region === region).length;

  /*
    按钮上的文字：
    ALL 显示「全部 / All」，其余显示字典里翻译好的地区名。
    字典的 key 由 lib/data 的 regionKey() 从 "North America" 这种英文值换算得来。
  */
  const labelOf = (region: string) =>
    region === ALL
      ? dict.global.filterAll
      : dict.regions[regionKey(region)];

  return (
    <Section>
      <SectionHeader
        eyebrow={dict.global.eyebrow}
        title={dict.global.title}
        description={dict.global.description}
        // Demo Data 标签放进标题自带的右上角插槽
        action={<DemoBadge label={dict.global.demoBadge} />}
      />

      {/* ---------- 大区筛选 ---------- */}
      <div
        role="group"
        aria-label={dict.global.filterLabel}
        className="flex flex-wrap gap-3"
      >
        {[ALL, ...REGIONS].map((region) => {
          const active = selected === region;
          return (
            <button
              key={region}
              type="button"
              // aria-pressed 告诉屏幕阅读器这个按钮处于「按下 / 选中」状态
              aria-pressed={active}
              onClick={() => setSelected(region)}
              className={buttonStyles({
                // 选中的用黑框（secondary），未选中的用弱化样式 + 细边框
                variant: active ? "secondary" : "ghost",
                size: "sm",
                className: active ? "" : "border border-line",
              })}
            >
              {labelOf(region)}
              <span className="ml-2 text-caption text-mist">
                {countOf(region)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 当前显示多少个 */}
      <p className="mt-6 text-caption text-mist">
        {visible.length} {dict.global.countLabel}
      </p>

      {/* ---------- 国家卡片网格 ---------- */}
      {visible.length === 0 ? (
        // 现在的数据一定筛得出来，这里是为将来数据变动态准备的保险
        <EmptyState className="mt-6" />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((country) => (
            <CountryCard
              key={country.code}
              code={country.code}
              // pick() 从 { en, zh } 里取出当前语言的那一条
              name={pick(country.name, language)}
              region={dict.regions[regionKey(country.region)]}
              role={pick(country.role, language)}
              summary={pick(country.summary, language)}
              exports={pick(country.exports, language)}
              strength={pick(country.strength, language)}
              risk={pick(country.risk, language)}
              ports={country.ports}
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
  );
}
