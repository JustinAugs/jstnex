# 阶段03合并实施与核查报告

日期：2026-10-29。实施基线：35b8483。范围：03.01—03.05，完整实施、本地核查，未发布。

## 03.00 设计与边界

使用 design-taste-frontend。目录、工具与阅读详情采用 app-screen 规则，首页采用公共入口页规则。脚本候选为 achromatic-ledger / framed-sheet，选择前者的信息层级与轻界面方向，保留已有黑白灰、深蓝与系统字体，不重建应用外壳，不引入远程字体或素材。

产品的真实对象为8国、13家企业、14个概念、7个SCOR流程、4个教学计算器、3个网络入口及4项snapshot。它们决定页面结构：入口负责导向，目录负责筛选，详情负责阅读，工具负责计算。没有新增统计、来源、日期或关系；数据文件、公式与计算实现diff为空。

## 03.01 企业页 — 已完成

- 搜索保持直接可用，结果数和首条企业前置。
- 三组高级筛选置于原生details内，支持键盘开关；选中的行业、地区、角色摘要位于折叠区域外。
- 有筛选或搜索时显示清除按钮，一次重置四个条件。
- 企业默认展示身份、角色、简介与所在地；完整关键活动、优势、风险保留在可展开档案内。
- 13家企业均保留；结果数增加status语义。没有新增不存在的企业详情路由。
- 实测半导体＋欧洲＋供应商只返回ASML；档案展开后资料可见；清除恢复13家。

## 03.02 知识库 — 已完成

- 页首提供概念库、SCOR流程及真实Tools入口。
- 概念库先于SCOR展示；主题筛选仍来自原数据，库存筛选返回5个概念。
- 概念定义默认可读；解释、公式、相关国家和条件性来源在“概念详解”内，保留全部原有字段与来源策略。
- SCOR由两轮重复名称／说明合并为单个有序列表，七流程名称和顺序不变，每条解释按需展开，中英文术语保留。
- SCOR概览移至概念库后，可从页首直接跳转，不强制滑过14条概念。
- 实测概念与SCOR原生summary可用Enter展开。首轮误用企业档案式展开文案已修正并重拍知识库6组样本。

## 03.03 首页 — 已完成

- 去除hero装饰网格渐变，使用平面浅底；缩小手机图形、调整标题尺寸与首屏留白。
- 网络图空白208px预留槽取消；选中国家的信息仍在正常文档流中展示。
- 企业由六张完整档案改成三家概要预览，保留到/companies的链接，并增加明确的全部企业入口。
- 首页三个网络入口继续指向country-directory、port-directory、network-exploration，不改变已有契约。
- 四项snapshot完整保留，逐条Demo与实际8国覆盖说明不变。
- 代价：选中图形节点时信息会使hero增高；不再以整块空槽维持所有交互前后的固定高度。它不会以绝对定位遮住标题或按钮。

## 03.04 工具页及共享交互 — 已完成

- 计算器取消768px限宽；≥1024px为输入／结果两栏，手机和平板保持输入→操作→结果的DOM顺序。
- 保留模型切换、公式、字段提示、preset、假设、错误、结果与整数参考说明。
- 四模型各以全1输入实测：EOQ1.41／整数参考2、安全库存1、再订货点2、周转率1，均可重置。
- 输入边框加深，恢复明确的键盘focus-visible轮廓；小字13→14px，caption11→12px，标签字距减小。
- 共享区块垂直间距由56–96px收敛到32–56px；SectionHeader减少重复顶线与空白。
- 导航使用不透明白底；既有Escape及焦点返回保留，手机实测Escape后expanded=false。
- 增加减少动态效果偏好的CSS支持；未对所有SVG动效做完整读屏或真实设备认证。

## 03.05 Global与国家详情 — 已完成

- 国家目录近页首提供国家、港口、网络探索分区入口。
- 明文标注“地区筛选仅作用于国家目录”，港口索引仍是全部国家，不误导为全页筛选。
- 港口索引改为按国家可展开，端口数来自数组长度，名称完整保留，减少默认重复文本。
- 国家详情只做共享字级、间距及字段区最大阅读宽度调整，没有添加无来源内容。
- 改版后重复02.06检查：Europe→德国→浏览器后退，y350.5→350.5，Europe保留、焦点回到德国卡片。

## 03.06 响应式与视觉核查

6类页面（首页、企业、知识库、工具、Global、中国详情）×中英文×1440／768／390，共36组完整截图。12张分段联系表逐张审读，覆盖完整纵向内容；灰色拼图留白不是网页区域。没有横向溢出，每个样本一个h1。

