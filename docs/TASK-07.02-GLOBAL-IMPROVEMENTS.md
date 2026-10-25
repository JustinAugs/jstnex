# TASK 07.02 — Global Directory Improvements

> 实施记录。编写于 2026-10-25（TASK 07.03 收口时整理）。
> 本文件只记录**已经发生并有证据可查**的事实；凡无法核实的测试明细，均明确标注，不补齐。

---

## 1. 任务背景与基线

TASK 07.01 对 `/global` 与 `/global/[code]` 做了可视化审计，产出
`docs/TASK-07.01-GLOBAL-VISUAL-AUDIT.md`（11 个问题，G-01–G-11）。TASK 07.02 负责实施其中
被接受的六项：**G-01、G-02、G-03、G-04、G-06、G-07**；G-05、G-08–G-11 明确不在范围内。

| 项 | 值 |
|----|-----|
| 实施前基线 | `33db2df`（`docs: finalize v0.7.1 release candidate records`） |
| 实施提交 | `80a8da7` — `fix: address global directory audit findings` |
| 提交规模 | 12 个文件，+133 / −26 |
| 发布文档提交 | `4f591e2` — `docs: finalize v0.7.1 release notes`（仅 CHANGELOG + README） |
| 正式 tag | `v0.7.1`（附注式），指向 `4f591e2` |
| 代码是否后续变动 | **否**：`git diff 80a8da7..HEAD -- components lib app data` 为空 |

---

## 2. 修改范围与文件清单

`80a8da7` 的 12 个文件：

| 文件 | 对应问题 | 改动要点 |
|------|---------|---------|
| `components/ui/SectionHeader.tsx` | G-01 | 新增 `headingLevel?: "h1" \| "h2"`，默认 `"h2"`；标题标签改为动态 |
| `components/global/CountryDirectory.tsx` | G-01 / G-02 / G-07 | 传 `headingLevel="h1"`；筛选状态改为模块级 store；传 `actionLabel` |
| `components/companies/CompanyDirectory.tsx` | G-01 | 传 `headingLevel="h1"` |
| `components/supplyChain/SupplyChainView.tsx` | G-01 | 同上 |
| `components/tools/ToolDirectory.tsx` | G-01 | 同上 |
| `components/ui/Button.tsx` | G-03 | BASE 增加 `focus-visible:outline-2/outline-solid/outline-offset-2/outline-ink`；注释与实现对齐 |
| `components/ui/Card.tsx` | G-03 | BASE 增加同一套 focus-visible（覆盖所有 `CardLink`） |
| `components/global/CountryDetail.tsx` | G-04 | 返回链接加 focus-visible；注释说明不以 `aria-label` 重复可见文字 |
| `components/cards/CountryCard.tsx` | G-07 | 新增 `actionLabel` prop 与底部 `<CardAction />` |
| `lib/i18n/en.ts` | G-04 / G-07 | `countryDetail.back` 改写；新增 `global.cardAction` |
| `lib/i18n/zh.ts` | G-04 / G-06 / G-07 | 同上 + `global.title` 改写 |
| `docs/TASK-07.01-GLOBAL-VISUAL-AUDIT.md` | — | 更正 G-04 的证据取样偏差（见 §4） |

**未触碰**：`package.json`、`package-lock.json`、`data/`、`app/`、`.env`、部署配置；G-05 的
`ports.join(" · ")` 与 `Field` 布局 0 处改动。

---

## 3. 六项与实现的对应关系

### G-01 · 页面主标题语义（P1）

`SectionHeader` 原来硬编码 `<h2>`，导致四个目录页没有 `<h1>`。现改为可选 `headingLevel`，
默认仍 `"h2"`（首页各区块、`ConceptLibrary` 等调用点不受影响），四个页面显式传 `"h1"`。
**视觉字号仍是 `text-h2`**，只改 HTML 语义与文档大纲。

### G-02 · 筛选状态保持（P2）

原来筛选值存在组件 `useState` 里，进入详情页再返回时组件重挂载、状态回到 All。现改为
模块级变量 + `useSyncExternalStore`：

- `getServerSnapshot()` 返回 `null`（= All），与构建时预渲染的 HTML 一致，避免 hydration mismatch；
- `getSnapshot()` 读模块级 `savedRegion`；`setSavedRegion()` 更新后通知订阅者；
- 整页加载时模块重新初始化 → 回到 All（这是刻意保留的行为，不是缺陷）。

未使用 URL 参数、localStorage 或全局状态库。

### G-03 · 键盘焦点样式（P2）

`Button` BASE 与 `Card` BASE 各加一套 `:focus-visible` 焦点环（2px、ink 色、2px offset），
详情页返回链接同步；`Button.tsx` 注释从"focus 已统一处理"改为与实现一致的描述。
静态 `<Card>`（div）不可聚焦，class 无副作用；hover / disabled 规则未动。

### G-04 · 返回链接文案（P2）

`countryDetail.back` 由 `Back to Global` / 「返回全球目录」改为
`Back to country directory` / 「返回国家目录」。可见文字本身即完整可访问名称，
因此**没有**再加 `aria-label`——同义重复会被读屏器念两遍。

### G-06 · 中文标题（P2）

