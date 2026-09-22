# TASK 04 — Supply Chain 页面设计稿（待确认，未写码）

> 状态：JSTNEX 0.3.0（Home + Global 已完成）
> 本文件只做设计，不改任何 `app/` `components/` `data/` `lib/` 里的代码。
>
> **⚠️ 已实施（0.4.0），本稿部分内容被正式指令覆盖：**
> SCOR 采用**数字标准 SCOR DS 的 7 个流程**（Orchestrate / Plan / Order /
> Source / Transform / Fulfill / Return），而非本稿第 1、3 节写的旧版 6 流程。
> 其余架构（IA 分层、组件拆分、数据模型、诚实策略、术语对照）均按本稿落地。
> 实现记录见 `CHANGELOG.md` 的 0.4.0。

---

## 0. 现状盘点（设计要接住的东西）

| 现有资产 | 现状 | 对本任务的意义 |
|---|---|---|
| `app/supply-chain/page.tsx` | 29 行占位页 | 待替换，结构同 TASK 03 之前的 `/global` |
| `data/insights.json` | 4 条内容，字段 `title/summary/category/href` | **首页 Insights 区块的数据源，且 `href` 已指向 `/supply-chain`** |
| `components/cards/InsightCard.tsx` | `CardLink` + "Read —" 动作条 | 点了必须能找到内容，否则是死链感的入口 |
| `components/global/CountryDirectory.tsx` | "use client" 的列表 + 筛选 | **可直接复用的页面模式** |
| `lib/data/index.ts` | JSON → 类型 → 导出 | 接数据库的唯一改动点 |
| 库存 / CBS：统一译名 | 见第 6 节 | 供应链术语必须全书一致 |

**一句话定位：**
> Global 看「地方」（Where），Companies 看「角色」（Who），Supply Chain 看「机理」（How）。
> 这一页是 JSTNEX 的概念层，回答：一个供应链概念是什么、为什么重要、怎么衡量、谁在做。

---

## 1. 信息架构（IA）

```
/supply-chain                          知识库首页
├─ Intro            区块标题 + 一句话定位
├─ A. SCOR 框架条     Plan → Source → Make → Deliver → Return → Enable
│                    作为整页的「坐标系」，说明 SCM 到底管哪些环节
├─ B. 主题筛选        All / 库存 / 运输 / 采购 / 生产 / 计划 / 仓储 / 风险   （带计数）
├─ C. 概念库          按主题筛选后的概念卡片网格
└─ D. 内容说明        页脚：内容来源政策 + 数据诚实声明

── 本次不做（建议拆到 TASK 04.5+，与 Global 保持同样节奏）──
/supply-chain/[slug]      概念详情子页
/supply-chain/glossary    术语表（A–Z）
/supply-chain/paths       学习路径（如「看懂一条牛仔裤的供应链」）
```

### 为什么第一屏放 SCOR？

SCOR（Supply Chain Operations Reference）是供应链领域最通用的标准流程框架：
**Plan 计划 / Source 采购 / Make 制造 / Deliver 交付 / Return 退货 / Enable 支撑**。

- 对学生：一眼看懂「供应链管理到底管些啥」，而不是上来就掉进一堆散装词条
- 对专业读者：这是行业标准，出现它本身就是专业性的信号
- 对结构：它给后续每个概念提供了一个天然的分类维度（`scorProcess` 字段）

### 页面之间的横向连接

概念卡片底部可以挂三类外链，让知识库不成为孤岛：

| 指向 | 目标 | 时机 |
|---|---|---|
| 相关国家 | `/global` | 现在就能连（countries.code 已有） |
| 相关公司 | `/companies` | TASK 05 之后 |
| 相关公式 | `/tools` | TASK 06 之后 |

**避免与 Tools 重复的重要约定：**
- Supply Chain 页负责「讲」——这个指标是什么、为什么用它、怎么解读
- Tools 页负责「算」——给一个能输入数字的计算器
- 两边都指向同一个将来独立的 `ConceptMetric` 数据，不各自抄一份公式文本

---

## 2. 页面结构（视觉分层）

沿用现有 Design System，不引入新的视觉语言：

