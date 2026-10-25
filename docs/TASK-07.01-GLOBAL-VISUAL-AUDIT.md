# TASK 07.01 — Global Page Visualization Audit

> 状态：审计完成，等待用户审核。本报告只新增本文件，未修改任何业务代码。
> 审计日期：2026-10-21 · 审计对象：`/global` 与 `/global/[code]`（代码 HEAD：`29ceee2`，含未提交的 v0.7.1 候选文档改动）

---

## 1. 执行摘要

Global 页面**功能完整、无阻断性缺陷、无双语缺失、无布局溢出、无控制台错误**。实测确认：8 张国家卡片链接全部正确、大区筛选工作正常、未知国家代码正确返回 404、三视口（1440/768/390）均无横向滚动、中英文切换完整。

但审计发现了 **1 个接近 P1 的结构缺陷**（全站页面缺 `<h1>`，影响 SEO 与文档大纲）和 **6 个 P2 级体验问题**（其中"筛选状态在返回后丢失"已实测复现）。无 P0 问题。

最值得优先解决：
1. **页面缺 `<h1>`**——`SectionHeader` 硬编码 `<h2>`，影响 `/global`、`/companies`、`/supply-chain`、`/tools` 四个页面（系统性，实测确认）。
2. **筛选状态在「详情页 → 返回」后丢失**——实测复现：选「欧洲」→ 进德国详情 → 返回 → 筛选重置为「全部」。
3. **返回链接文案过弱**——英文为 "Back to Global"（地名式名词，不是动作），中文原文为「返回全球目录」（有动作，但目的地写成"全球"而不是国家目录）；链接本身无 aria-label，可见文字即其全部可访问名称。
4. **键盘 focus 样式无设计系统定制**——依赖浏览器默认 outline，且 `Button.tsx` 注释声称已处理 focus 实际未处理（注释与实现不符）。

另有一项记录在案但**决定暂不处理**：US 卡 ports 文本贴边（G-05，357px 卡片中占满 307px 内容区，无溢出；理由见 §8）。

**推荐方案核心**：4 项低成本修复（h1、返回链接、focus-visible、筛选状态保持）+ 1 项建议改进（i18n 标题措辞）+ 1 项记录暂缓（卡片信息密度），全部复用现有组件与令牌，零新依赖，不触碰数据结构。地图、搜索、贸易统计明确暂不做。

TASK 07.02 实施计划已给出（4 个小阶段，预计改动 6 个组件文件 + 2 个 i18n 文件，共 8 个文件；该数量为预计范围，最终以 TASK 07.02 的实际 diff 为准，均为低风险）。

---

## 2. 当前页面基线（先回答：页面现在是什么）

### 2.1 服务什么用户需求

`/global` 是"按国家观察全球供应网络"的目录页：8 个经济体（CN/US/JP/DE/SG/KR/VN/IN），每张卡给 4 类定性信息（主要港口、主要出口、结构性优势、主要脆弱点）+ 角色定位 + 两三句简介。用户按大区（亚洲/欧洲/北美）筛选浏览，点击卡片进入 `/global/[code]` 看完整档案。

证据：`components/global/CountryDirectory.tsx:113-137`（卡片网格与字段传递）、`data/countries.json`（8 国、3 个大区：Asia 6 / Europe 1 / North America 1）。

### 2.2 用户能否快速理解各国角色？

**能。** 角色字段以深蓝 `text-deep` 显示在国名正下方（`CountryCard.tsx:67`），是卡片内除国名外最突出的元素；徽章（国家代码 + 大区）在卡片顶部。信息优先级清晰：代码/大区 → 国名 → 角色 → 简介 → 四字段。

### 2.3 目录 → 详情是否自然？

**基本自然，有两处摩擦**：卡片整块可点（`CardLink`，悬停边框变黑），点击即可进入详情；但 (a) 卡片上没有"可点击"的文字暗示（如 "View profile →"），首次使用者可能不知道整卡可点（有 hover 反馈，触屏无 hover）；(b) 返回链接文案偏弱——英文 "Back to Global"、中文「返回全球目录」，语义上都不够明确（见问题 G-04）。

### 2.4 视觉是否突出关键信息？信息密度是否失衡？

