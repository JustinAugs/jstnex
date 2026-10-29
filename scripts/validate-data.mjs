#!/usr/bin/env node
/*
  scripts/validate-data.mjs — JSTNEX 数据质量校验器（TASK 08.02）

  运行方式：npm run validate:data（即 node scripts/validate-data.mjs）

  它检查什么？
  data/*.json 这 8 个文件的：结构、必填字段、空值、ID 唯一性、枚举取值、
  双语完整性、跨文件引用、国家代码格式、公式映射，以及「枚举值 ↔ i18n 字典键」
  的对照。它只报告，绝不修改任何数据。

  三条设计原则（与 TASK 08.00 审计一致）：

  1. 枚举值绝不手抄。
     全部 allowlist 从 lib/data/enums.ts 直接 import（显式 .ts 扩展名；
     Node 22.18+ 原生 type stripping，旧版本可加 --experimental-strip-types）。
     formulaId 的合法值来自 lib/formulas.ts 的 FORMULAS 键；
     字典键对照用 lib/i18n/en.ts 的真实字典。这个文件里不存在任何一份词表副本。

  2. 区分错误、警告和「有意允许的例外」。
     错误：会让页面出错或明显违背既有 schema 的问题（缺字段、重复 ID、悬空引用…）。
     警告：不违背任何规则、但值得知道的覆盖率信息（如某个 SCOR 流程还没有概念）。
     退出码：有错误 → 1；只有警告 → 0（但明确显示警告数量）。

  3. 不为「看起来完整」而报错。
     provenance 缺省是合法的（语义 = curated，见 lib/data/provenance.ts）；
     孤立记录、单向关联、未被公司引用的概念都只是警告，不是错误 ——
     除非项目已有明确约束（例如 concepts.json 的旧 source/updatedAt 字段
     按类型约定只允许 null，填了值就是错误）。

  注意：运行时会出现 MODULE_TYPELESS_PACKAGE_JSON 警告 —— 那是 Node 提示
  package.json 没写 "type" 字段（性能提示，非错误）。刻意不加 "type": "module"，
  因为那会改变 Next 配置文件的模块语义，收益为零。
*/

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/* ------------------------------------------------------------------
   词表与权威来源（显式 .ts 扩展名；这里是唯一被允许的导入方式）
   ------------------------------------------------------------------ */
import {
  REGIONS,
  INDUSTRIES,
  SUPPLY_CHAIN_ROLES,
  CONCEPT_LEVELS,
  PROVENANCE_KINDS,
} from "../lib/data/enums.ts";

/* formulaId 的唯一权威来源：FORMULAS 的键就是全部合法公式 id */
import { FORMULAS } from "../lib/formulas.ts";

/* i18n 字典（en 是 Dictionary 的推导源头）：用于「枚举值 ↔ 显示名键」对照 */
import enDict from "../lib/i18n/en.ts";

const FORMULA_IDS = Object.keys(FORMULAS);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------------------
   收集器与基础工具
   ------------------------------------------------------------------ */

/** @type {{file:string, where:string, message:string}[]} */
const errors = [];
/** @type {{file:string, where:string, message:string}[]} */
const warnings = [];

const err = (file, where, message) => errors.push({ file, where, message });
const warn = (file, where, message) => warnings.push({ file, where, message });

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

/** LocalizedText：{en, zh} 两语都必须是非空字符串（双语完整性） */
const isLocalizedText = (v) =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  isNonEmptyString(v.en) &&
  isNonEmptyString(v.zh);

function checkLocalized(file, id, field, value) {
  if (!isLocalizedText(value)) {
    err(
      file,
      `${id} · ${field}`,
      `应为 {en, zh} 双语对象且两语非空，实际: ${JSON.stringify(value)}`,
    );
  }
}

