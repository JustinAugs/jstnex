/*
  data/home.ts — 首页的「内容库」

  为什么要单独拆一个文件？
  组件负责「怎么显示」，这个文件负责「显示什么」。
  以后要改文案、加公司、加工具，只改这里，组件代码一行都不用动；
  再往后这些数据可以直接换成 JSON 或数据库查询结果，页面也不用重写。

  双语约定：
  需要翻译的字段写成 { en: "...", zh: "..." }（类型叫 LocalizedText）。
  不需要翻译的字段保持普通字符串，例如数字、单位、公式、公司品牌名。
*/

import type { LocalizedText } from "@/lib/i18n";

/* ---------- 3. Global Snapshot ---------- */

export type SnapshotItem = {
  label: LocalizedText; // 指标名称，例如 Global Trade / 全球贸易
  value: string; // 数值，例如 $24.0（数字不翻译）
  unit?: string; // 单位，例如 T / M TEU（可选）
  note: LocalizedText; // 一句话说明
};

// 前三项共用同一句「这是示例数据」的说明，抽出来避免重复写三遍
const SAMPLE_NOTE: LocalizedText = {
  en: "Sample figure — not a live statistic",
  zh: "示例数值 — 非实时统计",
};

// 重要：这些是「演示数字」，不是实时统计。
// 每一个都写明 note，页面上再挂 Demo Data 标签，绝不让读者误以为是实时数据。
export const SNAPSHOT: SnapshotItem[] = [
  {
    label: { en: "Global Trade", zh: "全球贸易" },
    value: "$24.0",
    unit: "T",
    note: SAMPLE_NOTE,
  },
  {
    label: { en: "Container Shipping", zh: "集装箱运输" },
    value: "180",
    unit: "M TEU",
    note: SAMPLE_NOTE,
  },
  {
    label: { en: "Major Ports", zh: "主要港口" },
    value: "850",
    note: SAMPLE_NOTE,
  },
  {
    label: { en: "Countries", zh: "国家与地区" },
    value: "195+",
    note: {
      en: "Recognised states and territories",
      zh: "被广泛承认的国家与地区",
    },
  },
];

/* ---------- 4. Global Network ---------- */

export type NetworkModule = {
  title: LocalizedText;
  description: LocalizedText;
  href: string; // 点击后去哪个页面
};

export const NETWORK_MODULES: NetworkModule[] = [
  {
    title: { en: "Trade", zh: "贸易" },
    description: { en: "Global import & export", zh: "全球进口与出口" },
    href: "/global",
  },
  {
    title: { en: "Logistics", zh: "物流" },
    description: { en: "Global transportation", zh: "全球运输体系" },
    href: "/global",
  },
  {
    title: { en: "Networks", zh: "网络" },
    description: { en: "Supply chain connections", zh: "供应链连接关系" },
    href: "/global",
  },
];

/* ---------- 5. Supply Chain Insights ---------- */

export type Insight = {
  title: LocalizedText;
  summary: LocalizedText; // 一句话讲清这篇讲什么（学生能看懂，不空泛）
  href: string;
};

export const INSIGHTS: Insight[] = [
  {
    title: { en: "Why Inventory Matters", zh: "为什么库存很重要" },
    summary: {
      en: "Inventory is capital standing still. Why firms hold it, what it really costs, and how it absorbs uncertainty.",
      zh: "库存就是静止不动的资金。企业为什么持有它、它的真实成本有多高，以及它如何吸收不确定性。",
    },
    href: "/supply-chain",
  },
  {
    title: { en: "What Is Just-in-Time?", zh: "什么是准时制（JIT）？" },
    summary: {
      en: "JIT removes waste by receiving goods only as they are needed — and leaves you exposed when the network breaks.",
      zh: "准时制只在需要时才收货，以此消除浪费 —— 但网络一旦中断，你也会立刻暴露在风险中。",
    },
    href: "/supply-chain",
  },
  {
    title: { en: "How Global Shipping Works", zh: "全球海运如何运作" },
    summary: {
      en: "From factory to port, vessel to shelf: the stages, documents and players behind a single container.",
      zh: "从工厂到港口、从船舶到货架：一个集装箱背后涉及的环节、单证与参与方。",
    },
    href: "/supply-chain",
  },
  {
    title: { en: "Supply Chain Risk Management", zh: "供应链风险管理" },
    summary: {
      en: "How to identify, assess and mitigate disruption before it reaches the customer.",
      zh: "如何在中断影响到客户之前，识别、评估并降低风险。",
    },
    href: "/supply-chain",
  },
];