**总体平衡，有一个密度热点**：Field 组件的容器查询（`Field.tsx`，TASK 06.8）让窄卡片标签在上、正文占满行，实测无溢出。但 US 卡的 ports 行（"Los Angeles · Long Beach · New York / New Jersey · Savannah"）在 357px 卡片中占满 307px 内容区（距边界 1px），是全页视觉最挤的一行（见 G-05）。

### 2.5 中英文是否一致？

**一致。** 实测两种语言下：筛选按钮（全部/亚洲/北美洲/欧洲 vs All/Asia/North America/Europe）、卡片字段（主要港口等 4 项 vs Key ports 等 4 项）、国家名（中国/德国 vs China/Germany）、返回链接（返回全球目录 vs Back to Global）、计数（8 个国家 vs 8 countries）全部成对出现，无缺失、无混排。

### 2.6 移动端有无问题？

**无溢出、无截断**。实测 390px：单列布局，卡片 342×490px，`hscroll=false`；768px：双列 352×491px。移动端阅读顺序正确（页头 → 筛选 → 计数 → 卡片 → 数据说明）。筛选按钮在 390px 下换行为两行（全部/亚洲/北美洲 一行，欧洲 另一行），按钮尺寸（`px-4 py-2`）可点性尚可。

### 2.7 值得保留的设计

1. **Field 容器查询**（`Field.tsx`）——按卡片真实宽度决定标签/正文排布，跨页面复用零适配。
2. **服务端外壳 + 客户端交互的两层结构**（`page.tsx` + `CountryDirectory`）——SEO 与交互各得其所。
3. **详情页三重 404 防护**（`generateStaticParams` + `dynamicParams=false` + `notFound()` 兜底）。
4. **大小写统一**（URL 小写、数据大写、`toLowerCase()` 比对），避免 `/global/CN` 与 `/global/cn` 分叉。
5. **aria-pressed 筛选按钮** + 计数徽章；`role="group"` + `aria-label`。
6. **数据诚实性**：Demo Data 徽章、"非官方统计"说明、港口不翻译、全文无编造数字。
7. **克制的视觉语言**：黑白灰 + 深蓝仅用于角色高亮与链接，与品牌规范一致。

---

## 3. 审计范围与方法

**代码审读**（真实文件，均已读）：
- `app/global/page.tsx`（27 行）、`app/global/[code]/page.tsx`（80 行）
- `components/global/CountryDirectory.tsx`（146 行）、`components/global/CountryDetail.tsx`（81 行）
- `components/cards/CountryCard.tsx`（88 行）
- `components/ui/`：`Section.tsx`、`SectionHeader.tsx`、`Field.tsx`、`Card.tsx`、`Button.tsx`
- `lib/i18n/en.ts` 的 `global` / `countryDetail` / `regions` 段
- `data/countries.json`（8 国数据结构）
- `app/globals.css` 布局令牌（`--container-page: 72rem`、`section-spacing`、`tracking-label`）

**真实浏览器验证**（agent-browser + 本地 dev server，未部署生产）：
- 视口：1440×900、768×900、390×844
- 语言：EN 与 ZH（通过 Navbar 语言按钮切换，localStorage `jstnex-language`）
- 操作：筛选点击（All/Europe/欧洲）、卡片点击进入详情、返回链接、`/global/zz` 404、`getBoundingClientRect()` 测量卡片与 Field 行、`scrollWidth` 溢出检测、`.focus()` 焦点样式读取、控制台错误收集
- 截图：1440 与 390 各一张（中文模式）

**未做**：生产环境测试（按任务要求不部署）、真实屏幕阅读器、真实键盘长 Tab 遍历（用 `.focus()` + computed style 替代，见 §10 未验证项）。

---

## 4. 实际验证结果（真实执行的测试与数据）

