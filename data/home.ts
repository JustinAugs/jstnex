/*
  data/home.ts — 首页的「内容库」

  为什么要单独拆一个文件？
  组件负责「怎么显示」，这个文件负责「显示什么」。
  以后要改文案、加公司、加工具，只改这里，组件代码一行都不用动；
  再往后这些数据可以直接换成 JSON 或数据库查询结果，页面也不用重写。

  export type 定义的是「数据长什么样」——
  TypeScript 会在你写错字段名时立刻报错，这就是类型的作用。
*/

/* ---------- 3. Global Snapshot ---------- */

export type SnapshotItem = {
  label: string; // 指标名称，例如 Global Trade
  value: string; // 数值，例如 $24.0
  unit?: string; // 单位，例如 T / M TEU（可选）
  note: string; // 一句话说明
};

// 重要：这些是「演示数字」，不是实时统计。
// 每一个都写明 note，页面上再挂 Demo Data 标签，绝不让读者误以为是实时数据。
export const SNAPSHOT: SnapshotItem[] = [
  {
    label: "Global Trade",
    value: "$24.0",
    unit: "T",
    note: "Sample figure — not a live statistic",
  },
  {
    label: "Container Shipping",
    value: "180",
    unit: "M TEU",
    note: "Sample figure — not a live statistic",
  },
  {
    label: "Major Ports",
    value: "850",
    note: "Sample figure — not a live statistic",
  },
  {
    label: "Countries",
    value: "195+",
    note: "Recognised states and territories",
  },
];

/* ---------- 4. Global Network ---------- */

export type NetworkModule = {
  title: string;
  description: string;
  href: string; // 点击后去哪个页面
};

export const NETWORK_MODULES: NetworkModule[] = [
  {
    title: "Trade",
    description: "Global import & export",
    href: "/global",
  },
  {
    title: "Logistics",
    description: "Global transportation",
    href: "/global",
  },
  {
    title: "Networks",
    description: "Supply chain connections",
    href: "/global",
  },
];

/* ---------- 5. Supply Chain Insights ---------- */

export type Insight = {
  title: string;
  summary: string; // 一句话讲清这篇讲什么（学生能看懂，不空泛）
  href: string;
};

export const INSIGHTS: Insight[] = [
  {
    title: "Why Inventory Matters",
    summary:
      "Inventory is capital standing still. Why firms hold it, what it really costs, and how it absorbs uncertainty.",
    href: "/supply-chain",
  },
  {
    title: "What Is Just-in-Time?",
    summary:
      "JIT removes waste by receiving goods only as they are needed — and leaves you exposed when the network breaks.",
    href: "/supply-chain",
  },
  {
    title: "How Global Shipping Works",
    summary:
      "From factory to port, vessel to shelf: the stages, documents and players behind a single container.",
    href: "/supply-chain",
  },
  {
    title: "Supply Chain Risk Management",
    summary:
      "How to identify, assess and mitigate disruption before it reaches the customer.",
    href: "/supply-chain",
  },
];

/* ---------- 6. Companies ---------- */

export type Company = {
  name: string;
  sector: string; // 行业标签
  focus: string; // 主营业务
  supplyChainModel: string; // 关键：从供应链角度理解这家公司
};

// 重点不是「公司百科」，而是每家公司怎么组织自己的网络与资产。
export const COMPANIES: Company[] = [
  {
    name: "DHL",
    sector: "Express & Contract Logistics",
    focus: "Global express, forwarding and warehousing",
    supplyChainModel:
      "Owns the network: air hubs, ground fleets and warehouses run end to end.",
  },
  {
    name: "Maersk",
    sector: "Ocean Shipping",
    focus: "Container shipping and port terminals",
    supplyChainModel:
      "Controls both vessels and terminals, moving one box door to door.",
  },
  {
    name: "UPS",
    sector: "Parcel & Air Network",
    focus: "Integrated parcel and air delivery",
    supplyChainModel:
      "Hub-and-spoke network tuned for predictable, high-volume flows.",
  },
  {
    name: "FedEx",
    sector: "Air Express",
    focus: "Time-definite express delivery",
    supplyChainModel:
      "Central hub model built around speed and strict cut-off times.",
  },
  {
    name: "Kuehne+Nagel",
    sector: "Freight Forwarding",
    focus: "Sea and air freight forwarding",
    supplyChainModel:
      "Asset-light: buys capacity from others, sells coordination and visibility.",
  },
];

/* ---------- 7. Tools ---------- */

export type Tool = {
  name: string;
  description: string;
  formula: string; // 把公式直接露出来，专业且透明
};

export const TOOLS: Tool[] = [
  {
    name: "EOQ Calculator",
    description: "Economic Order Quantity",
    formula: "√(2DS / H)",
  },
  {
    name: "Safety Stock Calculator",
    description: "Buffer against uncertainty",
    formula: "(Max × Lead) − (Avg × Lead)",
  },
  {
    name: "Inventory Turnover",
    description: "How fast stock sells",
    formula: "COGS / Average Inventory",
  },
  {
    name: "Reorder Point",
    description: "When to place the next order",
    formula: "Demand × Lead Time + Safety Stock",
  },
];