/** 可选的 provenance：缺省（undefined/null）合法 = curated；有值则结构必须完整 */
function checkProvenance(file, id, value) {
  if (value === undefined || value === null) return;
  if (typeof value !== "object" || Array.isArray(value)) {
    err(file, `${id} · provenance`, `应为对象或 null，实际: ${JSON.stringify(value)}`);
    return;
  }
  if (!PROVENANCE_KINDS.includes(value.kind)) {
    err(
      file,
      `${id} · provenance.kind`,
      `非法取值 ${JSON.stringify(value.kind)}，允许: ${PROVENANCE_KINDS.join(", ")}`,
    );
  }
  for (const field of ["name", "url", "retrievedAt", "updatedAt"]) {
    const v = value[field];
    if (v === undefined) continue;
    if (!isNonEmptyString(v)) {
      err(file, `${id} · provenance.${field}`, "存在时必须是非空字符串");
    } else if (
      (field === "retrievedAt" || field === "updatedAt") &&
      !/^\d{4}-\d{2}-\d{2}$/.test(v)
    ) {
      err(file, `${id} · provenance.${field}`, `日期应为 YYYY-MM-DD 格式，实际: ${v}`);
    }
  }
}

/** 读取并解析一个 JSON 文件；根节点必须是数组（8 个数据文件都是） */
function loadArray(relPath) {
  const full = path.join(ROOT, relPath);
  let raw;
  try {
    raw = readFileSync(full, "utf8");
  } catch (e) {
    err(relPath, "(文件)", `无法读取: ${e.message}`);
    return null;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    err(relPath, "(解析)", `JSON 解析失败: ${e.message}`);
    return null;
  }
  if (!Array.isArray(data)) {
    err(relPath, "(根节点)", `应为顶层数组，实际: ${data === null ? "null" : typeof data}`);
    return null;
  }
  return data.map((record, i) => {
    if (record === null || typeof record !== "object" || Array.isArray(record)) {
      err(relPath, `records[${i}]`, "记录必须是对象");
      return {}; // 只用于后续检查，不修改数据文件；避免 in 运算符抛异常
    }
    // 内容 ID 是 URL-safe slug；计算器 ID 则由公式注册表约束，允许 camelCase。
    if (["data/concepts.json", "data/companies.json", "data/supply-chain-topics.json", "data/scor-processes.json"].includes(relPath) &&
        isNonEmptyString(record.id) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) {
      err(relPath, `records[${i}] · id`, "应为小写字母/数字组成、单连字符分隔的 slug");
    }
    return record;
  });
}

/** 顺序字段（topics/calculators 的 order）：必须是 1..n 且互不相同 */
function checkSequentialOrder(file, records) {
  const orders = records
    .map((r) => r?.order)
    .filter((o) => typeof o === "number" && Number.isInteger(o));
  if (orders.length !== records.length) {
    err(file, "order", `每条记录都需要整数 order（缺 ${records.length - orders.length} 个）`);
    return;
  }
  const sorted = [...orders].sort((a, b) => a - b);
  const expected = Array.from({ length: orders.length }, (_, i) => i + 1);
  const sameEvery = sorted.every((v, i) => v === expected[i]);
  if (!sameEvery) {
    const dupes = orders.filter((o, i) => orders.indexOf(o) !== i);
    err(
      file,
      "order",
      `应为 1..${orders.length} 且互不相同（连续排序被打破${dupes.length ? `，重复值: ${dupes.join(", ")}` : ""}）`,
    );
  }
}

/** 检查数组字段：确实为数组、非空、元素都通过 predicate */
function checkArrayField(file, id, field, value, { allowEmpty = false, elementDesc, predicate }) {
  if (!Array.isArray(value)) {
    err(file, `${id} · ${field}`, `应为数组，实际: ${Array.isArray(value) ? "array" : typeof value}`);
    return false;
  }
  if (!allowEmpty && value.length === 0) {
    err(file, `${id} · ${field}`, "不应为空数组");
    return false;
  }
  value.forEach((item, i) => {
    if (!predicate(item)) {
      err(file, `${id} · ${field}[${i}]`, `应为${elementDesc}，实际: ${JSON.stringify(item)}`);
    }
  });
  return true;
}

