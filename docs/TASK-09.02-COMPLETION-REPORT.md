# TASK09.02 完成报告与获取维护说明

日期2026-11-24。完成有限官方API获取、原始批次/运行回执、离线失败测试及一次在线验收。未完成清洗、发布、指标UI。

## 09.02.1 实施

scripts/acquire-wdi.py仅Python标准库；固定source2、NE.EXP.GNFS.CD、CHN/USA及2022—2024。读取并核对注册表，变更范围须先审核。无任意URL/指标CLI参数；--output只控制原始产物目录，不写observations或published。

正常CA与主机名验证，重定向限制到同一精确白名单请求集；20秒单次超时，初次+最多2次重试；429/5xx遵守Retry-After，大于60秒deferred退出；403/TLS立即失败。单响应最多2MiB、最多6页，source/indicator/data均校验响应壳、分页、总数，拒绝HTML/错误对象。指标定义对照09.00原始证据，元数据或单位漂移要求复核。

原始值不改写，JSON浮点解析用Decimal；原始字节/hash/URL/状态/时间/页数/客户端版本/署名与许可链接入manifest。先候选目录完整写入，再rename为完整批次。同内容同batchId，旧批次与原取用时间不变；每次获取另写runId/时间及请求回执。中断/失败清理候选，保留失败run，不覆盖旧成功批次。没有修改published清单。

新增RawPageReceipt、RawAcquisitionManifest类型，与09.01的本地发布关联回执分开。此处complete只表示原始获取完成，不代表数值已复核或可发布。

## 09.02.2 验证与在线证据

- python3 scripts/check-wdi-acquisition.py：16个测试方法通过，含多组状态/畸形数据。覆盖有限重试、成功重试、deferred、403/TLS、超时、HTML/错误JSON、分页成功/缺页/错total、定义漂移、单位变化、重复观测、越界重定向、损坏旧批次、中断及重复运行。
- python3 scripts/check-wdi-raw.py：当前3页原始字节、SHA256、batchId、请求范围与分页回执通过；这是完整性检查，不是发布审核。
- 在线只运行一次，3个官方HTTPS请求成功，获取来源、指标、6条数据；上游数据集更新标签为2026-11-11。批次在data/acquisition/raw/world-bank-wdi/wdi-21326e69a327f78649fb6d20db94d679b303f41eca88bf5372968aa89e625653，run-738f6246a76a464889a028f6ca9e2442.json保存请求尝试。
- 本机Python原有CA差异通过导出系统可信证书的公开部分到临时PEM并使用--ca-file解决，未使用-k/verify=False或关闭hostname校验；证书包不入库。在线后又用最终脚本离线重放同一组字节，batchId相同，新增的跨请求修订检查也通过。
- 现行官方指标页及datasets专用条款于11-24复核；CC BY4.0及附加署名/例外要求继续适用。未把这一结论扩至全部指标或其他厂商资料。
- lint、validate:data、34个采集模型契约、25个隔离数据契约、组件SSR、计算器极端值通过；生产构建19/19；diff检查通过。
- 数据校验仍11数组/62条、0错误/5覆盖警告、0生产观测；原60业务、计算器、UI、依赖、版本与旧标签未变。

## 09.02.3 操作方式

先运行离线测试；确认来源准入后，运行 `python3 scripts/acquire-wdi.py`。若本机证书链不含系统可信根，可以提供经过核实的本机可信PEM：`python3 scripts/acquire-wdi.py --ca-file /absolute/path/trusted-ca.pem`。不能为了成功而禁用验证。无有效CA时应保留失败并修复环境。

默认输出为data/acquisition/raw/world-bank-wdi；批次为wdi-<hash>子目录，运行日志为run-<uuid>.json。不得手工改旧批次内容或manifest；损坏检查失败时先隔离并查因，不能重算hash掩盖损坏。不要将运行日志的status当作网页发布状态。

脚本只使用公开API，不记录Cookie、授权头或环境变量；仅保存必要响应元信息。文件系统满、并发rename冲突、日志写入本身失败仍可能导致整体报错，不能据CLI失败反向断言不存在已完整写入批次；先离线核对。正式发布的并发/原子切换由09.03处理。

## 09.02.4 后续

[09.03任务书](TASK-09.03-NORMALIZATION-AND-PUBLICATION.md)：精确清洗、缺失与修订核对、候选快照、显式发布与回退；不把09.02的raw complete当作已完成该阶段。
