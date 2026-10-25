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
    // Hero 主视觉下方的说明：明确它是示意图，不是真实贸易数据
    illustrationCaption: "Global Network Illustration",
    // 交互式地球的界面文案（TASK 06.12C）
    globe: {
      label: "Interactive global network illustration",
      hint: "Select a country on the network.",
      viewDetail: "View country",
      close: "Close",
    },
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

  /*
    regions —— 大区显示名（Global 页与 Companies 页共用）。

    数据在 JSON 里存的是 "Asia" 这种英文值，由 lib/data 的 regionKey() 换算成这里的字段名。
    TASK 03 时它放在 global 段里；TASK 05 因为 Companies 页也要按大区筛选，
    把它提升为共享段 —— 同一个大区不能有两套翻译。
  */
  regions: {
    asia: "Asia",
    europe: "Europe",
    northAmerica: "North America",
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
    // 卡片底部的动作行：让「整张卡可点」这件事对触屏用户也可见（G-07）
    cardAction: "View profile",
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
    countryDetail —— 国家详情页（TASK 06.12B）

    只有界面文字；国家的具体内容（角色 / 简介 / 港口 / 出口等）
    一律来自 data/countries.json，不在这里重复。
  */
  countryDetail: {
    // 动作 + 目标，链接文本本身就说明去向（G-04）
    back: "Back to country directory",
    note: "Descriptions reflect general characteristics, not official statistics. Ports are listed by their common English names.",
    labels: {
      ports: "Key ports",
      exports: "Main exports",
      strength: "Structural strength",
      risk: "Key vulnerability",
    },
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

  /*
    companies —— 前三项（eyebrow / title / description）是首页 Companies 区块用的；
    下面 page / search / filters / industries / roles / labels / empty 是
    Companies 页面（TASK 05）用的界面文字。

    注意：企业本身的内容（简介、优势、风险）放在 data/companies.json，不放字典 ——
    字典管界面，数据文件管内容，这是本项目一直的规矩。
  */
  companies: {
    eyebrow: "Companies",
    title: "Global supply network companies",
    description:
      "Understood through their networks, assets and supply chain models.",

    page: {
      eyebrow: "Companies",
      title: "Who participates in global supply networks?",
      description:
        "Explore companies through their roles in global supply chains — by industry, region and supply chain role, not by size or ranking.",
      countLabel: "companies",
      note: "Company entries are qualitative supply chain observations. No revenue, market share, ranking or performance figures are shown.",
    },

    search: {
      label: "Search companies",
      placeholder: "Search companies...",
    },

    filters: {
      industry: "Industry",
      region: "Region",
      role: "Supply Chain Role",
      all: "All",
      filterByIndustry: "Filter by industry",
      filterByRegion: "Filter by region",
      filterByRole: "Filter by supply chain role",
    },

    // 行业显示名：数据里是 technology 这类稳定 id，中文模式下不能把它直接显示出来
    industries: {
      technology: "Technology",
      automotive: "Automotive",
      logistics: "Logistics",
      manufacturing: "Manufacturing",
      retail: "Retail",
      energy: "Energy",
      pharmaceuticals: "Pharmaceuticals",
      semiconductors: "Semiconductors",
    },

    /*
      供应链角色显示名。刻意没有「行业龙头 / 市场领先 / 最佳供应商」这类词 ——
      这一页讲角色，不做排名。
    */
    roles: {
      "brand-integrator": "Brand / System Integrator",
      manufacturer: "Manufacturer",
      supplier: "Supplier",
      "logistics-provider": "Logistics Provider",
      retailer: "Retailer",
      "technology-provider": "Technology Provider",
      "raw-material-energy": "Raw Material / Energy",
    },

    labels: {
      industry: "Industry",
      role: "Supply Chain Role",
      location: "Location",
      keyActivities: "Key Activities",
      strength: "Strength",
      risk: "Risk",
    },

    empty: {
      title: "No companies found.",
      description: "Try a different search term, or clear a filter.",
    },
  },

  tools: {
    eyebrow: "Tools",
    title: "Supply chain calculators",
    description: "Simple, transparent formulas with the reasoning shown.",
    open: "Open",
    disclaimer:
      "All calculators use simplified educational models, not enterprise forecasting systems.",

    /* ---------- TASK 06：计算器界面 ---------- */
    selectLabel: "Choose a calculator",
    calculate: "Calculate",
    reset: "Reset",
    formulaLabel: "Formula",
    assumptionsLabel: "Assumptions",
    exactValue: "Exact value",
    integerReference: "Integer reference",
    integerReferenceNote:
      "Rounded up for reference when inventory is counted in whole units. If fractional units are allowed, use the exact value.",
    enterValues: "Enter all values, then calculate.",
    errors: {
      required: "Enter a value.",
      notANumber: "Enter a valid number.",
      notInteger: "Enter a whole number.",
    },
    reasons: {
      demandMustBePositive: "Annual demand must be greater than zero.",
      orderingCostMustBePositive: "Ordering cost must be greater than zero.",
      holdingCostMustBePositive: "Holding cost must be greater than zero.",
      serviceLevelMustBeNonNegative:
        "The service level factor (Z) must be zero or greater.",
      stdDevMustBeNonNegative:
        "Demand standard deviation cannot be negative.",
      leadTimeMustBeNonNegative: "Lead time cannot be negative.",
      valuesMustBeNonNegative:
        "Demand during lead time and safety stock must be zero or greater.",
      cogsMustBeNonNegative: "COGS cannot be negative.",
      averageInventoryMustBePositive:
        "Average inventory must be greater than zero.",
      resultNotFinite: "The result cannot be computed with these inputs.",
    },
    safetyStock: {
      serviceLevelReference: "Reference service levels",
    },
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
