// Optional browser acceptance. Supply an installed Playwright module; no project dependency added.
import { pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(process.env.JSTNEX_PLAYWRIGHT_MODULE).href);
const base = process.env.JSTNEX_TEST_URL || 'http://localhost:3000';
const out = process.env.JSTNEX_BROWSER_OUTPUT || '/tmp/jstnex-country-metrics-browser';
mkdirSync(out,{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const records=[];
try {
 for (const width of [390,768,1440]) for (const language of ['en','zh']) {
  const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.addInitScript(lang=>localStorage.setItem('jstnex-language',lang),language);
  const page = await context.newPage();const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for (const code of ['cn','us','jp']) {
   const response=await page.goto(`${base}/global/${code}`);assert.equal(response.status(),200);
   await page.waitForFunction(lang=>document.documentElement.lang===(lang==='zh'?'zh-CN':'en'),language);
   const section=page.locator('section[aria-labelledby="country-metrics-heading"]');
   await section.scrollIntoViewIfNeeded();
   const text=await section.innerText();
   if(code==='jp') {
    assert.equal(await section.locator('table').count(),0);
    assert.match(text,language==='zh'?/尚未覆盖/:/does not yet cover/);
   } else {
    assert.equal(await section.locator('tbody tr').count(),3);
    assert.match(text,/2022/);assert.match(text,/2023/);assert.match(text,/2024/);assert.match(text,/USD/);
    assert.match(text,/CC-BY-4.0/);assert.match(text,/2026-11-24/);
    assert.match(text,code==='cn'?/3,828,873,971,971.62/:/3,215,368,000,000/);
    const links=section.locator('a');assert.equal(await links.count(),3);
    for(let i=0;i<3;i++)assert.match(await links.nth(i).getAttribute('href'),/^https:\/\//);
    await links.first().focus();assert.equal(await links.first().evaluate(e=>e===document.activeElement),true);
    await page.keyboard.press('Tab');assert.equal(await links.nth(1).evaluate(e=>e===document.activeElement),true);
    const outline=await links.nth(1).evaluate(e=>getComputedStyle(e).outlineStyle);assert.notEqual(outline,'none');
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${width}/${language}/${code} overflow`);
   await section.screenshot({path:`${out}/${code}-${language}-${width}.png`});
   records.push({width,language,code,overflow,rows:code==='jp'?0:3});
  }
  // Two-times text size is an additional reflow check, not a Safari/device certification.
  await page.goto(`${base}/global/cn`);await page.waitForFunction(()=>document.querySelector('table'));
  await page.waitForFunction(lang=>document.documentElement.lang===(lang==='zh'?'zh-CN':'en'),language);
  await page.addStyleTag({content:'html { font-size: 200% !important; }'});
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const reflow=page.locator('section[aria-labelledby="country-metrics-heading"]');
  const bounds=await reflow.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,right:e.getBoundingClientRect().right}));
  assert.ok(bounds.scroll<=bounds.width+1 && bounds.right<=width+1,JSON.stringify(bounds));
  await reflow.screenshot({path:`${out}/metrics-200-${language}-${width}.png`});
  const spill=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent?.slice(0,60),right:e.getBoundingClientRect().right})));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,JSON.stringify(spill));
  await page.screenshot({path:`${out}/text-200-${language}-${width}.png`,fullPage:true});
  const menu=page.locator('button[aria-controls="mobile-navigation"]');
  if(await menu.isVisible()){await menu.click();await page.locator('#mobile-navigation').waitFor({state:'visible'});await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await menu.evaluate(e=>e===document.activeElement),true);}
  assert.deepEqual(errors,[]);await context.close();
 }
 const context=await browser.newContext();const p=await context.newPage();await p.goto(`${base}/global/cn`);
 await p.getByRole('button',{name:'中文',exact:true}).click();await p.getByRole('heading',{name:'宏观经济背景',exact:true}).waitFor();
 await p.getByRole('button',{name:'EN',exact:true}).click();await p.getByRole('heading',{name:'Macroeconomic context',exact:true}).waitFor();
 records.push({languageToggle:'en→zh→en',passed:true});await context.close();
 writeFileSync(`${out}/report.json`,JSON.stringify({browser:'Chrome',records},null,2));
 console.log(`Browser acceptance: ${records.length-1} page/language/width cases + language toggle, keyboard links, 200% text and no console errors passed.`);
} finally {await browser.close();}