/* ------------------------------------------------------------------
   逐文件检查（先读齐全部数据，再做跨文件引用 —— 所以分两段）
   ------------------------------------------------------------------ */

const snapshot = loadArray("data/snapshot.json");
const networks = loadArray("data/networks.json");
const topics = loadArray("data/supply-chain-topics.json");
const scorProcesses = loadArray("data/scor-processes.json");
const countries = loadArray("data/countries.json");
const concepts = loadArray("data/concepts.json");
const companies = loadArray("data/companies.json");
const calculators = loadArray("data/calculators.json");

/* 用真实存在的 ID 建索引（引用检查统一走这些集合） */
const topicIds = new Set((topics ?? []).map((t) => t?.id).filter(isNonEmptyString));
const scorIds = new Set((scorProcesses ?? []).map((s) => s?.id).filter(isNonEmptyString));
const countryCodes = new Set((countries ?? []).map((c) => c?.code).filter(isNonEmptyString));
const conceptIds = new Set((concepts ?? []).map((c) => c?.id).filter(isNonEmptyString));

/* ---------- snapshot.json：首页指标卡 ---------- */
if (snapshot) {
  snapshot.forEach((item, i) => {
    const id = `records[${i}] (${item?.label?.en ?? "?"})`;
    checkLocalized("data/snapshot.json", id, "label", item?.label);
    checkLocalized("data/snapshot.json", id, "note", item?.note);
    if (item?.kind !== "demo" && item?.kind !== "coverage") err("data/snapshot.json", `${id} · kind`, "应为 demo 或 coverage");
    if (item?.kind === "coverage" && ("value" in item || "unit" in item)) err("data/snapshot.json", id, "coverage 数值必须从国家数据派生，不允许 value/unit");
    if (item?.kind !== "coverage" && !isNonEmptyString(item?.value)) {
      err("data/snapshot.json", `${id} · value`, `应为非空字符串，实际: ${JSON.stringify(item?.value)}`);
    }
    if (item?.unit !== undefined && !isNonEmptyString(item.unit)) {
      err("data/snapshot.json", `${id} · unit`, "存在时必须是非空字符串");
    }
  });
  /* label 同时是首页 DataCard 的 React key —— 重复会导致渲染告警 */
  const labels = snapshot.map((s) => s?.label?.en);
  labels.forEach((label, i) => {
    if (isNonEmptyString(label) && labels.indexOf(label) !== i) {
      err("data/snapshot.json", `records[${i}] · label.en`, `重复（"${label}" 已被前面的卡片使用，而它是 React key）`);
    }
  });
}

/* ---------- networks.json：首页网络入口卡 ---------- */
if (networks) {
  networks.forEach((item, i) => {
    const id = `records[${i}] (${item?.title?.en ?? "?"})`;
    checkLocalized("data/networks.json", id, "title", item?.title);
    checkLocalized("data/networks.json", id, "description", item?.description);
    if (!isNonEmptyString(item?.href) || !item.href.startsWith("/")) {
      err("data/networks.json", `${id} · href`, `应为站内路径（以 / 开头的非空字符串），实际: ${JSON.stringify(item?.href)}`);
    }
  });
  const titles = networks.map((n) => n?.title?.en);
  titles.forEach((title, i) => {
    if (isNonEmptyString(title) && titles.indexOf(title) !== i) {
      err("data/networks.json", `records[${i}] · title.en`, `重复（"${title}" 是 React key）`);
    }
  });
}

/* ---------- supply-chain-topics.json ---------- */
if (topics) {
  (() => {
    const seen = new Map();
    topics.forEach((t, i) => {
      const v = t?.id;
      if (!isNonEmptyString(v)) {
        err("data/supply-chain-topics.json", `records[${i}]`, "缺少非空 id");
        return;
      }
      if (seen.has(v)) {
        err("data/supply-chain-topics.json", `${v} · id`, `重复（首次出现于 records[${seen.get(v)}]）`);
      } else {
        seen.set(v, i);
      }
    });
  })();
  topics.forEach((t) => {
    const id = t?.id ?? "(无 id)";
    checkLocalized("data/supply-chain-topics.json", id, "name", t?.name);
  });
  checkSequentialOrder("data/supply-chain-topics.json", topics);
}