/* ---------- 6. Companies ---------- */

export type Company = {
  name: string; // 品牌名不翻译
  sector: LocalizedText; // 行业标签
  focus: LocalizedText; // 主营业务
  supplyChainModel: LocalizedText; // 关键：从供应链角度理解这家公司
};

// 重点不是「公司百科」，而是每家公司怎么组织自己的网络与资产。
export const COMPANIES: Company[] = [
  {
    name: "DHL",
    sector: { en: "Express & Contract Logistics", zh: "快递与合同物流" },
    focus: {
      en: "Global express, forwarding and warehousing",
      zh: "全球快递、货运代理与仓储",
    },
    supplyChainModel: {
      en: "Owns the network: air hubs, ground fleets and warehouses run end to end.",
      zh: "重资产自建网络：航空枢纽、地面车队与仓库全程自控。",
    },
  },
  {
    name: "Maersk",
    sector: { en: "Ocean Shipping", zh: "海运" },
    focus: {
      en: "Container shipping and port terminals",
      zh: "集装箱运输与港口码头",
    },
    supplyChainModel: {
      en: "Controls both vessels and terminals, moving one box door to door.",
      zh: "同时掌控船舶与码头，让一个集装箱实现门到门运输。",
    },
  },
  {
    name: "UPS",
    sector: { en: "Parcel & Air Network", zh: "包裹与航空网络" },
    focus: {
      en: "Integrated parcel and air delivery",
      zh: "一体化的包裹与航空递送",
    },
    supplyChainModel: {
      en: "Hub-and-spoke network tuned for predictable, high-volume flows.",
      zh: "轴辐式网络，为可预测、大批量的货流量身调优。",
    },
  },
  {
    name: "FedEx",
    sector: { en: "Air Express", zh: "航空快递" },
    focus: { en: "Time-definite express delivery", zh: "限时承诺的快递服务" },
    supplyChainModel: {
      en: "Central hub model built around speed and strict cut-off times.",
      zh: "以速度和严格截件时间为核心构建的中央枢纽模式。",
    },
  },
  {
    name: "Kuehne+Nagel",
    sector: { en: "Freight Forwarding", zh: "货运代理" },
    focus: { en: "Sea and air freight forwarding", zh: "海运与空运货运代理" },
    supplyChainModel: {
      en: "Asset-light: buys capacity from others, sells coordination and visibility.",
      zh: "轻资产模式：向外购买运力，出售协调能力与可视化。",
    },
  },
];

/* ---------- 7. Tools ---------- */

export type Tool = {
  name: LocalizedText;
  description: LocalizedText;
  formula: string; // 数学符号，不需要翻译
};

export const TOOLS: Tool[] = [
  {
    name: { en: "EOQ Calculator", zh: "EOQ 经济订货批量计算器" },
    description: { en: "Economic Order Quantity", zh: "经济订货批量" },
    formula: "√(2DS / H)",
  },
  {
    name: { en: "Safety Stock Calculator", zh: "安全库存计算器" },
    description: { en: "Buffer against uncertainty", zh: "应对不确定性的缓冲" },
    formula: "(Max × Lead) − (Avg × Lead)",
  },
  {
    name: { en: "Inventory Turnover", zh: "库存周转率" },
    description: { en: "How fast stock sells", zh: "库存流转有多快" },
    formula: "COGS / Average Inventory",
  },
  {
    name: { en: "Reorder Point", zh: "再订货点" },
    description: {
      en: "When to place the next order",
      zh: "何时下达下一笔订单",
    },
    formula: "Demand × Lead Time + Safety Stock",
  },
];
