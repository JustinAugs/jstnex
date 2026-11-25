// Optional full-path Chrome acceptance; use an existing Playwright installation.
import {pathToFileURL}from'node:url';
import{mkdirSync,writeFileSync,readFileSync}from'node:fs';
import assert from'node:assert/strict';
import en from'../lib/i18n/en.ts';import zh from'../lib/i18n/zh.ts';
const {chromium}=await import(pathToFileURL(process.env.JSTNEX_PLAYWRIGHT_MODULE).href);
const base=process.env.JSTNEX_TEST_URL||'http://localhost:3107',out=process.env.JSTNEX_BROWSER_OUTPUT||'/tmp/jstnex-release-browser';mkdirSync(out,{recursive:true});
const calculators=JSON.parse(readFileSync(new URL('../data/calculators.json',import.meta.url),'utf8'));
const inputs={eoq:{annualDemand:'100',orderingCost:'2',holdingCost:'1'},safetyStock:{serviceLevelZ:'1.65',demandStdDev:'10',leadTime:'4'},reorderPoint:{demandDuringLeadTime:'100',safetyStock:'20'},inventoryTurnover:{cogs:'1000',averageInventory:'200'}};
const expected={eoq:'20',safetyStock:'33',reorderPoint:'120',inventoryTurnover:'5'};
const b=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true}),records=[];
try{for(const width of[390,768,1440])for(const lang of['en','zh']){
const d=lang==='en'?en:zh,c=await b.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await c.addInitScript(l=>localStorage.setItem('jstnex-language',l),lang);
const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
async function go(path){assert.equal((await p.goto(base+path)).status(),200);await p.waitForFunction(l=>document.documentElement.lang===(l==='zh'?'zh-CN':'en'),lang);}
await go('/');for(const anchor of['country-directory','port-directory','network-exploration'])assert.ok(await p.locator(`a[href="/global#${anchor}"]`).count());
await go('/global');const regions=p.getByRole('group',{name:d.global.filterLabel});await regions.getByRole('button').filter({hasText:d.regions.europe}).click();
await p.locator('#country-directory a[href="/global/de"]').click();await p.getByRole('heading',{level:1}).waitFor();await p.getByRole('link',{name:d.countryDetail.back,exact:true}).click();
await p.getByRole('group',{name:d.global.filterLabel}).waitFor();assert.equal(await p.getByRole('group',{name:d.global.filterLabel}).getByRole('button').filter({hasText:d.regions.europe}).getAttribute('aria-pressed'),'true');
await go('/companies');await p.getByRole('searchbox').fill('DHL');await p.getByText(d.review.filters,{exact:true}).click();
for(const [group,label]of[[d.companies.filters.filterByIndustry,d.companies.industries.logistics],[d.companies.filters.filterByRegion,d.regions.europe],[d.companies.filters.filterByRole,d.companies.roles['logistics-provider']]])await p.getByRole('group',{name:group,exact:true}).getByRole('button').filter({hasText:label}).click();
await p.getByRole('status').filter({hasText:'1'}).waitFor();await p.getByText(d.review.details,{exact:true}).click();
await p.getByRole('searchbox').fill('zzzz-no-company');await p.getByRole('status').filter({hasText:'0'}).waitFor();await p.getByRole('button',{name:d.review.clear,exact:true}).click();await p.getByRole('status').filter({hasText:'13'}).waitFor();
await go('/supply-chain');const topics=p.getByRole('group',{name:d.supplyChain.library.filterLabel});await topics.getByRole('button').nth(1).click();assert.equal(await topics.getByRole('button').nth(1).getAttribute('aria-pressed'),'true');
const scor=p.locator('#scor-processes');assert.match(await scor.locator('aside').innerText(),/ASCM/);assert.equal(await scor.locator('details').count(),7);
await go('/tools');for(const calc of calculators){await p.getByRole('button',{name:calc.title[lang],exact:true}).click();await p.getByRole('button',{name:d.tools.calculate,exact:true}).click();assert.ok(await p.locator('input[aria-invalid="true"]').count());
for(const[key,value]of Object.entries(inputs[calc.formulaId]))await p.locator(`#${key}`).fill(value);
await p.getByRole('button',{name:d.tools.calculate,exact:true}).click();assert.ok((await p.locator('[aria-live="polite"]').innerText()).includes(expected[calc.formulaId]));await p.getByRole('button',{name:d.tools.reset,exact:true}).click();assert.match(await p.locator('[aria-live="polite"]').innerText(),new RegExp(d.tools.enterValues.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));}
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);records.push({width,lang,homeAnchors:true,countryReturnFilter:true,companyCombinedFilters:true,knowledgeFilter:true,calculators:4,errors});await c.close();}
writeFileSync(out+'/report.json',JSON.stringify({browser:'Chrome',version:b.version(),records},null,2));console.log('Release browser: 6 language/width journeys, 24 calculator cases and navigation/filter paths passed.');}finally{await b.close();}