/* ---------- scor-processes.json ---------- */
if (scorProcesses) {
  const seen = new Map();
  scorProcesses.forEach((s, i) => {
    const v = s?.id;
    if (!isNonEmptyString(v)) {
      err("data/scor-processes.json", `records[${i}]`, "缺少非空 id");
      return;
    }
    if (seen.has(v)) {
      err("data/scor-processes.json", `${v} · id`, `重复（首次出现于 records[${seen.get(v)}]）`);
    } else {
      seen.set(v, i);
    }
  });
  scorProcesses.forEach((s) => {
    const id = s?.id ?? "(无 id)";
    checkLocalized("data/scor-processes.json", id, "name", s?.name);
    checkLocalized("data/scor-processes.json", id, "summary", s?.summary);
  });
}

/* ---------- countries.json ---------- */
if (countries) {
  const seenCodes = new Map();
  countries.forEach((c, i) => {
    const id = c?.code ?? `records[${i}]`;
    if (!isNonEmptyString(c?.code)) {
      err("data/countries.json", `${id} · code`, "缺少非空国家代码");
    } else if (!/^[A-Z]{2}$/.test(c.code)) {
      err(
        "data/countries.json",
        `${id} · code`,
        `应为大写 ISO 3166-1 alpha-2（两位大写字母），实际: ${JSON.stringify(c.code)}`,
      );
    }
    if (isNonEmptyString(c?.code)) {
      if (seenCodes.has(c.code)) {
        err("data/countries.json", `${c.code} · code`, `重复（首次出现于 "${seenCodes.get(c.code)}"）`);
      } else {
        seenCodes.set(c.code, c?.name?.en ?? `records[${i}]`);
      }
    }
    if (!REGIONS.includes(c?.region)) {
      err(
        "data/countries.json",
        `${id} · region`,
        `非法取值 ${JSON.stringify(c?.region)}，允许: ${REGIONS.join(", ")}`,
      );
    }
    for (const field of ["name", "role", "summary", "exports", "strength", "risk"]) {
      checkLocalized("data/countries.json", id, field, c?.[field]);
    }
    checkArrayField("data/countries.json", id, "ports", c?.ports, {
      elementDesc: "非空字符串（港口名不翻译）",
      predicate: (p) => isNonEmptyString(p),
    });
    checkProvenance("data/countries.json", id, c?.provenance);
  });
}

