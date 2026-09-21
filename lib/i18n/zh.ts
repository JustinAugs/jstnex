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

  footer: {
    tagline: "全球供应网络智能平台",
    slogan: "探索世界如何流动",
    copyright: "JSTNEX。独立学生项目。",
    demoNote: "本站所示数字除特别说明外均为演示数据。",
  },
};

export default zh;