```
┌──────────────────────────────────────────────┐
│ SUPPLY CHAIN (eyebrow)                       │
│ Supply chain knowledge base                  │  ← SectionHeader
│ 一句话说明 + 右侧「内容政策」标注             │
├──────────────────────────────────────────────┤
│ PLAN → SOURCE → MAKE → DELIVER → RETURN → ENABLE │  ← 6 列细条，序号 + 名称 + 一句说明
├──────────────────────────────────────────────┤
│ [All 12] [库存 2] [运输 2] [采购 1] ...        │  ← 筛选 chips（复用 buttonStyles）
│ 12 concepts                                  │
├──────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │为什么库存很重要 │ │什么是准时制│ │...      │  ← ConceptCard × N
│ │inventory·基础  │ │make·基础   │ │         │
│ └────────┘ └────────┘ └────────┘            │
├──────────────────────────────────────────────┤
│ 细线 + 小字：内容由编写者整理;统计数据将在接入真实数据源后补充 │
└──────────────────────────────────────────────┘
```

---

## 3. 组件拆分（严格沿用现有分层）

| 文件 | 类型 | 职责 |
|---|---|---|
| `app/supply-chain/page.tsx` | **服务端** | 只做两件事：`export metadata`、渲染下面两个组件 |
| `components/supplyChain/ScorFramework.tsx` | **服务端**（无交互，不进客户端包） | 渲染 6 个 SCOR 流程条 |
| `components/supplyChain/ConceptLibrary.tsx` | **客户端**（`"use client"`） | 主题筛选 + 概念卡片网格 |
| `components/cards/ConceptCard.tsx` | 卡片组件 | 单个概念的展示，接收已翻译好的字符串 |

**复用的既有原语（一个都不重写）：**
`Section` / `SectionHeader` / `Badge` / `DemoBadge` / `buttonStyles` / `Card` / `CardLink` / `CardAction` / `StateBlock`

**再次强调 TASK 03 学到的硬规则：**
`"use client"` 的文件不能 `export const metadata`。所以页面必然是「服务端外壳 + 客户端子组件」两层。
有意思的是，`ScorFramework` 不需要交互，就让它留在服务端——**客户端包越小越好，不要因为同页有筛选就把整页都客户端化**。

**为什么 ConceptCard 暂不用 CardLink：**
没有详情子页就不做可点击的样子。（与 Global 页 CountryCard 的处理保持一致。）

---

## 4. 数据结构

### 4.1 一个必须先决策的事：`insights.json` 要不要并入 `concepts.json`？

| 方案 | 做法 | 评价 |
|---|---|---|
| **A（推荐）** | 把 `data/insights.json` 演进为 `data/concepts.json`，现有 4 条成为种子数据并加 `featured: true`；首页 Insights 区块改为 `CONCEPTS.filter(c => c.featured)` | 单一数据源。缺点是首页要改一行取数逻辑 |
| B | 保留 `insights.json`，另建 `concepts.json`，insights 只做首页摘要 | 同一概念要维护两遍，迟早不同步 |

**推荐 A 的理由：** insights 和 concepts 本质是同一种东西（一条供应链知识内容）。现在分拆只是历史巧合。收敛到一张表，将来 Python + PostgreSQL 也只需要一张 `concepts` 表。改动量约 10 分钟，属于数据模型收敛，不是重写。

### 4.2 `data/supply-chain-topics.json`（主题）

```json
[
  {
    "id": "inventory",
    "name": { "en": "Inventory Management", "zh": "库存管理" },
    "description": { "en": "How much to hold, where to hold it, and why it costs more than it looks.", "zh": "持有多少、放在哪里，以及它的真实成本远高于账面。" },
    "order": 1
  }
]
```

`id` 用稳定英文 key。现有 insights 里的 `category: "Inventory"` 迁移为 `topicId: "inventory"`。

**V1 主题清单（7 个）：**
`inventory` 库存 / `transportation` 运输 / `procurement` 采购 / `manufacturing` 生产 /
`planning` 计划 / `warehousing` 仓储 / `risk` 风险

（其中 inventory / transportation / manufacturing / risk 正好接住首页那 4 条已有 insight。）

