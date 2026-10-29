// Exercise the real TS implementation without adding a runtime dependency.
import ts from 'typescript';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const dir = mkdtempSync(join(tmpdir(), 'jstnex-extremes-'));
try {
  for (const name of ['formulas', 'calculators']) {
    const source = readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
    } }).outputText.replace('"@/lib/formulas"', '"./formulas.mjs"');
    writeFileSync(join(dir, `${name}.mjs`), output);
  }
  const c = await import(pathToFileURL(join(dir, 'calculators.mjs')).href);
  for (const scale of [1e-200, 1, 1e200]) {
    const r = c.calculateEoq({annualDemand:scale, orderingCost:scale, holdingCost:scale});
    const expected = Math.SQRT2 * Math.sqrt(scale);
    assert.equal(r.status, 'ok');
    assert.ok(Math.abs(r.value / expected - 1) < 1e-12);
  }
  assert.equal(c.calculateEoq({annualDemand:1000,orderingCost:50,holdingCost:2}).integerReference,224);
  assert.equal(c.calculateEoq({annualDemand:1e308,orderingCost:1e308,holdingCost:1e-308}).status,'undefined');
  assert.equal(c.calculateInventoryTurnover({cogs:1e308,averageInventory:1e-308}).status,'undefined');
  assert.equal(c.calculateReorderPoint({demandDuringLeadTime:1e308,safetyStock:1e308}).status,'undefined');
  assert.equal(c.calculateSafetyStock({serviceLevelZ:0,demandStdDev:10,leadTime:4}).value,0);
  console.log('Calculator extreme regression passed: representable EOQ roots, normal result, true overflow and zero.');
} finally { rmSync(dir, {recursive:true,force:true}); }
