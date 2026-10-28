/*
  zh.ts — 中文字案字典

  Dictionary 是从 en.ts 推导出来的类型，所以这里少写任何一个字段都会报错。
  注意：JSTNEX 是品牌名，任何语言下都不翻译。
*/
import type { Dictionary } from "./index";

const zh: Dictionary = {
  nav: {
    home: "首页",
    global: "全球",
    supplyChain: "供应链",
    companies: "企业",
    tools: "工具",
    openMenu: "切换导航菜单",
  },

  language: {
    label: "语言",
  },

  hero: {
    eyebrow: "JSTNEX",
    titleTop: "全球供应网络",
    titleBottom: "智能情报平台",
    slogan: "探索世界如何流动",
    description: "探索全球贸易、物流、企业与供应网络。",
    primaryCta: "探索全球",
    secondaryCta: "探索供应链",
    illustrationCaption: "全球供应网络示意图",
    globe: {
      label: "交互式全球供应网络示意图",
      hint: "在网络中选择一个国家。",
      viewDetail: "查看国家详情",
      close: "关闭",
    },
  },

  snapshot: {
    eyebrow: "全球概览",
    title: "四个数字看懂全球网络",
    demoBadge: "演示数据",
  },

  network: {
    eyebrow: "全球网络",
    title: "观察世界的三个角度",
    description: "贸易流向、运输体系，以及把它们连接在一起的网络关系。",
    explore: "查看",
  },

  // regions —— 大区显示名（Global 页与 Companies 页共用，字段结构同 en.ts）
  regions: {
    asia: "亚洲",
    europe: "欧洲",
    northAmerica: "北美洲",
  },

  global: {
    eyebrow: "全球网络",
    // G-06：原标题「一个国家，一张网络」是 "country by country" 的直译，
    // 「一张网络」的量词搭配生硬。改成动作 + 对象，读起来更像产品而不是口号。
    title: "按国家，看懂全球网络",
    description:
      "塑造货物流向的经济体——它们在网络中扮演什么角色、哪些港口是它们的门户、各自最脆弱的环节在哪里。",
    demoBadge: "演示数据",
    filterLabel: "按大区筛选",
    filterAll: "全部",
    countLabel: "个国家",
    // 卡片底部的动作行：让「整张卡可点」这件事对触屏用户也可见（G-07）
    cardAction: "查看档案",
    labels: {
      role: "网络中的角色",
      ports: "主要港口",
      exports: "主要出口",
      strength: "结构性优势",
      risk: "主要脆弱点",
    },
    note: "以上描述为一般性特征，并非官方统计数据；港口以通用英文名称列出。",
  },

  countryDetail: {
    // 动作 + 目标，链接文本本身就说明去向（G-04）
    back: "返回国家目录",
    note: "以上描述为一般性特征，并非官方统计数据；港口以通用英文名称列出。",
    labels: {
      ports: "主要港口",
      exports: "主要出口",
      strength: "结构性优势",
      risk: "主要脆弱点",
      source: "来源",
    },
  },

  supplyChain: {
    eyebrow: "供应链",
    title: "供应链如何运作",
    description:
      "概念、流程与指标——货物如何被采购、制造、运输与退回的全部机理。",
    scor: {
      eyebrow: "SCOR 数字标准",
      title: "七个流程，覆盖每一条供应链",
      description:
        "SCOR 把任何供应链都描述为七个流程。下面每个概念都落在其中之一。",
    },
    library: {
      eyebrow: "概念库",
      title: "一个一个讲清楚的概念",
      description:
        "每条都回答四个问题：它是什么、为什么重要、怎么衡量、属于哪个流程。",
      filterLabel: "按主题筛选",
      filterAll: "全部",
      countLabel: "个概念",
    },
    labels: {
      topic: "主题",
      level: "层级",
      definition: "定义",
      whyItMatters: "为什么重要",
      metrics: "如何衡量",
      relatedCountries: "相关国家",
      scorProcess: "SCOR 流程",
      source: "来源",
    },
    levels: {
      fundamental: "基础",
      intermediate: "进阶",
      advanced: "高级",
    },
    note: "知识内容由人工整理。统计数据将在接入经过验证的数据源后补充。",
  },

  insights: {
    eyebrow: "供应链洞察",
    title: "从基础开始",
    description: "为学生而写的简短实用讲解，不是教科书式的空话。",
    read: "阅读",
  },

  // companies —— 前三项给首页 Companies 区块用，其余给 Companies 页面用（字段结构同 en.ts）
  companies: {
    eyebrow: "企业",
    title: "全球供应网络企业",
    description: "从它们的网络、资产与供应链模式来理解。",

    page: {
      eyebrow: "企业",
      title: "谁参与全球供应网络？",
      description:
        "从供应链角色的角度浏览企业——按行业、地区与供应链角色筛选，而不是按规模或排名。",
      countLabel: "家企业",
      note: "以上企业条目均为供应链视角的定性观察，不展示营收、市场份额、排名或业绩数字。",
    },

    search: {
      label: "搜索企业",
      placeholder: "搜索企业……",
    },

    filters: {
      industry: "行业",
      region: "地区",
      role: "供应链角色",
      all: "全部",
      filterByIndustry: "按行业筛选",
      filterByRegion: "按地区筛选",
      filterByRole: "按供应链角色筛选",
    },

    // 行业显示名：数据里是 technology 这类稳定 id，不能直接显示给用户
    industries: {
      technology: "科技",
      automotive: "汽车",
      logistics: "物流",
      manufacturing: "制造",
      retail: "零售",
      energy: "能源",
      pharmaceuticals: "制药",
      semiconductors: "半导体",
    },

    // 供应链角色：同样避开「行业龙头 / 市场领先 / 最佳供应商」这类主观评价
    roles: {
      "brand-integrator": "品牌 / 系统整合商",
      manufacturer: "制造商",
      supplier: "供应商",
      "logistics-provider": "物流服务商",
      retailer: "零售商",
      "technology-provider": "技术提供商",
      "raw-material-energy": "原材料 / 能源",
    },

    labels: {
      industry: "行业",
      role: "供应链角色",
      location: "所在地",
      keyActivities: "关键活动",
      strength: "优势",
      risk: "风险",
    },

    empty: {
      title: "未找到相关企业。",
      description: "换个搜索词，或清除某个筛选条件。",
    },
  },

  tools: {
    eyebrow: "工具",
    title: "供应链计算器",
    description: "公式简单透明，并把计算逻辑直接展示出来。",
    open: "打开",
    disclaimer: "所有计算器均采用简化教学模型，并非企业级预测系统。",

    // TASK 06：计算器界面（字段结构必须与 en.ts 一致）
    selectLabel: "选择计算器",
    calculate: "计算",
    reset: "重置",
    formulaLabel: "公式",
    assumptionsLabel: "适用假设",
    exactValue: "数学计算值",
    integerReference: "整数参考值",
    integerReferenceNote:
      "库存按整数单位计数时，向上取整可作为参考；若业务允许小数，应保留实际计算值。",
    enterValues: "填写全部数值后点击「计算」。",
    errors: {
      required: "请输入数值。",
      notANumber: "请输入有效数字。",
      notInteger: "请输入整数。",
    },
    reasons: {
      demandMustBePositive: "年需求量必须大于零。",
      orderingCostMustBePositive: "每次订货成本必须大于零。",
      holdingCostMustBePositive: "单位年持有成本必须大于零。",
      serviceLevelMustBeNonNegative: "服务水平系数（Z）必须大于或等于零。",
      stdDevMustBeNonNegative: "需求标准差不能为负数。",
      leadTimeMustBeNonNegative: "提前期不能为负数。",
      valuesMustBeNonNegative: "提前期内需求与安全库存都必须大于或等于零。",
      cogsMustBeNonNegative: "销货成本（COGS）不能为负数。",
      averageInventoryMustBePositive: "平均库存必须大于零。",
      resultNotFinite: "当前输入无法得到可计算的结果。",
    },
    safetyStock: {
      serviceLevelReference: "参考服务水平",
    },
  },

  // 三种状态的中文文案（字段结构必须与 en.ts 一致）
  states: {
    loading: {
      title: "正在加载全球数据……",
      description: "正在获取最新的供应网络数据。",
    },
    empty: {
      title: "暂无数据。",
      description: "这里暂时没有可显示的内容。",
    },
    error: {
      title: "数据加载失败。",
      description: "出现了一点问题，请稍后再试。",
      retry: "重试",
    },
  },

  footer: {
    tagline: "全球供应网络智能平台",
    slogan: "探索世界如何流动",
    copyright: "JSTNEX。独立学生项目。",
    demoNote: "本站所示数字除特别说明外均为演示数据。",
  },
};

export default zh;
