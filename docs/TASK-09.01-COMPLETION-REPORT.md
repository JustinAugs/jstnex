# TASK09.01 完成报告

2026-11-24。来源/指标/观测类型、单一运行时词表、注册表及本地校验完成。原60条业务内容、UI、计算器、依赖和版本未改。

## 09.01.1 实施结果

- lib/data/acquisition.ts提供DataSource、DataIndicator、Observation、BatchManifest、PublishedManifest，types.ts仅转出类型；未向客户端加载器加入新数据依赖。
- enums.ts提供admission/status/frequency/priceBasis唯一词表；校验器直接复用。
- sources.json仅注册已于11-23核实的WDI，indicators.json仅注册NE.EXP.GNFS.CD、CN/US、2022—2024；没有把研究样本拷入生产观测。
- observations.json为空；published.json为schemaVersion=1、batches=[]。明确输出“0 observations; no published metric data”。
- 校验覆盖来源/双语/安全URL/日期/证据存在性、受控值、关联/唯一键、country/ISO3、期间、十进制值与missing/null、单位与口径、批次关联与日期一致性、未知provider状态。WDI注册表关键口径另对照09.00审核证据，不能只改指标code就默认准入。
- 新增纯函数校验模块及34个内存正反例；既有隔离数据测试扩至25例，包含未审核provider code。隔离副本增加docs，保证来源证据存在性检查同样执行。

## 09.01.2 核查

lint通过；validate:data为11数组/62条（旧60业务+来源1+指标1）、0错误、5既有覆盖警告；另检查published对象。新观测0。
34个新契约用例、25个数据隔离用例、组件SSR契约、计算器极端值通过；生产构建19/19通过；git diff --check通过。

首轮集成因import放到shebang之前导致脚本解析失败，已恢复shebang首行后重跑通过；隔离副本原来不含docs，已同步复制证据以避免错误假失败。

## 09.01.3 实际边界

BatchManifest当前只是本地来源/日期关联回执，不包含完整网络分页、字节hash与发布审核；09.02/03必须扩展后方可发布真实观测。结构合法不是可发布认证。当前非空观测只在隔离测试中构造。

本地只能检验日期角色/期间允许值，不能从相同日期自动判定含义混用；原始表口径、许可真实性、来源权威与数值真伪仍需人工复核。provider空状态不证明最终值或无估算。原始null被人为改成真实0不能仅凭结构识别，09.03必须逐项对照raw。

WDI证据锁定含国家映射及窗口；扩源/改窗口须先复核并更新证据，而非静默绕过。未来09.02获取、09.03清洗/原子发布、09.04显示未实施；L10/L11浏览器限制仍保留，本轮无UI修改未重复浏览器验收。

## 09.01.4 下一步

执行[TASK09.02任务书](TASK-09.02-BOUNDED-ACQUISITION.md)，仅实现有边界的官方API获取和原始回执，不提前写生产观测或新增界面。
