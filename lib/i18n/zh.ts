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

  global: {
    eyebrow: "全球网络",
    title: "一个国家，一张网络",
    description:
      "塑造货物流向的经济体——它们在网络中扮演什么角色、哪些港口是它们的门户、各自最脆弱的环节在哪里。",
    demoBadge: "演示数据",
    filterLabel: "按大区筛选",
    filterAll: "全部",
    countLabel: "个国家",
    regions: {
      asia: "亚洲",
      europe: "欧洲",
      northAmerica: "北美洲",
    },
    labels: {
      role: "网络中的角色",
      ports: "主要港口",
      exports: "主要出口",
      strength: "结构性优势",
      risk: "主要脆弱点",
    },
    note: "以上描述为一般性特征，并非官方统计数据；港口以通用英文名称列出。",
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

  companies: {
    eyebrow: "企业",
    title: "全球供应网络企业",
    description: "从它们的网络、资产与供应链模式来理解。",
    modelLabel: "供应链模式",
  },

  tools: {
    eyebrow: "工具",
    title: "供应链计算器",
    description: "公式简单透明，并把计算逻辑直接展示出来。",
    open: "打开",
    disclaimer: "所有计算器均采用简化教学模型，并非企业级预测系统。",
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