### 4.3 `data/scor-processes.json`（SCOR 流程）

```json
[
  { "id": "plan", "name": { "en": "Plan", "zh": "计划" }, "description": { "en": "Balance supply and demand.", "zh": "平衡供给与需求。" }, "order": 1 }
]
```

6 条固定内容。虽然是"死"数据，但仍放 `data/*.json`，保持「内容不长在组件里」的原则。

### 4.4 `data/concepts.json`（概念，由 insights.json 演进）

字段按重要性分三层，避免一上来就过度设计：

**V1 必须有**
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string slug | `why-inventory-matters`，URL 安全，未来详情页用 |
| `title` | LocalizedText | 已有 |
| `summary` | LocalizedText | 已有，首页摘要用 |
| `topicId` | string | 外键 → topics.id |
| `level` | `"fundamental" \| "intermediate" \| "advanced"` | 学习梯度 |
| `definition` | LocalizedText | 一句话定义 |
| `whyItMatters` | LocalizedText | 为什么重要（这个是专业感的来源） |
| `featured` | boolean | 首页是否展示（替代现在的 insights 列表） |

**V1 建议有**
| 字段 | 类型 | 说明 |
|---|---|---|
| `scorProcess` | string? | 挂到 SCOR 的哪个流程 |
| `metrics` | `{ name: LocalizedText; formula: string; unit?: string }[]` | 怎么衡量。**formula / unit 不翻译** |
| `relatedCountries` | string[]? | ISO 代码，直接连 `/global` 现有的 code |

**现在就把位置留好（值可为 null，将来填）**
| 字段 | 类型 | 说明 |
|---|---|---|
| `source` | `{ name; url; retrievedAt } \| null` | **数据溯源。接真实数据时必须填** |
| `updatedAt` | string? | 最后更新时间 |
| `relatedConcepts` | string[]? | 概念之间的关联（图谱雏形，V3 AI 用） |

预留这三组空字段的成本几乎为零，但它把「将来怎么接真实数据」写进了结构里，而不是留到那天再返工。

### 4.5 V1 内容规模建议

**7 个主题 / 12 条左右概念**（每条已存在的 insight 算 1 条，再补 8 条）。宁少勿滥：每条都要有真正的信息量，不要为了凑数写空话。

---

## 5. 数据诚实策略（要求 3、4）

这是本页最关键、也最容易做错的地方。

| 内容类型 | 是不是 Demo Data？ | 怎么处理 |
|---|---|---|
| 定义、原理解释、框架说明 | **不是** | 是编写者整理的教学内容，**不挂** Demo Data 徽章 |
| 公式本身 | 不是 | 公认定义，不挂徽章 |
| 带数字的演算示例 | **是** | 挂在 `example` 对象里，显式 `isDemo: true`，页面上带「示例」标签 |

**硬性约束：**
1. 不出现「实时」「最新」「截至今天」等字样
2. 不画增长/下降箭头、不做趋势暗示
3. 不编造吞吐量、成本、时效等统计数字
4. 页脚固定一句说明：知识内容为人工整理，统计数据将在接入真实数据源后补充
5. 将来 `source` 字段填上真实来源后，UI 自动在对应内容旁显示「来源 + 日期」小字——**有来源才显示，没来源就什么都不显示**

> 一句话：**这一页可以不挂全站 Demo Data 大徽章。挂，反而会把真知识也说成假的。**

---

## 6. i18n 需求

### 6.1 需要新增的字典段（`lib/i18n/en.ts` + `zh.ts` 同步）

```
supplyChain: {
  eyebrow, title, description,
  filterLabel, filterAll, countLabel,
  scor:  { eyebrow, title, description },
  level: { fundamental, intermediate, advanced },
  labels:{ definition, whyItMatters, measurement, example, relatedCountries, topic },
  demoLabel:  "Illustrative example" / "示例",
  note:       页脚内容政策说明
}
```

内容类文字（主题名、概念定义等）走 JSON 的 `LocalizedText`，不放字典。

### 6.2 术语对照表（中英文必须锁死，避免前后不一致）

