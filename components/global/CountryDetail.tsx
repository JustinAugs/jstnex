"use client";

/*
  CountryDetail —— 国家详情页的客户端组件（TASK 06.12B）

  为什么详情页要拆成「服务端 page.tsx + 客户端 CountryDetail」两层？
  和 Global / Companies / Supply Chain 一样，因为要用 useLanguage() 读当前语言，
  而语言状态只在浏览器里 —— 带双语文案的组件必须是客户端组件。
  但客户端组件不允许 export metadata，所以 SEO 留在服务端 page.tsx。

  这个组件只负责「怎么显示」，数据由服务端 page.tsx 传入（已经带类型的 Country）。
  它自己用 pick(字段, language) 取出当前语言的那一条。
*/

import Link from "next/link";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import Field from "@/components/ui/Field";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import { regionKey, type Country } from "@/lib/data";

type CountryDetailProps = {
  country: Country;
};

export default function CountryDetail({ country }: CountryDetailProps) {
  const { language, dict } = useLanguage();

  const labels = dict.countryDetail.labels;

  return (
    <Section>
      {/* 返回 Global 目录的明确入口（顶部，一眼可见）
          文案是动作 + 目标（「返回国家目录」），本身就是清晰的可访问名称，
          不再额外加 aria-label —— 否则读屏器会把同一句读两遍。
          焦点环与按钮/卡片用同一套 focus-visible 规则（G-03 / G-04）。 */}
      <Link
        href="/global"
        className="inline-flex items-center gap-2 font-medium tracking-label text-caption text-deep uppercase transition-colors hover:text-deep-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {/* 一个朝左的小箭头，克制、不引入图标库 */}
        <span aria-hidden className="h-px w-5 bg-deep" />
        {dict.countryDetail.back}
      </Link>

      {/* 头部：代码 + 区域 + 国家名 + 供应链角色 */}
      <div className="mt-8 border-t border-ink pt-6">
        <div className="flex items-center gap-2">
          <Badge tone="accent">{country.code}</Badge>
          <Badge>{dict.regions[regionKey(country.region)]}</Badge>
        </div>

        <h1 className="mt-4 text-h1 text-ink">{pick(country.name, language)}</h1>

        {/* 角色用深蓝 —— 数据高亮（与 CountryCard 一致） */}
        <p className="mt-2 text-body font-medium text-deep">
          {pick(country.role, language)}
        </p>
      </div>

      {/* 简介 */}
      <p className="mt-8 max-w-2xl text-body text-mist">
        {pick(country.summary, language)}
      </p>

      {/* 字段区：复用 Field + @container，窄容器自动堆叠 */}
      <dl className="@container mt-10 border-t border-line">
        <Field label={labels.ports}>{country.ports.join(" · ")}</Field>
        <Field label={labels.exports}>{pick(country.exports, language)}</Field>
        <Field label={labels.strength}>
          {pick(country.strength, language)}
        </Field>
        <Field label={labels.risk}>{pick(country.risk, language)}</Field>
      </dl>

      {/* 数据说明：明确这些是定性描述，不是官方统计 */}
      <p className="mt-10 border-t border-line pt-6 text-caption text-mist">
        {dict.countryDetail.note}
      </p>
    </Section>
  );
}
