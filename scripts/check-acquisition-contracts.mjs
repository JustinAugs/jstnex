import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { acquisitionErrors } from './validate-acquisition.mjs';
const read = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
const base={sources:read('sources'),indicators:read('indicators'),observations:[],published:{schemaVersion:1,batches:[]}};
const b={id:'fixture-batch',sourceId:'world-bank-wdi',retrievedAt:'2024-02-29T12:00:00Z',checkedAt:'2024-02-29',upstreamDatasetUpdatedAt:null};
const o={recordId:'CN',countryIso3:'CHN',sourceId:b.sourceId,indicatorId:base.indicators[0].id,period:'2024',value:'0',status:'observed',unit:'USD',currency:'USD',priceBasis:'current',scale:1,batchId:b.id,retrievedAt:b.retrievedAt,checkedAt:b.checkedAt,upstreamDatasetUpdatedAt:null,sourcePublishedAt:null,sourceRevisedAt:null,providerObservationStatus:''};
const run=x=>acquisitionErrors(x,new Set(['CN','US']),()=>true);
assert.deepEqual(run(base),[]);
const valid={...base,published:{schemaVersion:1,batches:[b]},observations:[o]};assert.deepEqual(run(valid),[]);
assert.deepEqual(run({...valid,observations:[{...o,status:'missing',value:null}]}),[]);
let cases=3;
for(const [field,value]of [['countryIso3','USA'],['recordId','XX'],['sourceId','missing'],['indicatorId','missing'],['period','2026'],['unit','LCU'],['currency','EUR'],['scale',1000000],['priceBasis','constant'],['value',''],['value','NaN'],['value','Infinity'],['value','-1'],['value',0],['value',null],['status','missing'],['batchId','missing'],['retrievedAt','2024-02-30T00:00:00Z'],['checkedAt','2023-02-29'],['sourcePublishedAt','2024-13-01'],['providerObservationStatus','unknown']]){
 const x=structuredClone(valid);x.observations[0][field]=value;assert.ok(run(x).length,field);cases++;
}
for(const mutate of [x=>x.observations.push({...o}),x=>x.sources[0].admission='hold',x=>x.sources[0].attribution.en='',x=>x.sources[0].evidenceRefs=['../escape'],x=>x.indicators[0].allowedYears={},x=>x.indicators[0].countryMapping=null,x=>x.published.batches=[null],x=>x.published.batches[0].retrievedAt='2024-02-29T25:00:00Z',x=>x.sources[0].licenseCheckedAt='2023-02-29',x=>x.published.schemaVersion=2]){const x=structuredClone(valid);mutate(x);assert.ok(run(x).length);cases++;}
console.log(`Acquisition contracts: ${cases} positive/negative cases passed; fixtures in memory only.`);