| English | 中文 |
|---|---|
| Lead time | 提前期 |
| Safety stock | 安全库存 |
| Reorder point | 再订货点 |
| Inventory turnover | 库存周转率 |
| Days of inventory outstanding (DIO) | 库存持有天数 |
| Fill rate | 订单满足率 |
| Perfect order rate | 完美订单率 |
| Service level | 服务水平 |
| Cash-to-cash cycle time | 现金转换周期 |
| Total landed cost | 到岸总成本 |
| Bullwhip effect | 牛鞭效应 |
| Buffer / decoupling point | 缓冲点 / 解耦点 |
| Make-to-order / Make-to-stock | 按单生产 / 备货生产 |
| Vendor-managed inventory (VMI) | 供应商管理库存 |
| Cross-docking | 越库作业 |
| Reverse logistics | 逆向物流 |
| Bill of materials (BOM) | 物料清单 |
| Incoterms (FOB / CIF / DDP) | 国际贸易术语（保留英文代码） |
| TEU | 标准箱（二十英尺换算单位） |
| SCOR: Plan / Source / Make / Deliver / Return / Enable | 计划 / 采购 / 制造 / 交付 / 退货 / 支撑 |

**不翻译的东西：** 公式与数学符号、单位与缩写（TEU / DIO / VMI）、ISO 国家代码、Incoterm 代码、品牌名。
**首次出现格式：** `中文（English）`，例如 `安全库存（Safety stock）`。

---

## 7. 面向 Python / PostgreSQL 的预留（要求 6）

```
topics            (id, order) + 翻译
scor_processes    (id, order) + 翻译
concepts          (id, topic_id, level, scor_process, featured, updated_at)
concept_metrics   (concept_id, name, formula, unit)
sources           (id, name, url, retrieved_at)
concept_countries (concept_id, country_code)   ← 直接复用 countries.code
```

- 现在每个 JSON 都是顶层数组，形状刻意做成未来 `GET /api/topics`、`GET /api/concepts?topic=inventory` 的响应样子
- 迁移时只需把 `lib/data/index.ts` 里的 `import json` 换成 `await fetch(...)`，**组件零改动**
- Postgres 里 `LocalizedText` 用 `JSONB` 存最简单（将来多语言再拆 translations 表）
- Python 爬虫将来负责写 `sources` 和 `concept_metrics` 里的真实数值

---

## 8. 实施步骤与验收清单

**步骤（实施时才动代码）**
1. 新建 `supply-chain-topics.json` + `scor-processes.json`
2. `insights.json` → `concepts.json`（4 条种子 + `featured`）+ 补 8 条（待定）
3. `types.ts` 增加 `Topic` / `Concept` / `ScorProcess`
4. `lib/data/index.ts` 增加导出
5. `en.ts` / `zh.ts` 增加 `supplyChain` 段
6. 写 `ScorFramework` / `ConceptCard` / `ConceptLibrary`
7. 替换 `app/supply-chain/page.tsx`
8. （若采纳方案 A）首页 Insights 区块改取 `CONCEPTS.filter(featured)`
9. 同步 `README.md` + `CHANGELOG.md`（0.4.0）

**验收**
- [ ] `npm run lint` 0 问题；`npm run build` 通过，`/supply-chain` 静态预渲染
- [ ] `/supply-chain` 返回 200
- [ ] SCOR 恰好 6 个流程
- [ ] **各主题筛选计数之和 = 概念总数**（TASK 03 验证过的同类校验，必须做）
- [ ] 切到中文后：页面文案、主题名、概念名/定义/意义全部变中文，公式与单位保持原样
- [ ] 全页没有任何未标注的虚构数字
- [ ] 首页 4 条 insight 点击后，确实能在本页找到对应主题
- [ ] 中文文案里没有出现标题式大写、没有机器味直译

---

## 9. 需要你拍板的三个点

1. **方案 A 还是 B？** — `insights.json` 是否并入 `concepts.json`（推荐 A）
2. **这次要不要做概念详情子页 `/supply-chain/[slug]`？** （推荐不做，与 Global 保持同样节奏，V1 先做好列表层）
3. **V1 概念数量** — 建议 12 条左右（7 主题），宁可少而扎实
