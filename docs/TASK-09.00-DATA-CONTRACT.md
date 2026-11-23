# TASK 09.00 字段与批次契约草案

2026-11-23。状态：09.01的实现依据，**尚未实现的新schema**。已有国家/企业/概念Provenance不被本文件自动改变。

## 1. 三个注册/事实层

### Source（来源注册）

字段：id（稳定slug）、publisher/name（双语）、datasetCode、datasetUrl、apiBase、licenseId、licenseUrl、termsUrl、attribution（双语）、licenseCheckedAt（有效日期）、admission（approved/hold/rejected）、evidenceRefs（仓库相对路径）。

首个sourceId拟为`world-bank-wdi`；datasetCode=`2`；publisher=World Bank；licenseId=`CC-BY-4.0`加WB附加条款；termsUrl使用https://www.worldbank.org/ext/en/legal/terms-conditions/datasets，保留summary URL为辅助证据。approved表示经过本项目准入复核，不表示发布机构认证本站。首次注册即保留逐指标许可证据；源被hold/rejected时禁止新的发布批次引用它。

### Indicator（口径注册）

字段：id（稳定slug）、sourceId、providerIndicatorId、name/definition（双语自写摘要）、unit、currency、priceBasis、scale、frequency、coverage、countryMapping、allowedYears、allowedStatuses。

首个id拟为`exports-goods-services-current-usd`；providerIndicatorId=`NE.EXP.GNFS.CD`；unit=`USD`、currency=`USD`、priceBasis=`current`、scale=`1`、frequency=`annual`；coverage=经济体全部货物与服务出口（国民账户口径，不等于实物跨境流）。映射只允许CN↔CHN、US↔USA；初始allowedYears=2022/2023/2024。翻译为“货物与服务出口额（当年美元）”，不简写“货运总量”。

### Observation（字段级事实）

| 字段 | 契约 |
|---|---|
| recordId | 既有countries.code，初始仅CN/US，不按显示名称猜国家 |
| indicatorId/sourceId | 必须同时存在且彼此匹配；不得由记录级来源代替 |
| period | YYYY，仅允许指标白名单年份；不能用retrievedAt的年填入 |
| value | JSON十进制字符串或null；仅普通十进制表示、无NaN/Infinity，不能空串；本指标有效值非负；禁止在获取层四舍五入 |
| status | observed/missing；observed要求非null，missing要求null；这是本站完整性状态，**不宣称官方最终值/无估算** |
| unit/currency/priceBasis/scale | 必须与指标注册表完全一致；不能把API空unit理解成未知货币或百万单位 |
| batchId | 必须引用存在且已校验的采集批次 |
| retrievedAt | 本次实际成功取得响应的ISO8601 UTC时间，与批次一致 |
| checkedAt | 本站实际完成字段复核的有效日期；不替代取用或源发布时间 |
| upstreamDatasetUpdatedAt | 可null；来自该响应lastupdated，明确为数据集级标签 |
| sourcePublishedAt/sourceRevisedAt | 可null；没有逐观测证据则null，禁止拷贝datasetUpdatedAt冒充 |
| providerObservationStatus | 原样保留API obs_status（可空字符串）；空不等于最终/无估算 |

唯一键=`sourceId + indicatorId + recordId + period`；一个发布快照中不得重复。对比新旧批次时同键不同value是修订候选，不在同一数组堆两条冒充新期间。原始国家id/iso3和指标id都需校验。

value使用字符串为保留十进制精度，Python清洗用json的parse_float=Decimal，并保留整数精确值；无数学处理需求时不转二进制float。UI可以明确缩放显示，但必须标注单位及舍入，不将格式化结果写回原值。不引Decimal第三方依赖、不做跨国求和/增长率/汇率换算。

## 2. 采集manifest与目录（09.02/03拟实现）

- batchId：由source、固定请求参数、原始内容hash构成确定性身份；日志runId可另设。相同请求和相同字节不产生重复事实。内容批次不可改写；另存每次获取的runId/实际时间，相同内容重取不覆盖旧批次的首次retrievedAt。重放已有字节沿用其原日期，不伪造再次取源。
- 请求：固定HTTPS origin、规范化query、调用时间、最终URL、HTTP status、contentType、超时/重试次数；不得跟随到非白名单host。
- 响应：原始文件路径、SHA256、字节数、page/pages/total、数据集更新标签、每个分页内容hash；所有分页都存在才算complete。
- 处理：parserVersion、schemaVersion、Python版本、输入hash集合、输出hash、校验/复核状态；许可核对证据必须存在。
- 发布：published manifest引用一个完整通过的批次，不记录虚构publishedAt。采集失败的日志不得覆盖原成功manifest。

拟目录：`data/acquisition/raw/<source>/<batch>/` → `data/acquisition/curated/<batch>/` → `data/observations.json`与`data/acquisition/published.json`。raw是公开数据，可归档小样本；不得存Cookie、凭据、账号个人数据或未经许可的全文。09.00的docs/evidence不自动成为此生产目录。

## 3. 负向与重放验收矩阵

| 编号 | 输入 | 必须结果 |
|---|---|---|
| C01 | 未注册source/indicator/country或country/iso3错配 | 拒绝 |
| C02 | USD变LCU、百万scale、constant price、指标code或年度错配 | 拒绝，即使数字有限 |
| C03 | 日期不真实、期间被抓取年替代、批次日期不一致 | 拒绝；日期角色可相同但须分别有来源，不能仅因同日就判混用 |
| C04 | null→0、missing配非null、observed配null、NaN/Infinity/空值 | 拒绝；真正的0保持observed合法 |
| C05 | 重复键、未来/不在白名单年份、负出口额、未知obs_status值 | 拒绝或隔离复核，不能静默吞掉 |
| C06 | 分页total不符、缺页、指标元数据缺失/定义改变、原始hash不符 | 不生成可发布批次 |
| C07 | HTTP200但错误对象/HTML、401/403、TLS失败、429/5xx重试耗尽 | 获取失败，保留旧快照 |
| C08 | 未准入许可、缺署名/出处、source hold/rejected | 拒绝发布 |
| C09 | 同期历史值变更、单位/口径冲突 | 保存差异及旧批次，人工核对后才替换；不取平均 |
| C10 | 写入中断、校验失败、跨批次混写 | 原published manifest和快照保持完整；可重放回退 |
| C11 | 相同响应重复处理 | 输出稳定、不新增重复观测、不制造新取用日期 |
| C12 | 显示缩放/语言切换 | USD单位、年份、数值含义一致；没有原值精度被格式化覆盖 |

C01—C05/08的本地结构部分先在09.01实现；C06/07在09.02，C09—C11在09.03，C12在09.04/06。本表是验收要求，不是已通过的测试记录。