/* ---------- concepts.json ---------- */
if (concepts) {
  const seenIds = new Map();
  concepts.forEach((c, i) => {
    const id = c?.id ?? `records[${i}]`;
    if (!isNonEmptyString(c?.id)) {
      err("data/concepts.json", `${id} · id`, "缺少非空 id");
    } else if (seenIds.has(c.id)) {
      err("data/concepts.json", `${c.id} · id`, `重复（首次出现于 records[${seenIds.get(c.id)}]）`);
    } else {
      seenIds.set(c.id, i);
    }

    for (const field of ["title", "summary", "definition", "whyItMatters"]) {
      checkLocalized("data/concepts.json", id, field, c?.[field]);
    }

    if (!CONCEPT_LEVELS.includes(c?.level)) {
      err(
        "data/concepts.json",
        `${id} · level`,
        `非法取值 ${JSON.stringify(c?.level)}，允许: ${CONCEPT_LEVELS.join(", ")}`,
      );
    }

    /*
      引用：topicId 必填（键必须存在，类型是 string 不是 string | null），
      且必须指向真实主题。
      必须区分「缺键」和「值非法」：ConceptLibrary 用 topicId 做主题标签和筛选，
      缺键的概念会在除「全部」外的所有主题筛选下静默消失（TASK 08.02.1 D-V1）。
    */
    if (!c || !("topicId" in c)) {
      err("data/concepts.json", `${id} · topicId`, "缺少必填字段 topicId");
    } else if (!isNonEmptyString(c.topicId)) {
      err("data/concepts.json", `${id} · topicId`, `应为非空字符串，实际: ${JSON.stringify(c.topicId)}`);
    } else if (!topicIds.has(c.topicId)) {
      err(
        "data/concepts.json",
        `${id} · topicId`,
        `引用不存在的主题 ${JSON.stringify(c.topicId)}，现有: ${[...topicIds].join(", ")}`,
      );
    }

    /*
      scorProcess：键必须存在（类型是 string | null，不是可选）；
      值为 null 合法（该概念不归属单一流程），非 null 必须真实存在。
    */
    if (!c || !("scorProcess" in c)) {
      err("data/concepts.json", `${id} · scorProcess`, "缺少必填字段 scorProcess（值可为 null）");
    } else if (c.scorProcess !== null && !scorIds.has(c.scorProcess)) {
      err(
        "data/concepts.json",
        `${id} · scorProcess`,
        `引用不存在的流程 ${JSON.stringify(c.scorProcess)}，现有: ${[...scorIds].join(", ")}`,
      );
    }

    /*
      relatedCountries：键必须存在；null 合法；
      非 null 时必须都是真实国家代码。
    */
    if (!c || !("relatedCountries" in c)) {
      err("data/concepts.json", `${id} · relatedCountries`, "缺少必填字段 relatedCountries（值可为 null）");
    } else if (c.relatedCountries !== null) {
      checkArrayField("data/concepts.json", id, "relatedCountries", c.relatedCountries, {
        allowEmpty: true,
        elementDesc: "两位大写国家代码",
        predicate: (code) => isNonEmptyString(code) && countryCodes.has(code),
      });
    }

    /* relatedConcepts：数组（可为空）、无自引用、无重复、指向真实概念 */
    if (Array.isArray(c?.relatedConcepts)) {
      c.relatedConcepts.forEach((ref, j) => {
        if (ref === c.id) {
          err("data/concepts.json", `${id} · relatedConcepts[${j}]`, "自引用（概念不应指向自己）");
        } else if (!conceptIds.has(ref)) {
          err(
            "data/concepts.json",
            `${id} · relatedConcepts[${j}]`,
            `引用不存在的概念 ${JSON.stringify(ref)}`,
          );
        }
      });
      const dupes = c.relatedConcepts.filter((r, j) => c.relatedConcepts.indexOf(r) !== j);
      if (dupes.length > 0) {
        err("data/concepts.json", `${id} · relatedConcepts`, `重复引用: ${[...new Set(dupes)].join(", ")}`);
      }
    } else {
      err("data/concepts.json", `${id} · relatedConcepts`, `应为数组（可为空），实际: ${JSON.stringify(c?.relatedConcepts)}`);
    }

    /*
      metrics：键必须存在；null 合法；
      非 null 时每条指标必须有 name + (formula 或 formulaId)，二者不并存。
    */
    if (!c || !("metrics" in c)) {
      err("data/concepts.json", `${id} · metrics`, "缺少必填字段 metrics（值可为 null）");
    } else if (c.metrics !== null) {
      if (!Array.isArray(c.metrics)) {
        err("data/concepts.json", `${id} · metrics`, `应为数组或 null，实际: ${typeof c.metrics}`);
      } else {
        c.metrics.forEach((metric, j) => {
          checkLocalized("data/concepts.json", `${id} · metrics[${j}]`, "name", metric?.name);
          const hasFormula = isNonEmptyString(metric?.formula);
          const hasFormulaId = isNonEmptyString(metric?.formulaId);
          if (hasFormula && hasFormulaId) {
            err("data/concepts.json", `${id} · metrics[${j}]`, "formula 与 formulaId 只能有一个（另一套会被加载层忽略或报错）");
          }
          if (!hasFormula && !hasFormulaId) {
            err("data/concepts.json", `${id} · metrics[${j}]`, "缺少 formula 或 formulaId（没有可展示的公式）");
          }
          if (hasFormulaId && !FORMULA_IDS.includes(metric.formulaId)) {
            err(
              "data/concepts.json",
              `${id} · metrics[${j}].formulaId`,
              `引用不存在的公式 ${JSON.stringify(metric.formulaId)}，现有: ${FORMULA_IDS.join(", ")}`,
            );
          }
          if (metric?.unit !== undefined && !isNonEmptyString(metric.unit)) {
            err("data/concepts.json", `${id} · metrics[${j}].unit`, "存在时必须是非空字符串");
          }
        });
      }
    }

    /*
      旧溯源字段（TASK 08.01 起被 provenance 取代）：类型约定只允许 null。
      填了真实值 = 有人往废弃字段里写数据，必须报错并迁移到 provenance。
    */
    for (const field of ["source", "updatedAt"]) {
      if (c?.[field] !== undefined && c?.[field] !== null) {
        err(
          "data/concepts.json",
          `${id} · ${field}`,
          `旧溯源字段只允许 null（TASK 08.01 起改用 provenance），实际: ${JSON.stringify(c[field])}`,
        );
      }
    }

    checkProvenance("data/concepts.json", id, c?.provenance);

    if (typeof c?.featured !== "boolean") {
      err("data/concepts.json", `${id} · featured`, `应为布尔值，实际: ${JSON.stringify(c?.featured)}`);
    }
  });
}

