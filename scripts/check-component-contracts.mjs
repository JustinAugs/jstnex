// Test-only TS/TSX loader in this process, using the existing compiler; no runtime dependency.
import Module, { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import ts from "typescript";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const load = createRequire(import.meta.url);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return originalResolve.call(this, request.startsWith("@/") ? join(root, request.slice(2)) : request, ...args);
};
for (const extension of [".ts", ".tsx"]) {
  Module._extensions[extension] = (module, file) => module._compile(ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, file);
}
const React = load("react");
const { renderToStaticMarkup } = load("react-dom/server");
const SourceField = load(join(root, "components/ui/SourceField.tsx")).default;
const CompanyCard = load(join(root, "components/cards/CompanyCard.tsx")).default;
const data = load(join(root, "lib/data/index.ts"));
const { LanguageProvider } = load(join(root, "components/providers/LanguageProvider.tsx"));
const source = { kind: "official", name: "Fixture <source>", url: "https://example.org/report", retrievedAt: "2024-02-29" };
const field = provenance => renderToStaticMarkup(React.createElement("dl", null, React.createElement(SourceField, { provenance, label: "Source" })));
assert.equal(field(undefined), "<dl></dl>");
assert.equal(field({ kind: "curated" }), "<dl></dl>");
assert.match(field(source), /href="https:\/\/example.org\/report"/);
assert.match(field(source), /Fixture &lt;source&gt;/);
assert.match(field(source), /noopener noreferrer/);
assert.doesNotMatch(field({ ...source, url: "javascript:alert(1)" }), /<a/);
assert.doesNotMatch(field({ ...source, name: " " }), /Source/);
const companyProps = {
  name: "Fixture", industry: "Industry", role: "Role", country: "Country", region: "Region",
  summary: "Summary", keyActivities: [], strength: "Strength", risk: "Risk", detailsLabel: "Details",
  labels: {location:"Location", keyActivities:"Activities", strength:"Strength", risk:"Risk", source:"Source"},
};
const card = props => renderToStaticMarkup(React.createElement(CompanyCard, { ...companyProps, ...props }));
assert.match(card({provenance:source}), /href="https:\/\/example.org\/report"/);
assert.doesNotMatch(card({}), /Source/);
assert.doesNotMatch(card({provenance:source, href:"/companies"}), /example.org/); // no nested link in home preview
// Change the real directory's input record IDs only, while keeping their formula definitions.
const saved = data.CALCULATORS.map(record => record.id);
try {
  data.CALCULATORS.forEach((record, i) => {record.id = `independentCalculator${i}`;});
  const ToolDirectory = load(join(root, "components/tools/ToolDirectory.tsx")).default;
  const html = renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(ToolDirectory)));
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /annualDemand/);
  const { formulaFor } = load(join(root, "lib/formulas.ts"));
  const { calculateEoq } = load(join(root, "lib/calculators.ts"));
  assert.equal(formulaFor(data.CALCULATORS[0].formulaId).id, "eoq");
  assert.equal(calculateEoq({annualDemand:100,orderingCost:2,holdingCost:1}).value,20);
} finally {data.CALCULATORS.forEach((record,i)=>{record.id=saved[i];});}
console.log("Component contracts: source visibility, link safety, company details and independent calculator IDs passed (SSR; no browser interaction claim).");
