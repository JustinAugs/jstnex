# TASK 09.00 来源登记与准入结论

核对日期2026-11-23。结论是本项目当前用途下的准入决定，不是泛化的法律保证；来源公开可读不等于可批量复制。下列均为发布方原站，未用转载内容替代原文许可。

## S01 World Bank WDI：先行数值源

- 发布方：World Bank；底层提供者按指标元数据为各经济体统计机构、中央银行及WB估算。source=2，NE.EXP.GNFS.CD。
- [指标页](https://data.worldbank.org/indicator/NE.EXP.GNFS.CD) 明示CC BY-4.0；[数据使用摘要](https://data.worldbank.org/summary-terms-of-use)要求署名、保留附加条款及遵守逐指标例外；[官方API说明](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)说明v2及无需密钥。
- [指标查询说明](https://datahelpdesk.worldbank.org/knowledgebase/articles/898599-indicator-api-queries)与[查询结构](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581)作为获取实现依据。旧数据集条款URL现重定向到[新版条款入口](https://www.worldbank.org/ext/en/legal/terms-conditions)，不能将通用网页非商业限制误套为已取消逐指标CC许可；已找到并阅读全文的[现行数据集专用条款](https://www.worldbank.org/ext/en/legal/terms-conditions/datasets)确认数据集条款冲突时优先；须同时保留入口、专用条款、数据摘要与具体指标的例外证据。
- 许可决定：**准入首批固定指标的归档/再显示设计**，在09.01注册逐指标证据，并在首次发布前再次核对。不能扩展为所有WDI指标一律准入。署名拟为“World Bank: World Development Indicators: country official statistics, national accounts data files and World Bank staff estimates”；页面同时提供许可及条款链接，注明本站翻译/格式化，不暗示WB背书，不复用徽标。
- 获取：官方HTTPS JSON API，维护者手动触发；原始JSON小样本可保留和重放。无密钥、付费、浏览器或Reach依赖。不批量下载整个WDI。
- 口径：年度货物与服务出口、当年USD，API原值scale=1；不是实物流量。不含站内其他风险/优势文字的证据。
- 频率：指标为年度，上游数据集可能更频繁修订；API未承诺本站固定更新日，不编造SLA。拟每月人工复核，真实执行日期才可记录。
- 缺失/冲突：保留null；原值修订需留档和差异复核。2023—2025实测US2025缺失，故发布先行窗口选2022—2024。样本不是“最新年度”的承诺。

## S02 ASCM SCOR DS：Order与Return各自的模型候选

候选位置：[SCOR DS主页](https://www.ascm.org/corporate-solutions/standards-tools/scor-ds/) 的Order、Return说明；[Open Access Guidance](https://www.ascm.org/corporate-solutions/standards-tools/scor-ds/open-access-guidance/) 的许可及翻译FAQ。

结果：官方索引内容明确许可为CC BY-NC-ND 4.0，要求署名、不允许未授权翻译标准；本轮完整页面实时读取403，许可结论以官方检索快照为依据，**不是实时完整页面通过**。后续取得正式许可/可核实原版前不导入标准原文、译文或模型图。

Order候选=SCOR的接单流程边界；Return候选=SCOR的逆向流程边界。二者用途仅为辨别分类，不把通用“订单管理”全部生命周期硬塞进Order，也不把原标准的翻译冒充本站原创。处置：**暂缓内容再发布**；09.05以独立原创概念与可复用证据复核为目标，必要时只交付拒绝结论。不会为了关闭2条警告自动加来源或复制标准。

现有站点的双语流程名称与本站概括说明仍是curated教学内容，不能因这次发现就断言已侵权或已获授权；09.05逐段核查是否借用了受保护表达，补明确的SCOR归属、原站链接与内容性质说明；若有直接翻译/图文复制则先隔离该内容，处理许可后再发布。不得用一个WDI来源替其背书。

## S03 IBM：Order/Return的独立知识核对候选

- Order：[Order management](https://www.ibm.com/think/topics/order-management)。Return：[Reverse Logistics overview](https://www.ibm.com/docs/en/order-management?topic=logistics-reverse-overview)。均为厂商第一方说明，不能当作中立国际标准或任一既有企业实际采用模型的证明。
- [IBM网站条款](https://www.ibm.com/legal/terms)限制使用、镜像及爬取；未发现给予本站双语再发布的开放许可。
- 决定：**不进入自动取源、全文缓存或中文改写发布链**。可作为后续人工事实核对的候选链接；若需要复制/翻译其表达，先取得相应许可或换独立可复用资料。不得把网页可访问当作可批量采集授权。
- 这使Order/Return各已有明确候选与许可结论，但不等于内容补齐；09.05继续找匹配用途且可复用的材料。

## S04 DHL：企业事实候选，非首批数字源

[2025年报原站](https://reporting-hub.group.dhl.com/2025-fy/en/combined-management-report/report-on-economic-position/supply-chain-division-1/) 与 [官方投资者入口](https://group.dhl.com/en/investors.html)可核实业务分部及年度口径。2025完整年度与2026季度报告不能混成一个期间。

该页未核实到面向本站的开放再发布许可；dhl.com的通用条款也不能自动代替reporting-hub子域的许可。决定：**候选/许可待核实**，不自动抓全文、不复制图表、不引入财务数字，不给整条企业风险/优势挂“年报已证实”的统一来源。09.05如选此企业，需逐字段核对原页、期间、主体（集团/分部）与复用方式，缺证则保持curated且不新增权威数字。

## S05 OpenStax：未选用

[Principles of Marketing §17.6](https://openstax.org/books/principles-marketing/pages/17-6-logistics-and-its-functions)内容用途与Order/Return不完全匹配，其当前页许可为非商业/相同方式共享，并另列AI使用条件，不能假定所有OpenStax教材均为CC BY4.0。决定：**本批排除**，不把该页作为生成新概念的素材，不保存正文/图像；仅登记许可风险。

## 准入状态汇总

| 域 | 当前可进入后续实现 | 当前不可自动发布 |
|---|---|---|
| 国家宏观指标 | S01的一个明确指标、两国、三年、逐观测来源 | 其他指标、其他国家、实时/全球总数或流量解释 |
| Order | S02分类/许可复核、S03候选核对 | 标准翻译、厂商正文/示例复制 |
| Return | S02分类/许可复核、S03候选核对 | 同上；无依据的企业实践关联 |
| 企业 | S04逐字段来源/主体/许可审阅 | 整条档案权威化、财务统计或模型采用断言 |

若来源政策变更，旧许可记录保留，新增发布停止至复核；不通过代理、登录绕过或安装更多爬虫工具解决许可问题。