/* ---------- companies.json ---------- */
if (companies) {
  const seenIds = new Map();
  companies.forEach((c, i) => {
    const id = c?.id ?? `records[${i}]`;
    if (!isNonEmptyString(c?.id)) {
      err("data/companies.json", `${id} · id`, "缺少非空 id");
    } else if (seenIds.has(c.id)) {
      err("data/companies.json", `${c.id} · id`, `重复（首次出现于 records[${seenIds.get(c.id)}]）`);
    } else {
      seenIds.set(c.id, i);
    }

    if (!REGIONS.includes(c?.region)) {
      err(
        "data/companies.json",
        `${id} · region`,
        `非法取值 ${JSON.stringify(c?.region)}，允许: ${REGIONS.join(", ")}`,
      );
    }
    if (!INDUSTRIES.includes(c?.industry)) {
      err(
        "data/companies.json",
        `${id} · industry`,
        `非法取值 ${JSON.stringify(c?.industry)}，允许: ${INDUSTRIES.join(", ")}`,
      );
    }
    if (!SUPPLY_CHAIN_ROLES.includes(c?.role)) {
      err(
        "data/companies.json",
        `${id} · role`,
        `非法取值 ${JSON.stringify(c?.role)}，允许: ${SUPPLY_CHAIN_ROLES.join(", ")}`,
      );
    }

    for (const field of ["name", "country", "summary", "supplyChainStrength", "supplyChainRisk"]) {
      checkLocalized("data/companies.json", id, field, c?.[field]);
    }

    checkArrayField("data/companies.json", id, "keyActivities", c?.keyActivities, {
      elementDesc: "{en, zh} 双语对象",
      predicate: (a) => isLocalizedText(a),
    });

    if (c?.relatedConcepts !== undefined) {
      if (!Array.isArray(c.relatedConcepts)) {
        err("data/companies.json", `${id} · relatedConcepts`, `应为数组，实际: ${typeof c.relatedConcepts}`);
      } else {
        c.relatedConcepts.forEach((ref, j) => {
          if (!conceptIds.has(ref)) {
            err("data/companies.json", `${id} · relatedConcepts[${j}]`, `引用不存在的概念 ${JSON.stringify(ref)}`);
          }
        });
        const dupes = c.relatedConcepts.filter((r, j) => c.relatedConcepts.indexOf(r) !== j);
        if (dupes.length > 0) {
          err("data/companies.json", `${id} · relatedConcepts`, `重复引用: ${[...new Set(dupes)].join(", ")}`);
        }
      }
    }

    checkProvenance("data/companies.json", id, c?.provenance);
  });
}

