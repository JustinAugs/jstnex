/*
  en.ts — 英文文案字典（默认语言）

  这里只放「界面上给用户看的文字」（导航、按钮、区块标题等），
  业务数据（公司、工具、洞察的内容）放在 data/*.json 里，由 lib/data 加载。

  zh.ts 的字段结构必须和这里完全一致 —— TypeScript 会自动帮你检查，
  少写一个字段就会报错，不用担心漏翻。
*/
const en = {
  nav: {
    home: "Home",
    global: "Global",
    supplyChain: "Supply Chain",
    companies: "Companies",
    tools: "Tools",
    openMenu: "Toggle navigation menu",
  },

  language: {
    label: "Language",
  },

  hero: {
    eyebrow: "JSTNEX",
    titleTop: "GLOBAL SUPPLY",
    titleBottom: "NETWORK INTELLIGENCE",
    slogan: "Mapping How The World Moves.",
    description:
      "Explore global trade, logistics, companies and supply networks.",
    primaryCta: "Explore Global",
    secondaryCta: "Explore Supply Chain",
  },

  snapshot: {
    eyebrow: "Global Snapshot",
    title: "The network in four numbers",
    demoBadge: "Demo Data",
  },

  network: {
    eyebrow: "Global Network",
    title: "Three ways to see the world",
    description:
      "Trade flows, transportation systems and the connections that bind them.",
    explore: "Explore",
  },

  insights: {
    eyebrow: "Supply Chain Insights",
    title: "Start with the fundamentals",
    description:
      "Short, practical explanations written for students — not textbook filler.",
    read: "Read",
  },

  companies: {
    eyebrow: "Companies",
    title: "Global supply network companies",
    description:
      "Understood through their networks, assets and supply chain models.",
    modelLabel: "Supply chain model",
  },

  tools: {
    eyebrow: "Tools",
    title: "Supply chain calculators",
    description: "Simple, transparent formulas with the reasoning shown.",
    open: "Open",
    disclaimer:
      "All calculators use simplified educational models, not enterprise forecasting systems.",
  },

  /*
    states —— 三种「非正常 / 非内容」状态的统一文案。
    将来接数据库、Python API、爬虫之后，加载慢、查不到、接口报错都是常态，
    每个页面都要有一致的提示，不能各自发挥。
  */
  states: {
    loading: {
      title: "Loading global data...",
      description: "Fetching the latest supply network data.",
    },
    empty: {
      title: "No data available.",
      description: "There is nothing to show here yet.",
    },
    error: {
      title: "Unable to load data.",
      description: "Something went wrong. Please try again later.",
      retry: "Try again",
    },
  },

  footer: {
    tagline: "Global Supply Network Intelligence",
    slogan: "Mapping How The World Moves.",
    copyright: "JSTNEX. Independent student project.",
    demoNote:
      "Figures shown on this site are demo data unless stated otherwise.",
  },
};

export default en;