| 指标（英文390px） | 改版前 | 改版后 |
|---|---:|---:|
| 企业首条标题y | 1274 | 633 |
| 知识库首概念标题y | 2371 | 869 |
| 首页第二主要区块标题y | 1400 | 907 |
| 首页页面高度 | 9952 | 6393 |
| 企业页面高度（默认收起） | 9532 | 4999 |
| 知识库页面高度（默认收起） | 9444 | 6508 |

这是默认浏览密度的改善，不等于内容删除，也不是性能指标。展开全部资料后页面会变长。工具页手机总高度没有显著缩短：更大的说明字号与完整假设仍需空间，主要改善在桌面两栏和字段层级。

### ROUND 2（首轮实施后）

Seen in one second: 目录先看到搜索与对象概要，工具看到模型和输入，首页看到主题与行动。
Idea (one sentence): 以国家、企业、概念、计算四种真实对象组织供应网络的入口与阅读深度。
Live thing: 搜索、组合筛选、原生展开、网络节点与计算器，不额外制造装饰运动。
Layout words by section: home=split/grid/preview；companies=search/disclosure/grid；knowledge=nav/library/ordered-list；tools=form/result；global=directory/index；country=profile/definition-list。
Scores: design6.5 · usability7.5 · creativity6.0 · content8.0 → overall6.9（人工评审，非认证）。
Caps applied: 首页仍包含小标签、卡片与细线，未达到skill严格营销页全部审美门槛；功能页不强制照片／装饰运动。运行时inspector未通过启动，因此没有自动运行时通过结论。
Top three problems and disposition:
1. 企业首屏筛选墙，证据companies-en-390.png。已用可展开筛选、外部摘要和一键清除处理。
2. SCOR重复内容阻挡概念，证据supply-chain-en-390.png。已重排概念入口、合并流程并按需展开。
3. 首页长档案和空图形槽，证据home-en-390.png。已改预览并取消空槽；图形选择引起的高度变化作为明确取舍。

### ROUND 3（文案与回归收尾）

Seen in one second: 核查后仍以真实对象、当前条件和操作入口为主。
Idea (one sentence): 概要先读，完整资料按需读。
Live thing: 四模型实算、组合条件和返回焦点已验证。
Layout words by section: 与ROUND2相同，未为追求差异重建布局。
Scores: design6.5 · usability7.5 · creativity6.0 · content8.0 → overall6.9。
Caps applied: 同ROUND2；没有把分数上调至7.5。剩余风格问题是首页连续网格仍较多、Global默认国家档案较长、手机计算操作仍需滚动。保留内容与功能优先，阶段04无需因此新增未经规划的大改。
Top three problems and disposition:
1. 概念展开标签误称档案，已改“Concept details／概念详解”，重拍全部知识库样本。
2. 自动样式扫描把注释⚠误报为UI emoji，确认是注释，记录而未修改业务内容。
3. 长资料展开后占高增加，保留用户控制；未以截断或删字段换取更低高度。

## 03.07 工程检查与限制

- npm run lint：退出0，无输出问题。
- npm run validate:data：60条记录、0错误、5条原有覆盖警告，退出0。
- node scripts/check-calculator-extremes.mjs：通过。
- NEXT_PUBLIC_SITE_URL=https://jstnex.vercel.app npm run build -- --webpack：17/17页面通过。
- git diff --check：通过；业务JSON、lib/formulas.ts、lib/calculators.ts无改动。
- skill inspect.mjs：Chrome exited early, code null；失败日志完整保留，没有声称0运行时FAIL。
- skill源码风格lint：page2 FAIL/2 WARN；app1 FAIL/5 WARN。page包含网络图行动箭头细线与注释emoji；app的FAIL是SCOR注释emoji。公式等宽字与注释破折号警告保留，不等同功能错误。未用忽略注释掩盖扫描结果。
- IAB本地生产构建验证，不代表Safari／Firefox实机、全部8国长文本、完整WCAG、真实减少运动设置或线上部署已验收。
- 本轮未增加依赖、取源、统计、地区、版本号或生产配置；未推送／部署。

证据位于本次聊天工作目录 outputs/stage03：index.html、measurements.json、tool-checks.json、logs/。仓库不包含这些生成截图；改版前证据位于 outputs/aesthetic-audit。

## 04 下一阶段计划

04.01核实Vercel生产／预览环境和NEXT_PUBLIC_SITE_URL；04.02检查sitemap、robots及收录策略；04.03按发布范围执行全量检查与推送；04.04部署后核对公开域名、canonical、OG与关键操作。生产配置未核实前，不把本地通过视为线上完成。
