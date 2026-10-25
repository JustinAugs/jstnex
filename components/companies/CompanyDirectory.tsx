"use client";

/*
  CompanyDirectory — Companies 页面的企业目录（TASK 05 §8）

  和 Global 的 CountryDirectory、Supply Chain 的 ConceptLibrary 是同一个套路：
    useState 记住「现在选了什么」→ 算出可见列表 → 渲染卡片
  这样三个页面的交互体验是一致的，用户不用重新学。

  为什么它必须是客户端组件？
  两个原因：①筛选和搜索要记住状态；②所有文案要走 useLanguage() 取当前语言。

  个数怎么来的？
  一律用 countCompaniesByXxx() 从数据算出来，绝不手写死数字。
  以后往 companies.json 加一家公司，按钮上的数字自动跟着变。

  搜索怎么做的？
  把每家公司的「可被搜到的文字」拼成一个字符串（中英文名、所在地、
  行业与角色的显示名 + 内部 id），再做一次小写包含匹配。
  不用模糊搜索、不引第三方库 —— 13 条数据用不上，也更好懂。
*/

import { useState } from "react";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/StateBlock";
import CompanyCard from "@/components/cards/CompanyCard";
import CompanyFilters, { type FilterOption } from "./CompanyFilters";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import {
  COMPANIES,
  INDUSTRIES,
  COMPANY_ROLES,
  COMPANY_REGIONS,
  countCompaniesByIndustry,
  countCompaniesByRole,
  countCompaniesByRegion,
  regionKey,
} from "@/lib/data";
import type { Company, IndustryId, SupplyChainRoleId, CompanyRegion } from "@/lib/data";

/* 筛选状态的一种特殊值：不筛选，显示全部 */
const ALL = "all";

export default function CompanyDirectory() {
  const { language, dict } = useLanguage();

  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>(ALL);
  const [region, setRegion] = useState<string>(ALL);
  const [role, setRole] = useState<string>(ALL);

  const allLabel = dict.companies.filters.all;

  /* 把内部的英文 id 换成当前语言的显示名 —— 中文模式下不能把 "brand-integrator" 显示给用户 */
  const industryLabel = (id: IndustryId | typeof ALL) =>
    id === ALL ? allLabel : dict.companies.industries[id];

  const roleLabel = (id: SupplyChainRoleId | typeof ALL) =>
    id === ALL ? allLabel : dict.companies.roles[id];

  /* 大区复用 Global 那套：regionKey() 把 "North America" 换算成字典字段名 */
  const regionLabel = (id: CompanyRegion | typeof ALL) =>
    id === ALL ? allLabel : dict.regions[regionKey(id)];

  /*
    三组候选项，连显示名和计数一起交给筛选控件。

    为什么要先声明成 xxxIds 再 map，而不是直接写 [ALL, ...INDUSTRIES]？
    因为直接写在数组里时，TypeScript 会把字面量 "all" 放宽（widen）成普通的 string，
    整个数组就变成 string[]，再传给 industryLabel() 就类型不匹配了。
    先给数组标上明确类型，字面量就不会被放宽 —— 这是个很容易踩的小坑。
  */
  const industryIds: (IndustryId | typeof ALL)[] = [ALL, ...INDUSTRIES];
  const industryOptions: FilterOption[] = industryIds.map((id) => ({
    id,
    label: industryLabel(id),
    count: id === ALL ? COMPANIES.length : countCompaniesByIndustry(id),
  }));

  const regionIds: (CompanyRegion | typeof ALL)[] = [ALL, ...COMPANY_REGIONS];
  const regionOptions: FilterOption[] = regionIds.map((id) => ({
    id,
    label: regionLabel(id),
    count: id === ALL ? COMPANIES.length : countCompaniesByRegion(id),
  }));

  const roleIds: (SupplyChainRoleId | typeof ALL)[] = [ALL, ...COMPANY_ROLES];
  const roleOptions: FilterOption[] = roleIds.map((id) => ({
    id,
    label: roleLabel(id),
    count: id === ALL ? COMPANIES.length : countCompaniesByRole(id),
  }));

  /*
    每家公司「可被搜到的文字」。
    行业和角色同时放了内部 id 和当前语言的显示名：
    这样英文模式下搜 semiconductors 能中，中文模式下搜「半导体」也能中。
  */
  const haystack = (company: Company) =>
    [
      company.name.en,
      company.name.zh,
      company.country.en,
      company.country.zh,
      company.industry,
      industryLabel(company.industry),
      company.role,
      roleLabel(company.role),
    ]
      .join(" ")
      .toLowerCase();

  const query = search.trim().toLowerCase();

  /* 四个条件同时生效（AND）：三个筛选 + 搜索 */
  const visible = COMPANIES.filter((company) => {
    if (industry !== ALL && company.industry !== industry) return false;
    if (region !== ALL && company.region !== region) return false;
    if (role !== ALL && company.role !== role) return false;
    if (!query) return true;
    return haystack(company).includes(query);
  });

  return (
    <Section>
      {/*
        页头放在同一个 Section 里 —— 和 Global 页的 CountryDirectory 一致。
        最初版本页头是单独一个 Section，结果两段之间空出一大截，
        视觉上像断了；合并后页面是连续的一块。
      */}
      <SectionHeader
        eyebrow={dict.companies.page.eyebrow}
        title={dict.companies.page.title}
        description={dict.companies.page.description}
        // 页面唯一主标题用 h1（G-01）；视觉仍是 text-h2，只改语义
        headingLevel="h1"
      />

      <div className="mt-10">
        <CompanyFilters
        search={search}
        onSearchChange={setSearch}
        industry={industry}
        onIndustryChange={setIndustry}
        region={region}
        onRegionChange={setRegion}
        role={role}
        onRoleChange={setRole}
        industries={industryOptions}
        regions={regionOptions}
        roles={roleOptions}
        labels={{
          search: dict.companies.search.label,
          searchPlaceholder: dict.companies.search.placeholder,
          industry: dict.companies.filters.industry,
          region: dict.companies.filters.region,
          role: dict.companies.filters.role,
          filterByIndustry: dict.companies.filters.filterByIndustry,
          filterByRegion: dict.companies.filters.filterByRegion,
          filterByRole: dict.companies.filters.filterByRole,
        }}
        />
      </div>

      {/* 结果数量 —— 数字来自筛选后的数据，不是写死的 */}
      <p className="mt-6 text-caption text-mist">
        {visible.length} {dict.companies.page.countLabel}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title={dict.companies.empty.title}
          description={dict.companies.empty.description}
        />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((company) => (
            <CompanyCard
              key={company.id}
              name={pick(company.name, language)}
              industry={dict.companies.industries[company.industry]}
              role={dict.companies.roles[company.role]}
              country={pick(company.country, language)}
              region={dict.regions[regionKey(company.region)]}
              summary={pick(company.summary, language)}
              keyActivities={company.keyActivities.map((activity) =>
                pick(activity, language),
              )}
              strength={pick(company.supplyChainStrength, language)}
              risk={pick(company.supplyChainRisk, language)}
              labels={dict.companies.labels}
            />
          ))}
        </div>
      )}

      {/* 数据说明：讲清楚这一页给的是定性观察，不是财务数据 */}
      <p className="mt-10 border-t border-line pt-6 text-caption text-mist">
        {dict.companies.page.note}
      </p>
    </Section>
  );
}
