// Isolated mutations exercise the production validator; never write business data in-place.
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { isCalendarDate, isSourceUrl } from "../lib/data/provenance.ts";
import { GLOBE_NODES, globeNodeErrors } from "../lib/data/globe-nodes.ts";
const root = fileURLToPath(new URL("../", import.meta.url));
let checks = 0;
function fixture(name, mutate, expected, diagnostic) {
  const dir = mkdtempSync(join(tmpdir(), "jstnex-contract-"));
  try {
    for (const entry of ["data", "lib", "scripts", "docs"]) cpSync(join(root, entry), join(dir, entry), { recursive: true });
    const edit = (file, change) => {
      const path = join(dir, file);
      const data = JSON.parse(readFileSync(path, "utf8"));
      change(data); writeFileSync(path, JSON.stringify(data));
    };
    mutate(edit, dir);
    const result = spawnSync(process.execPath, [join(dir, "scripts/validate-data.mjs")], { encoding: "utf8" });
    assert.equal(result.status, expected, `${name}: ${result.stdout} ${result.stderr}`);
    if (diagnostic) assert.match(result.stdout, diagnostic, name);
    checks++;
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const source = { kind: "official", name: "Isolated source fixture", url: "https://example.org/report", retrievedAt: "2024-02-29" };
fixture("baseline", () => {}, 0, /5 警告/);
fixture("valid leap day + real-source shape", edit => edit("data/companies.json", rows => rows[0].provenance = source), 0);
for (const value of ["2025-02-29", "2024-02-30", "2024-13-01", "2024-00-01", "0000-01-01", "2024-2-1"]) {
  assert.equal(isCalendarDate(value), false);
  fixture(`invalid date ${value}`, edit => edit("data/companies.json", rows => rows[0].provenance = { ...source, retrievedAt: value }), 1, /有效日历日期/);
}
for (const value of ["javascript:alert(1)", "file:///tmp/a", "https://", "https://user:pass@example.org/a", " https://example.org"]) {
  assert.equal(isSourceUrl(value), false);
  fixture(`invalid URL ${value}`, edit => edit("data/countries.json", rows => rows[0].provenance = { ...source, url: value }), 1, /HTTP\(S\)/);
}
for (const field of ["name", "url", "retrievedAt"]) {
  fixture(`missing source ${field}`, edit => edit("data/concepts.json", rows => {
    rows[0].provenance = { ...source }; delete rows[0].provenance[field];
  }), 1, /真实来源必须填写/);
}
fixture("curated default stays optional", edit => edit("data/companies.json", rows => rows[0].provenance = { kind: "curated" }), 0);
fixture("calculator ID independent of formula", edit => edit("data/calculators.json", rows => rows[0].id = "independentCalculator"), 0);
fixture("unknown formula fails", edit => edit("data/calculators.json", rows => rows[0].formulaId = "missingFormula"), 1, /formulaId/);
fixture("removing a displayed country fails", edit => edit("data/countries.json", rows => rows.splice(rows.findIndex(c => c.code === "CN"), 1)), 1, /unknown country CN/);
fixture("unreviewed provider code fails", edit => edit("data/indicators.json", rows => rows[0].providerIndicatorId = "OTHER.CODE"), 1, /reviewed evidence/);
const codes = new Set(GLOBE_NODES.map(n => n.code));
assert.deepEqual(globeNodeErrors(GLOBE_NODES, codes), []);
for (const [nodes, message] of [
  [[...GLOBE_NODES, GLOBE_NODES[0]], /duplicate country/],
  [[{code:"XX",x:200,y:200}], /unknown country/],
  [[{code:"CN",x:351,y:200}], /inside the globe/],
  [[{code:"CN",x:NaN,y:200}], /inside the globe/],
]) { assert.match(globeNodeErrors(nodes, codes).join(" "), message); checks++; }
assert.equal(isCalendarDate("2000-02-29"), true);
assert.equal(isCalendarDate("1900-02-29"), false);
assert.equal(isSourceUrl("https://example.org/a?year=2024#table"), true);
console.log(`Data contracts: ${checks} isolated cases passed; source JSON unchanged.`);