| # | 测试 | 视口 | 结果 |
|---|------|------|------|
| V1 | 目录页渲染：8 卡、4 筛选钮（All 8 / Asia 6 / NA 1 / Europe 1） | 1440 EN | ✅ 正确 |
| V2 | Europe 筛选 → 仅 Germany 卡（1 张） | 1440 ZH（欧洲） | ✅ 正确 |
| V3 | 卡片链接 | 1440 | ✅ `/global/cn`…`/global/de` 全部小写正确 |
| V4 | 详情页：`title="China \| JSTNEX"`、`h1="China"`、4 字段、返回链接存在 | 1440 EN | ✅ 正常 |
| V5 | 未知代码 `/global/zz` | — | ✅ 返回 404 页 |
| V6 | 中文目录：筛选/字段/卡名全中文 | 1440 ZH | ✅ 完整无混排 |
| V7 | 中文详情：`h1="德国"`、back="返回全球目录"、字段全中文 | 1440 ZH | ✅（原记录此处误取 Navbar 链接，见 G-04 更正） |
| V8 | 三视口横向滚动 | 1440/768/390 | ✅ `hscroll=false` 全过 |
| V9 | 卡片尺寸 | 1440/768/390 | 3 列 357×615 / 2 列 352×491 / 1 列 342×490 |
| V10 | US 卡 Field 溢出检测（`scrollWidth` vs `clientWidth`） | 1440 | ✅ 无溢出（ports 行贴边 1px，见 G-05） |
| V11 | 筛选→详情→返回 状态保持 | 1440 ZH | ❌ **筛选重置为「全部」**（G-02，实测复现） |
| V12 | 焦点样式（`.focus()` + computed style） | 1440 | ⚠️ 浏览器默认 `outline: solid 2px` 可见；设计系统无定制（G-03） |
| V13 | 控制台错误 | 三视口 | ✅ 0 错误 |
| V14 | 其他页面 h1 检查 | companies / supply-chain / tools | ❌ **均缺 h1**（G-01 系统性证据） |

---

## 5. 问题清单与证据

> 分级标准：P0 阻断使用 / P1 明显影响主要任务或核心目标（SEO、导航）/ P2 体验改善 / P3 长期优化。
> 本页**无 P0**；如实说明：**没有发现 P0，发现 1 项 P1、6 项 P2、4 项 P3（合计 11 项）**。

---

### G-01 · P1 · 全站页面缺 `<h1>`（含 Global 目录页）

- **位置**：`components/ui/SectionHeader.tsx:42`（硬编码 `<h2>`）；`app/global/page.tsx` 无 h1 输出
- **证据**：实测 `/global`、`/companies`、`/supply-chain`、`/tools` 四页 `document.querySelector('h1') === null`；全站只有首页 Hero 有 `<h1>`（`Hero.tsx:50`）
- **影响**：搜索引擎失去页面主标题信号（与项目对 SEO 的投入——`buildMetadata`、canonical、OG 图——不匹配）；文档大纲以 h2 起头，语义结构不完整
- **推荐方案**：给 `SectionHeader` 加可选 `as` / `headingLevel` prop（默认 `"h2"` 保持兼容），Global 目录页传 `"h1"`；或 Global 页面在 SectionHeader 外自行补一个视觉隐藏的 h1。**前者更好**，但属于共享组件改动，会波及其他页面——需用户批准后实施
- **成本**：低（1 个组件 + 各页面一个 prop）
- **数据/架构影响**：无
- **验收标准**：`/global` 有且仅有一个 `<h1>`（内容 = 页面标题）；其他区块标题仍为 h2；四页面行为一致

---

### G-02 · P2 · 筛选状态在「详情 → 返回」后丢失

- **位置**：`components/global/CountryDirectory.tsx:42`（`useState(ALL)` 组件级状态）；`CountryDetail.tsx:35-42`（返回链接）
- **证据**：实测复现——选「欧洲」（1 卡）→ 点德国卡 → 点返回 → `activeFilter="全部8"`、`cardCount=8`
- **影响**：用户想先后查看同区域多个国家时，每次返回都要重新筛选；8 国时成本尚低，但国家数增长后成为实际摩擦
- **推荐方案**：最小方案——把筛选值提升到模块级变量（同 `lib/i18n/languageStore.ts` 的模式）或 `sessionStorage`，`CountryDirectory` 挂载时读取。不引入 URL 参数（那会改变路由行为，需另议）
- **成本**：低
- **数据/架构影响**：无
- **验收标准**：欧洲筛选 → 详情 → 返回，筛选仍为欧洲、仅 1 卡；直接新开 `/global` 仍默认全部

---

### G-03 · P2 · 键盘 focus 样式无设计系统定制 + 注释与实现不符