/* ---------- calculators.json ---------- */
if (calculators) {
  const seenIds = new Map();
  calculators.forEach((k, i) => {
    const id = k?.id ?? `records[${i}]`;
    if (!isNonEmptyString(k?.id)) {
      err("data/calculators.json", `${id} · id`, "缺少非空 id");
    } else if (seenIds.has(k.id)) {
      err("data/calculators.json", `${k.id} · id`, `重复（首次出现于 records[${seenIds.get(k.id)}]）`);
    } else {
      seenIds.set(k.id, i);
    }
    if (!FORMULA_IDS.includes(k?.formulaId)) {
      err(
        "data/calculators.json",
        `${id} · formulaId`,
        `引用不存在的公式 ${JSON.stringify(k?.formulaId)}，现有: ${FORMULA_IDS.join(", ")}`,
      );
    }
    checkLocalized("data/calculators.json", id, "title", k?.title);
    checkLocalized("data/calculators.json", id, "summary", k?.summary);
  });
  checkSequentialOrder("data/calculators.json", calculators);
}

/* ------------------------------------------------------------------
   交叉核对（需要多个文件都读完才能做的检查）
   ------------------------------------------------------------------ */

/* 1. 公式注册表自身的结构（不重算公式，只查结构完整性） */
for (const [formulaId, formula] of Object.entries(FORMULAS)) {
  const where = `lib/formulas.ts · ${formulaId}`;
  if (!isNonEmptyString(formula?.expression)) err("lib/formulas.ts", `${where} · expression`, "应为非空字符串");
  if (!isNonEmptyString(formula?.resultUnit)) err("lib/formulas.ts", `${where} · resultUnit`, "应为非空字符串");
  if (!Array.isArray(formula?.variables) || formula.variables.length === 0) {
    err("lib/formulas.ts", `${where} · variables`, "应为非空数组");
  } else {
    const keys = formula.variables.map((v) => v?.key);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length > 0) {
      err("lib/formulas.ts", `${where} · variables`, `输入键重复: ${[...new Set(dupes)].join(", ")}`);
    }
  }
}

/* 被任何计算器或概念指标引用过的公式 */
const referencedFormulas = new Set([
  ...(calculators ?? []).map((k) => k?.formulaId).filter(isNonEmptyString),
  ...(concepts ?? []).flatMap((c) => (Array.isArray(c?.metrics) ? c.metrics : []).map((m) => m?.formulaId)).filter(isNonEmptyString),
]);
for (const formulaId of FORMULA_IDS) {
  if (!referencedFormulas.has(formulaId)) {
    warn("lib/formulas.ts", formulaId, `公式没有任何计算器或概念指标使用（仅提示，不阻断）`);
  }
}

/* 2. 枚举值 ↔ i18n 显示名键对照（防止「加了枚举忘了加翻译」在运行时才爆） */
const dictChecks = [
  { label: "INDUSTRIES", values: INDUSTRIES, keys: Object.keys(enDict.companies.industries) },
  { label: "SUPPLY_CHAIN_ROLES", values: SUPPLY_CHAIN_ROLES, keys: Object.keys(enDict.companies.roles) },
  { label: "CONCEPT_LEVELS", values: CONCEPT_LEVELS, keys: Object.keys(enDict.supplyChain.levels) },
];
for (const { label, values, keys } of dictChecks) {
  for (const value of values) {
    if (!keys.includes(value)) {
      err(
        "lib/i18n/en.ts + zh.ts",
        `${label} → 字典键`,
        `枚举值 "${value}" 没有对应的显示名键（en.ts 缺失时 zh.ts 也必然缺失）。缺少的值: ${value}`,
      );
    }
  }
}
/* 大区的显示名走 dict.regions[regionKey(region)]：映射函数在 index.ts 的
   regionKey() 里，其 default 分支（never + 抛错）与「索引 dict.regions 的键」
   已被 TypeScript 编译期锁定，这里不重复实现映射逻辑。 */

