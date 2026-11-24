// Test-only TS/TSX loader in this process, using the existing compiler; no runtime dependency.
import Module, { createRequire } from "node:module";
import { cpSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
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

// The marker is enforced by Next in production; this standalone test loads server code explicitly.
const originalLoad = Module._load;
Module._load = function(request,...args) { return request === "server-only" ? {} : originalLoad.call(this,request,...args); };

const React=load("react"), {renderToStaticMarkup}=load("react-dom/server");
const {readPublishedMetrics}=load(join(root,"lib/data/published-snapshot.ts"));
const {formatMetricDecimal}=load(join(root,"lib/format-metric.ts"));
const Metrics=load(join(root,"components/global/CountryMetrics.tsx")).default;
const {LanguageProvider}=load(join(root,"components/providers/LanguageProvider.tsx"));
const store=load(join(root,"lib/i18n/languageStore.ts"));
const snapshot=readPublishedMetrics();
assert.equal(snapshot.observations.length,6);
assert.equal(formatMetricDecimal("9007199254740993.123456789","en-US"),"9,007,199,254,740,993.12");
assert.equal(formatMetricDecimal("999.999","en-US"),"1,000");
assert.equal(formatMetricDecimal("0","zh-CN"),"0");
assert.throws(()=>formatMetricDecimal("Infinity","en-US"));
for(const lang of ["en","zh"]) {
 store.getServerSnapshot=()=>lang;
 const render=(code,s=snapshot)=>renderToStaticMarkup(React.createElement(LanguageProvider,null,React.createElement(Metrics,{code,snapshot:s})));
 const html=render("CN");assert.equal((html.match(/scope="row"/g)||[]).length,3);
 assert.match(html,lang==="zh"?/宏观经济背景/:/Macroeconomic context/);
 assert.match(html.replace(/<[^>]+>/g,""),/3,828,873,971,971.62/);assert.match(html,/CC-BY-4.0/);
 const uncovered=render("JP");assert.doesNotMatch(uncovered,/<table/);
 assert.match(uncovered,lang==="zh"?/尚未覆盖/:/does not yet cover/);
 const missing=structuredClone(snapshot);missing.observations.filter(o=>o.recordId==="CN").forEach(o=>{o.value=null;o.status="missing";});
 assert.match(render("CN",missing),lang==="zh"?/暂无数据/:/Not available/);
}
const tmp=mkdtempSync("/tmp/jstnex-metric-loader-");
try {
 cpSync(join(root,"data"),join(tmp,"data"),{recursive:true});
 writeFileSync(join(tmp,"data/observations.json"),"malformed mirror");
 process.chdir(tmp);
 assert.equal(readPublishedMetrics().observations.length,6); // consumes canonical snapshot only
 for(const name of ["transaction.json",".publication.lock"]) {
  const file=join(tmp,"data/acquisition",name);writeFileSync(file,"{}");assert.throws(()=>readPublishedMetrics());rmSync(file);
 }
 const p=join(tmp,"data/acquisition/published.json"),old=readFileSync(p,"utf8");
 const manifest=JSON.parse(old);manifest.snapshotPath="../../escape";writeFileSync(p,JSON.stringify(manifest));assert.throws(()=>readPublishedMetrics());writeFileSync(p,old);
 const file=join(tmp,JSON.parse(old).snapshotPath,"observations.json");writeFileSync(file,"[]");assert.throws(()=>readPublishedMetrics());
} finally {process.chdir(root);rmSync(tmp,{recursive:true,force:true});}
console.log("Metric acceptance: EN/ZH, exact decimal formatting, missing/uncovered SSR and canonical-loader integrity passed.");