- **位置**：`components/ui/Button.tsx:18`（注释称"focus（键盘聚焦）状态统一处理"）与 29-36 行（实际无任何 `focus-visible:` 类）；`Card.tsx` 的 `CardLink` 同样无 focus 定制
- **证据**：实测 focus 时 `outline: solid 2px` 为**浏览器默认样式**；`grep focus-visible components/ui/` 无命中
- **影响**：键盘用户当前**能**看到焦点（默认 ring 可见，无阻断），但 (a) 默认 ring 与克制的设计语言不统一；(b) 注释误导维护者以为已处理；(c) 未来任何人加 `outline-none` 就会无声破坏可访问性
- **推荐方案**：在 `buttonStyles()` 的 BASE 与 `CardLink` 加统一的 `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`（或项目令牌色）；同时修正 Button 注释
- **成本**：低
- **数据/架构影响**：无
- **验收标准**：Tab 遍历筛选按钮与卡片时焦点环清晰、风格统一；注释与实现一致

---

### G-04 · P2 · 返回链接文案过弱且缺语义补充

- **位置**：`components/global/CountryDetail.tsx:35-42`；`lib/i18n/en.ts` `countryDetail.back: "Back to Global"` / `lib/i18n/zh.ts` 原文「返回全球目录」
- **证据**：英文可见文字为 "Back to Global"（`uppercase` 后显示 BACK TO GLOBAL），中文为「返回全球目录」；链接没有 `aria-label`，可见文字就是它的全部可访问名称
- **影响**：英文 "Back to Global" 是地名式名词，不是动作；中文虽有动作，但目的地写成"全球"，而这一页实际是国家目录；屏幕阅读器孤立读出时上下文不足（虽然前文有概览，链接文本本身仍应自明）
- **证据更正（TASK 07.02.1 复核）**：本卡最初记录的「中文可见文字为『全球』」有误——当时的取样语句 `querySelector("a[href='/global']")` 命中的是 Navbar 的 Global 导航项，不是详情页内的返回链接；实际原始文案是「返回全球目录」。这一取样偏差不影响"英文文案偏弱"的判断，也不改变本卡的问题定级（P2）与修复方向；中文的实际起点比原记录更好，特此更正并保留原记录以备追溯
- **推荐方案**：可见文字改为「返回国家目录 / Back to country directory」；或保留短文字 + `aria-label="返回国家目录列表"`。注意 `countryDetail.back` 的 i18n 值需同步改
- **成本**：低
- **数据/架构影响**：无
- **验收标准**：EN/ZH 下返回链接文字与 aria 均自明；不影响布局（链接变长需在 390px 复测）

---

### G-05 · P2 · 卡片 ports 行信息密度偏挤（无溢出）

- **位置**：`components/cards/CountryCard.tsx:77-80`（`ports.join(" · ")`）；`Field.tsx:60`（`dd min-w-48 max-w-full grow`）
- **证据**：实测 US 卡（文本最长的 ports）dd 宽 307.3px = 内容区满宽，右缘距卡片内容边界 1px；`scrollWidth === clientWidth`，**无溢出**
- **影响**：4 个港口名连排的长文本几乎顶满整行，阅读起点/终点不清晰；CN（4 港）、US（5 港）最明显
- **推荐方案**：ports 行内文字换用更短的展示——如限制最多显示 3 个 + "+2 more"（需 i18n），或接受现状仅微调 `gap`。**倾向后者**：数据诚实（不隐藏港口）优先，仅当国家数增长、港口更多时再引入截断
- **成本**：低（若仅微调间距）/ 中（若引入截断+计数）
- **数据/架构影响**：无
- **验收标准**：1440 与 390 下 ports 行不溢出（现状已满足）；若有截断，完整列表在详情页可见（已满足）

---

### G-06 · P2 · 中文页面标题「一个国家，一张网络」直译感

- **位置**：`lib/i18n/zh.ts` `global.title`
- **证据**：实测 1440 ZH 截图，标题「一个国家，一张网络」；英文原文 "The network, country by country"
- **影响**：中文标题比英文原意（按国家逐个看网络）更抽象，「一张网络」的量词搭配生硬；不影响理解但削弱专业感
- **推荐方案**：改为「按国家，看懂全球网络」或「逐个国家，看全球网络」（保持长度相近，不破坏布局）；EN 不动
- **成本**：低（一个字符串）
- **数据/架构影响**：无
- **验收标准**：中文标题自然、长度不引起换行异常（390px 复测）

---

### G-07 · P2 · 卡片缺少"可点击"暗示

