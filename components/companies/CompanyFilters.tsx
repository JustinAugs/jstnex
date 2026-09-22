"use client";

/*
  CompanyFilters — Companies 页面的筛选控件（TASK 05 §9）

  它只负责「把控件画出来 + 把用户的选择告诉父组件」，自己不持有状态：
  当前选了什么由父组件 CompanyDirectory 用 useState 记着，通过 props 传进来。
  这种组件叫「受控组件」—— 好处是父组件随时知道完整状态，才能算出要显示哪些公司。

  为什么不直接用 <select> 下拉框？
  因为 design system 里现在用的是按钮组（Global 的大区、Supply Chain 的主题都是），
  沿用同一套视觉和交互，用户不用重新学；键盘 Tab + 回车也能用，无障碍没问题。

  为什么计数要显示在按钮上？
  和 Global / Supply Chain 页保持一致：让用户点之前就知道这一类有多少家，
  避免点进去发现是空的。计数由父组件从数据算好传进来，这里不自己算。
*/

import { useId } from "react";

import Input from "@/components/ui/Input";
import { buttonStyles } from "@/components/ui/Button";

/* 一个筛选按钮需要的三样东西：内部 id、显示名、这一类有多少家 */
export type FilterOption = {
  id: string;
  label: string;
  count: number;
};

type CompanyFiltersProps = {
  /* 搜索框 */
  search: string;
  onSearchChange: (value: string) => void;
  /* 三组筛选：当前选中的值 + 改值时调用的函数 */
  industry: string;
  onIndustryChange: (value: string) => void;
  region: string;
  onRegionChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  /* 每组的候选（含显示名与计数） */
  industries: FilterOption[];
  regions: FilterOption[];
  roles: FilterOption[];
  labels: {
    search: string;
    searchPlaceholder: string;
    industry: string;
    region: string;
    role: string;
    filterByIndustry: string;
    filterByRegion: string;
    filterByRole: string;
  };
};

/* 一组筛选按钮：上面一个小标题，下面一排可以横向换行的按钮 */
function FilterGroup({
  label,
  groupLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  groupLabel: string; // 给屏幕阅读器用的完整说明
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="font-medium tracking-label text-caption text-mist uppercase">
        {label}
      </p>
      <div
        role="group"
        aria-label={groupLabel}
        className="mt-3 flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              // aria-pressed 告诉屏幕阅读器这个按钮处于「选中 / 未选中」状态
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={buttonStyles({
                variant: active ? "secondary" : "ghost",
                size: "sm",
                className: active ? "" : "border border-line",
              })}
            >
              {option.label}
              <span className="ml-2 text-caption text-mist">{option.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CompanyFilters({
  search,
  onSearchChange,
  industry,
  onIndustryChange,
  region,
  onRegionChange,
  role,
  onRoleChange,
  industries,
  regions,
  roles,
  labels,
}: CompanyFiltersProps) {
  /*
    useId() 生成一个全页唯一的 id。
    为什么需要它？因为 <label> 要用 htmlFor 指向输入框，
    组件可能在页面上出现多次，写死 "search" 会撞车。
  */
  const searchId = useId();

  return (
    <div className="space-y-6">
      {/* ---------- 搜索 ---------- */}
      <div>
        <label
          htmlFor={searchId}
          className="font-medium tracking-label text-caption text-mist uppercase"
        >
          {labels.search}
        </label>
        <Input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={labels.searchPlaceholder}
          className="mt-3"
        />
      </div>

      {/* ---------- 三组筛选 ---------- */}
      <div className="grid gap-6 md:grid-cols-3">
        <FilterGroup
          label={labels.industry}
          groupLabel={labels.filterByIndustry}
          options={industries}
          value={industry}
          onChange={onIndustryChange}
        />
        <FilterGroup
          label={labels.region}
          groupLabel={labels.filterByRegion}
          options={regions}
          value={region}
          onChange={onRegionChange}
        />
        <FilterGroup
          label={labels.role}
          groupLabel={labels.filterByRole}
          options={roles}
          value={role}
          onChange={onRoleChange}
        />
      </div>
    </div>
  );
}