`zh.ts` `global.title`：「一个国家，一张网络」→「按国家，看懂全球网络」（英文未动）。
属审计给出的两个候选之一。

### G-07 · 卡片可点击暗示（P2）

`CountryCard` 底部加 `CardAction`（`mt-auto` 贴底、`group-hover` 横线变长），文案由页面通过
新增的必填 prop `actionLabel` 传入：`View profile` / 「查看档案」。仅 `CountryDirectory`
一处调用，无遗漏风险。

---

## 4. G-04 审计证据取样偏差的更正

审计时记录"中文返回链接可见文字为『全球』"。复核发现：当时的取样语句
`querySelector("a[href='/global']")` 在详情页**先命中了 Navbar 的 Global 导航项**，而不是页面内
的返回链接；页面内返回链接的中文原文实际是「返回全球目录」。

- 该偏差**不影响**"英文 `Back to Global` 偏弱"的判断；
- **不改变** G-04 的定级（P2）与修复方向；
- 已在 `80a8da7` 内更正审计报告的 §1 摘要、§2.3、§2.5、§4 V7 与 G-04 问题卡（含"证据更正"条目）。

---

## 5. 浏览器验证记录

**来源说明**：以下结论来自 TASK 07.02 实施完成后的一次实测（2026-10-25，agent-browser +
本地 dev server，Chromium，1440×900 / 768×900 / 390×844，EN 与 ZH）。**TASK 07.03 没有重新
运行这些测试**；完整 V1–V14 逐项明细未持久化到仓库，本文件只保留可核实的结论。

| 验证点 | 结果 |
|--------|------|
| 四个页面 h1 数量 | 各 1 个；`/supply-chain` 另有 2 个 h2（页内子区块） |
| `/global` 结构 | 8 卡、4 个筛选按钮（All 8 / Asia 6 / North America 1 / Europe 1） |
| Europe 筛选 → 德国详情 → 返回 | 仍为 Europe、1 卡（修复前会重置为 All、8 卡） |
| Asia / All 的同类路径 | 分别保持 6 卡 / 8 卡 |
| 浏览器后退 / 前进 | 后退回目录仍 Asia/6 卡；前进回详情 h1 正确 |
| 整页刷新 | 回到 All（设计如此） |
| 未知国家代码 `/global/zz` | 404 |
| 焦点样式（筛选按钮 / 卡片） | `outline: solid 2px rgb(10,10,10)`、`offset 2px`、`:focus-visible` 命中 |
| 键盘操作 | 真实按键：Enter 触发筛选（Asia→6 卡）、Enter 打开卡片（→ `/global/cn`） |
| 三视口横向滚动 | 1440 / 768 / 390 均 `scrollWidth == clientWidth` |
| 卡片尺寸 | 1440 三列 357px（高 615→631，+16 为动作行）；768 两列 352px；390 单列 342px |
| 卡片动作行 | 8 张卡全部存在，位于卡片边界内 |
| 控制台错误 | 0 |

---

## 6. 未验证事项与局限

以下各项**没有**被验证过，不得当作已验证：

- 真实屏幕阅读器的朗读行为（仅有静态 ARIA 审查与 `aria-pressed` / `<dl>` 结构检查）。
- Firefox / Safari 的渲染与焦点环表现（只在 Chromium 测过）。
- OS 级 `prefers-reduced-motion` 的实际行为。
- 线上生产页面的实际渲染（本环境无法访问 `*.vercel.app`；Vercel 部署状态只作为部署事实记录）。
- 触屏真机上的"整卡可点"可发现性（只有 DOM 层证据）。
- TASK 07.02 的完整 V1–V14 明细：未落盘，仅有结论性摘要。

---

## 7. 提交、tag 与证据之间的关系

| 对象 | SHA / 值 | 含义 |
|------|---------|------|
| 实施提交 | `80a8da7` | 六项修复 + 审计证据更正（12 文件） |
| 发布文档提交 | `4f591e2` | CHANGELOG 0.7.1 补全 + README 发布措辞（2 文件） |
| 正式 tag | `v0.7.1` | **附注式** tag，指向 `4f591e2`（不是 `80a8da7`） |
| 当前 HEAD | `4f591e2` | 与 tag 指向同一提交 |

**关键区别**：

1. `v0.7.1` 指向的是**文档提交** `4f591e2`，而实施代码在它的父提交 `80a8da7` 中——两者之间
   只有文档差异，所以 tag 内容等价于"六项修复 + 完整发布记录"。
2. **Git tag 创建 ≠ 部署成功。** 推送 `main` 时 Vercel 分别对 `80a8da7`（2026-10-25T03:04:58Z）
   和 `4f591e2`（2026-10-25T05:07:18Z）触发过构建，两者的 commit status 均为 `success` /
   "Deployment has completed"；随后单独推送 `v0.7.1` tag 没有新增 commit；未观察到可归因于
   该 tag 的新构建（GitHub 只提供按 commit 的状态，无法枚举 tag 触发的部署）。
   Production 属性由项目负责人确认，技术侧没有独立证据可以验证。
3. 本文件所在提交（TASK 07.03 收口）**不改变**上述任何代码或版本状态。

---

*记录结束。本文件不构成新的产品变更，也不替代 CHANGELOG 的发布说明。*