- **位置**：`components/cards/CountryCard.tsx`（无 `CardAction`，与首页卡片不一致）
- **证据**：首页的 NetworkCard/ToolCard 等可点击卡片有 `CardAction`（"Explore —"），CountryCard 改为 `CardLink` 后没有加任何可点击暗示元素；hover 边框变化对触屏不可见
- **影响**：首访用户（尤其移动端）可能不知道卡片可点，详情页到达率受损
- **推荐方案**：在 `CountryCard` 底部加 `CardAction`（i18n 新键，如 "View profile — / 查看档案 —"），复用现有组件与 `group-hover` 动效，与首页一致
- **成本**：低
- **数据/架构影响**：无
- **验收标准**：卡片底部出现动作行；EN/ZH 均有；390px 下不破坏布局

---

### G-08 · P3 · 国家数据缺"更新时间/来源"设计位

- **位置**：`data/countries.json`（9 字段无 `source`/`updatedAt`）；`CountryDetail.tsx`
- **证据**：Concept 有 `source`/`updatedAt`（null 时 UI 不渲染），Country 完全没有该字段
- **影响**：将来接入真实数据时无渲染位；当前定性内容也缺少"最后整理于"的时间锚
- **推荐方案**：**暂不做**。等 TASK 08（Data Foundation）统一字段规范时一起加，避免两次改数据结构。⚠️ 若现在做需改 `data/countries.json` 与类型——**需要批准，不在 07.02 范围**
- **成本**：中
- **数据/架构影响**：**是**（数据结构）
- **验收标准**：（暂缓）

---

### G-09 · P3 · 无站内搜索

- **证据**：目录只有大区筛选，无文本搜索；当前 8 国不需要
- **影响**：国家数到 15-20+ 时，仅靠 3 个大区筛选不够
- **推荐方案**：**暂不做**。8 国时代是负资产（多一个无用控件）；触发条件：国家数 ≥ 12 或用户实测反馈找不到国家
- **成本**：中
- **验收标准**：（暂缓）

---

### G-10 · P3 · 详情页无"相邻国家"导航

- **证据**：详情页只有返回链接，无上一个/下一个国家
- **影响**：连续浏览多国需返回目录中转（叠加 G-02 的状态丢失，摩擦更明显）
- **推荐方案**：**暂不做**（G-02 修复后摩擦大减）。若做，按 `data/countries.json` 数组顺序给 prev/next，复用现有 Badge/Link 样式
- **成本**：中
- **数据/架构影响**：无
- **验收标准**：（暂缓）

---

### G-11 · P3 · 区域分布不均衡缺乏设计表达

- **证据**：Asia 6 / Europe 1 / North America 1（`data/countries.json`）；筛选计数如实显示
- **影响**：数据本身不均衡是事实，如实展示符合数据诚实原则；但"欧洲只有 1 国"可能让用户误以为欧洲不重要
- **推荐方案**：**暂不做**。不加说明文字去"解释"数据（那才是误导）；未来扩充欧洲国家后自然缓解
- **成本**：—
- **验收标准**：（暂缓）

---

## 6. 优先级排序（第 1–6 项为 TASK 07.02 的实施顺序；第 7–8 项暂缓）

| 序 | 问题 | 级别 | 成本 | 归属 |
|----|------|------|------|------|
| 1 | G-01 缺 h1 | **P1** | 低 | 07.02 阶段 1 |
| 2 | G-04 返回链接 | P2 | 低 | 07.02 阶段 2 |
| 3 | G-03 focus-visible | P2 | 低 | 07.02 阶段 2 |
| 4 | G-02 筛选状态保持 | P2 | 低 | 07.02 阶段 3 |
| 5 | G-07 卡片点击暗示 | P2 | 低 | 07.02 阶段 3 |
| 6 | G-06 中文标题措辞 | P2 | 低 | 07.02 阶段 2 |
| 7 | G-05 ports 密度 | P2 | — | 暂缓，见 §8（现状保持） |
| 8 | G-08~G-11 | P3 | — | 暂缓，见 §8 |

---

## 7. 推荐设计方案

### 7.1 页面信息架构（保持现有结构，只补语义）