/* 3. 覆盖率提示（仅警告 —— 没有业务规则要求每个流程/概念都必须被引用） */
for (const processId of scorIds) {
  const used = (concepts ?? []).some((c) => c?.scorProcess === processId);
  if (!used) {
    warn("data/scor-processes.json", processId, `SCOR 流程 "${processId}" 没有任何概念使用（数据增长时自然会补上）`);
  }
}
if (concepts && companies) {
  const referenced = new Set(
    companies.flatMap((c) => (Array.isArray(c?.relatedConcepts) ? c.relatedConcepts : [])),
  );
  for (const conceptId of conceptIds) {
    if (!referenced.has(conceptId)) {
      warn("data/concepts.json", conceptId, `概念没有被任何公司的 relatedConcepts 引用（孤立但合法）`);
    }
  }
}

/* ------------------------------------------------------------------
   汇总输出与退出码
   ------------------------------------------------------------------ */

const FILES = [
  ["data/snapshot.json", snapshot],
  ["data/networks.json", networks],
  ["data/supply-chain-topics.json", topics],
  ["data/scor-processes.json", scorProcesses],
  ["data/countries.json", countries],
  ["data/concepts.json", concepts],
  ["data/companies.json", companies],
  ["data/calculators.json", calculators],
];

const totalRecords = FILES.reduce((sum, [, data]) => sum + (data?.length ?? 0), 0);

console.log("── JSTNEX 数据质量校验 ──────────────────────────────");
console.log(`词表: lib/data/enums.ts（${REGIONS.length} 地区 · ${INDUSTRIES.length} 行业 · ${SUPPLY_CHAIN_ROLES.length} 角色 · ${CONCEPT_LEVELS.length} 层级 · ${PROVENANCE_KINDS.length} 溯源性质）`);
console.log(`公式: lib/formulas.ts（${FORMULA_IDS.length} 个） · 字典: lib/i18n/en.ts（仅对照）`);
console.log("");
for (const [file, data] of FILES) {
  const count = data === null ? "✗ 无法读取" : `${data.length} 条记录`;
  const fileErrors = errors.filter((e) => e.file === file).length;
  const mark = data === null ? "✗" : fileErrors > 0 ? "✗" : "✓";
  console.log(`  ${mark} ${file.padEnd(32)} ${count}${fileErrors > 0 ? ` · ${fileErrors} 个错误` : ""}`);
}

const crossErrors = errors.filter((e) => e.file.startsWith("lib/")).length;
/* 这一行只反映交叉核对自身：数据文件有错但交叉核对干净时，仍应显示 ✓。
   全局成败由下方 errors.length 统一判断，不在这里混入。 */
console.log(`  ${crossErrors > 0 ? "✗" : "✓"} 交叉核对（引用 · 枚举 · 字典键 · 公式）`);

if (errors.length > 0) {
  console.log("");
  console.log(`── 错误（${errors.length}）──────────────────────────────`);
  for (const e of errors) {
    console.log(`  ✗ [${e.file}] ${e.where}`);
    console.log(`      ${e.message}`);
  }
}

if (warnings.length > 0) {
  console.log("");
  console.log(`── 警告（${warnings.length}，不阻断）────────────────────────`);
  for (const w of warnings) {
    console.log(`  ⚠ [${w.file}] ${w.where}: ${w.message}`);
  }
}

console.log("");
console.log("──────────────────────────────────────────────────────");
console.log(`结果: ${FILES.length} 个文件 · ${totalRecords} 条记录 · ${errors.length} 错误 · ${warnings.length} 警告`);

if (errors.length > 0) {
  console.log("状态: ✗ 未通过（存在硬性错误，退出码 1）");
  process.exitCode = 1;
} else {
  console.log(
    warnings.length > 0
      ? "状态: ✓ 通过（仅有警告，均为覆盖率提示，退出码 0）"
      : "状态: ✓ 通过（无错误无警告）",
  );
}
