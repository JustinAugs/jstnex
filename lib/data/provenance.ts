/*
  lib/data/provenance.ts — 数据溯源（TASK 08.01，对应 TASK 07.01 的 G-08）

  为什么需要这个类型？

  TASK 07.01 审计指出：国家数据没有 source / updatedAt 这类「这行字是哪来的」字段。
  核实后发现情况比审计记录的更广 —— 三个内容域（国家 / 企业 / 概念）都没有可用的溯源信息，
  概念虽然有 `source` 和 `updatedAt` 字段，但 14 条记录全是 null，界面也从不显示。

  这带来一个具体的后果：现在页面上的定性描述（"中国是全球最大的制造业基地"）
  没有任何地方可以记录它的依据。将来接入真实数据源时（TASK 09），
  这些内容无处安放来源，只能塞进正文 —— 那就再也分不清哪句话有依据。

  但要说清楚一件事：**当前数据并没有假装有来源**。
  四个页面已经在字典里明确写了政策（not official statistics / manually curated /
  no revenue, market share, ranking），所以这是「将来没地方记」的结构缺口，
  不是「现在就写错了」。这一点决定了下面两条设计原则。

  ------------------------------------------------------------------
  两条原则
  ------------------------------------------------------------------

  1. 不为现有记录编造来源、URL 或日期。
     35 条内容记录（8 国 + 13 企业 + 14 概念）目前一条 provenance 都不填。
     缺省语义由下面的 provenanceOf() 明确给出 —— 也就是「人工整理」。
     「人工整理」是诚实的描述，不是占位符，更不是假数据。

  2. 类型上「可缺省」和运行时「有默认值」是两件事，必须分开表达。
     TypeScript 的 `?` 只说明「这个字段可以不存在」，它**不会**在运行时补上任何值。
     所以不要在组件里写 `record.provenance.kind` 就直接用 —— 那样在缺省时会崩。
     统一走 provenanceOf(record)，它负责把「没有」翻译成「curated」。
     这也是为什么这个文件导出的不是裸类型，而是一个带默认值的读取函数。
*/

/*
  溯源的性质。为什么要 kind 而不是「有没有 URL」？

  因为「人工整理」和「官方口径」是两种不同的可信度声明，而前者根本没有 URL 可填。
  如果只用 `source: {name, url, retrievedAt} | null`，那 null 到底是
  「没整理过」还是「整理过但没有链接」就分不清了。
  kind 让「人工整理」成为一等公民 —— 这正是当前全部数据的真实状态。

  TASK 08.01.1：kind 的取值清单（PROVENANCE_KINDS / ProvenanceKind）已并入
  lib/data/enums.ts —— 那里是全部受控词表的唯一来源，08.02 的校验脚本
  只要读一个文件就能拿到所有 allowlist，不会再手抄一份。
  本文件只保留「溯源长什么样（Provenance）」和「怎么读（provenanceOf）」。
  这里 re-export ProvenanceKind，让外部仍然可以只从溯源模块拿到完整的一套。
*/
import type { ProvenanceKind } from "./enums";

export type { ProvenanceKind };

/*
  一条记录的溯源信息。

  kind        必填 —— 唯一必须有值的字段，因为它决定了其余字段怎么解读
  name        可选 —— 来源名称（例如「UNCTAD Review of Maritime Transport」）
  url         可选 —— 来源链接
  retrievedAt 可选 —— 取用日期，YYYY-MM-DD
  updatedAt   可选 —— 该记录最后一次核对/更新的日期，YYYY-MM-DD

  为什么日期是 string 而不是 Date？
  JSON 里没有 Date 类型，硬转成 Date 会在序列化/时区上引入麻烦。
  这里只当「一个带格式约定的标签」用，不参与任何计算。
*/
export type Provenance = {
  kind: ProvenanceKind;
  name?: string;
  url?: string;
  retrievedAt?: string;
  updatedAt?: string;
};

/*
  读取一条记录的溯源信息，缺省时返回「人工整理」。

  这是「原始数据可缺省」与「处理后具有默认语义」之间的唯一转换点。
  组件只应该通过它拿 provenance，不要自己去判断 null / undefined，
  否则默认值的规则会散落到各个组件里。

  注意：它不会修改传入的对象，也不会给 JSON 补字段 —— 只是返回一个默认视图。
*/
export function provenanceOf(record: {
  provenance?: Provenance | null;
}): Provenance {
  return record.provenance ?? { kind: "curated" };
}