```
/global（目录）
  SectionHeader（eyebrow + 标题[h1 ← G-01] + 描述 + Demo 徽章）   ← 结构不变
  大区筛选（4 按钮 + 计数，aria-pressed）                          ← 行为不变
  计数行（"8 countries / 8 个国家"）                               ← 不变
  卡片网格（3/2/1 列自适应）                                       ← +G-07 动作行
  数据说明（非官方统计）                                           ← 不变

/global/[code]（详情）
  返回链接（→ G-04 强化文案与 aria）
  头部（代码徽章 + 大区徽章 + h1 + 角色）                          ← 不变
  简介 → 四字段（Field 复用）                                      ← 不变
  数据说明                                                         ← 不变
```

不新增区块、不重排现有层级——当前架构（页头/筛选/网格/脚注）与信息量匹配，问题在语义标注与细节，不在骨架。

### 7.2 目录与筛选器

- 筛选交互逻辑**完全保留**（按钮 + aria-pressed + 计数），仅 G-02 加状态保持。
- 不加搜索（G-09）、不加排序、不加多选筛选——8 国数据下均为负复杂度。

### 7.3 国家卡片信息层级

保持：徽章行 → 国名 → 角色（深蓝）→ 简介 → 四字段。新增：底部 `CardAction`（G-07）。不改字号、不动令牌、不加图标。

### 7.4 详情页 ↔ 目录

- 返回链接强化（G-04）。
- 筛选状态保持（G-02）让"目录→详情→返回→下一国"的浏览循环顺畅。
- 相邻国家导航暂不做（G-10）。

### 7.5 中英文注意事项

- 所有新文案走 `lib/i18n/en.ts`（源）+ `zh.ts`（`Dictionary` 类型约束，漏译即编译错误）。
- 中文措辞避免直译（G-06 是例子）；新增文案建议在 390px 复测长度。
- `CardAction` 标签是全大写样式（`uppercase`），中文无大写但 `tracking-label` 字距仍适用——与现有「查看全部」类链接一致，无需特殊处理。

### 7.6 桌面与移动端策略

- 桌面：三列网格不变；唯一热点 G-05 维持现状（不截断），待国家数增长再议。
- 移动：单列不变；G-04 变长的返回链接、G-07 新增的动作行均需 390px 回归；筛选按钮两行换行现状可接受。

### 7.7 必须保持不变的现有功能（回归红线）

1. 8 张卡片链接与 `/global/[code]` 路由（含大小写规则与 404）
2. 大区筛选逻辑与计数
3. 双语完整性（`zh.ts` 的 `Dictionary` 类型约束保证）
4. 详情页 SEO（`generateMetadata` 标题/描述/canonical）
5. Field 容器查询行为
6. 三视口无横向滚动
7. 数据诚实性约束（不加任何统计数字）

### 7.8 明确不建议现在做

地图服务 / 第三方地图库、搜索（G-09）、相邻国家导航（G-10）、source/updatedAt 字段（G-08，需批准，归 TASK 08）、任何动画/渐变/装饰增强、卡片视觉重设计。理由见 §5 各条。

---

## 8. 暂缓实施的建议（汇总）

G-05（卡片 ports 信息密度，P2——现状无溢出，数据诚实优先，待国家数增长再评估）、G-08（数据来源字段）、G-09（搜索）、G-10（相邻导航）、G-11（区域均衡表达）。全部记录在案，附触发条件；G-08 归 TASK 08。

---

## 9. TASK 07.02 实施计划

### 目标
修复 G-01 ~ G-04、G-06、G-07（6 项）。**非目标**：不做 G-05（见 §8）与 G-08~G-11；不重构 SectionHeader 以外的组件；不碰数据结构；不新增依赖。

### 阶段划分与文件

| 阶段 | 内容 | 文件 | 目的 |
|------|------|------|------|
| **1** | h1 语义修复 | `components/ui/SectionHeader.tsx`（加 `headingLevel?: "h1"\|"h2"` 默认 `"h2"`）、`components/global/CountryDirectory.tsx`（传 `"h1"`） | 修 G-01；默认值保证其他页面零影响 |
| **2** | 文案与 focus | `lib/i18n/en.ts` + `zh.ts`（改 `countryDetail.back`、改 `global.title` 中文、加 `global.cardAction`）；`components/global/CountryDetail.tsx`（back 链接 aria）；`components/ui/Button.tsx`（BASE 加 focus-visible + 修注释）、`components/ui/Card.tsx`（CardLink 加 focus-visible） | 修 G-04 / G-06 / G-03 |
| **3** | 交互补强 | `components/global/CountryDirectory.tsx`（筛选状态模块级保持）、`components/cards/CountryCard.tsx`（加 `CardAction`，props 加 `actionLabel`） | 修 G-02 / G-07 |
| **4** | 回归验证 | 无新文件 | 三视口 × 双语全量回归（见本节「验收标准」） |

