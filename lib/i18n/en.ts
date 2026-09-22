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

  global: {
    eyebrow: "Global network",
    title: "The network, country by country",
    description:
      "The economies that shape how goods move — their role in the network, the ports that serve as their gateways, and where each one is exposed.",
    demoBadge: "Demo Data",
    filterLabel: "Filter by region",
    filterAll: "All",
    countLabel: "countries",
    // 地区名：数据在 JSON 里存的是 "Asia" 这种英文值，显示名在这里翻译
    regions: {
      asia: "Asia",
      europe: "Europe",
      northAmerica: "North America",
    },
    labels: {
      role: "Role in the network",
      ports: "Key ports",
      exports: "Main exports",
      strength: "Structural strength",
      risk: "Key vulnerability",
    },
    note: "Descriptions reflect general characteristics, not official statistics. Ports are listed by their common English names.",
  },

  /*
    supplyChain —— Supply Chain 页面（TASK 04）

    这里只放界面文字。概念的定义、意义、公式等内容一律放在
    data/concepts.json 里，不放字典 —— 字典管界面，数据文件管内容。
  */
  supplyChain: {
    eyebrow: "Supply chain",
    title: "How supply chains work.",
    description:
      "Concepts, processes and metrics — the mechanics behind how goods are sourced, made, moved and returned.",
    scor: {
      eyebrow: "SCOR digital standard",
      title: "Seven processes that cover every supply chain",
      description:
        "SCOR describes any supply chain as seven processes. Each concept below sits inside one of them.",
    },
    library: {
      eyebrow: "Concept library",
      title: "Concepts, one at a time",
      description:
        "Each entry answers four questions: what it is, why it matters, how it is measured, and which process it belongs to.",
      filterLabel: "Filter by topic",
      filterAll: "All",
      countLabel: "concepts",
    },
    labels: {
      topic: "Topic",
      level: "Level",
      definition: "Definition",
      whyItMatters: "Why it matters",
      metrics: "How it is measured",
      relatedCountries: "Related countries",
      scorProcess: "SCOR process",
    },
    levels: {
      fundamental: "Fundamental",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    note: "Knowledge content is manually curated. Statistical data will be added when verified data sources are connected.",
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