实施顺序即阶段顺序；每阶段完成后 `npm run lint` + `npm run build` 再进下一阶段。

### 回归风险

| 风险 | 缓解 |
|------|------|
| SectionHeader 加 prop 影响其他页面 | 默认值 `"h2"`，不改 prop 的页面字节级不变 |
| 返回链接变长导致 390px 换行 | 阶段 2 完成即测 390px；必要时缩短文案 |
| focus-visible 全站生效 | 这是期望行为；用首页/Tools 抽查确认无视觉突兀 |
| 筛选状态保持引入跨挂载状态 | 用模块级变量 + 挂载时读取；验证新开标签页默认全部 |
| CardAction 撑高卡片 | 卡片 `flex flex-col`，`CardAction` 自带 `mt-auto`；测 1440 三列与 390 单列高度 |

### 测试方法
- 自动：`npm run lint`、`npm run build`、`git diff --check`
- 浏览器（agent-browser）：本报告 §4 的 V1–V14 全部重跑 + 新增断言（h1 存在、返回后筛选保持、CardAction 可见）

### 验收标准
- **中英文**：所有新文案双语齐全（`zh.ts` 类型约束强制）；G-06 新标题自然
- **桌面 1440**：`/global` 恰好 1 个 `<h1>`；卡片有动作行；无溢出
- **平板 768**：双列正常；无溢出
- **移动 390**：单列正常；返回链接与动作行不换行异常；无溢出
- **键盘**：Tab 遍历筛选钮与卡片，焦点环统一可见
- **状态**：筛选 → 详情 → 返回，筛选保持
- **回归红线**：§7.7 的 7 项全部不变

### Git 提交建议（不执行）
一次提交，建议信息：`feat: improve global page semantics and interactions (TASK 07.02)`；正文列出 G-01~G-07。若 h1 改动想单独可回滚，可拆两笔：`fix: add page-level h1 via SectionHeader headingLevel` + 其余。

### 完成条件与回滚
- 完成条件：验收标准全绿 + 4 文件 diff 审查通过 + 用户批准
- 回滚：单 commit 可 `git revert`；SectionHeader 改动向后兼容（默认 prop），回滚无数据/路由影响

---

## 10. 尚未验证的事项

| 项 | 原因 | 建议 |
|----|------|------|
| 真实键盘长 Tab 遍历（完整焦点顺序） | 用 `.focus()` + computed style 替代了真实按键遍历 | 07.02 阶段 4 用真实 Tab 补测 |
| 屏幕阅读器实际朗读 | 无 AR | 已按 ARIA 规范静态审查（aria-pressed / dl / aria-label） |
| 生产环境（Vercel）表现 | 按任务要求不部署 | dev 与 build 产物一致性由 SSG 保证 |
| Firefox / Safari 渲染差异 | 仅 Chromium 实测 | Field 容器查询为标准特性，风险低 |
| `prefers-reduced-motion` | agent-browser 无法模拟 OS 偏好 | 既有全局约定（motion-safe） |
| 404 页在 zh 下的文案 | Next 默认 404 页为英文 | 记录为潜在后续项（非本任务范围） |

## 11. 风险与假设

- 假设 dev server（localhost:3000）与生产构建行为一致——由 SSG 静态预渲染保证，且 `npm run build` 通过。
- 本报告的实测均在 Chromium（agent-browser）+ 2026-10-21 代码状态（HEAD `29ceee2` + 未提交的 v0.7.1 文档改动）下进行；后续代码变化可能使个别数据过期。
- G-01 的修复涉及共享组件 `SectionHeader`，虽以默认 prop 保证兼容，仍属跨页面改动——已标记需批准。
- G-02 的"筛选状态保持"若未来引入 URL 参数方案（可分享筛选结果），需重新设计——当前方案刻意避开路由变更。

---

*报告结束。本文件为 TASK 07.01 唯一新增文件；未修改任何其他文件。*
