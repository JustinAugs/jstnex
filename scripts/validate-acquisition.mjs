import { SOURCE_ADMISSIONS, OBSERVATION_STATUSES, DATA_FREQUENCIES, PRICE_BASES } from '../lib/data/enums.ts';
import { isCalendarDate, isSourceUrl } from '../lib/data/provenance.ts';

/** Pure structural admission checks. Evidence authenticity and semantic correctness need review. */
export function acquisitionErrors(input, countryCodes, evidenceExists) {
  const errors = [];
  const fail = (where, message) => errors.push(`${where}: ${message}`);
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const text = v => typeof v === 'string' && v.trim().length > 0;
  const date = v => typeof v === 'string' && isCalendarDate(v);
  const timestamp = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(v) && date(v.slice(0,10)) && Number.isFinite(Date.parse(v)) && Number(v.slice(11,13))<24 && Number(v.slice(14,16))<60 && Number(v.slice(17,19))<60;
  const bilingual = v => object(v) && text(v.en) && text(v.zh);
  const arrays = {};
  for (const name of ['sources','indicators','observations']) {
    if (!Array.isArray(input[name])) {fail(name,'must be an array');arrays[name]=[];}
    else arrays[name]=input[name].filter((v,i)=>{if(!object(v)){fail(`${name}[${i}]`,'must be an object');return false;}return true;});
  }
  const unique = (rows, name) => {
    const map = new Map();
    for(const r of rows){if(!text(r.id)|| !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.id)||map.has(r.id))fail(name,'invalid/duplicate id');map.set(r.id,r);}
    return map;
  };
  const sources=unique(arrays.sources,'sources'), indicators=unique(arrays.indicators,'indicators');
  for(const s of arrays.sources){
    for(const f of ['publisher','name','attribution'])if(!bilingual(s[f]))fail(s.id,`${f} requires en/zh`);
    for(const f of ['datasetCode','licenseId'])if(!text(s[f]))fail(s.id,`${f} required`);
    for(const f of ['datasetUrl','apiBase','licenseUrl','termsUrl'])if(!text(s[f])||!isSourceUrl(s[f]))fail(s.id,`${f} invalid URL`);
    if(!date(s.licenseCheckedAt)||!SOURCE_ADMISSIONS.includes(s.admission))fail(s.id,'invalid license date/admission');
    if(!Array.isArray(s.evidenceRefs)||!s.evidenceRefs.length)fail(s.id,'evidence required');
    else for(const ref of s.evidenceRefs)if(!text(ref)||!/^docs\//.test(ref)||ref.split('/').includes('..')||ref.includes('\\')||!evidenceExists(ref))fail(s.id,'invalid/missing evidence');
  }
  for(const i of arrays.indicators){
    if(!sources.has(i.sourceId))fail(i.id,'unknown source');
    for(const f of ['name','definition','coverage'])if(!bilingual(i[f]))fail(i.id,`${f} requires en/zh`);
    for(const f of ['providerIndicatorId','unit','currency'])if(!text(i[f]))fail(i.id,`${f} required`);
    if(!DATA_FREQUENCIES.includes(i.frequency)||!PRICE_BASES.includes(i.priceBasis)||i.scale!==1)fail(i.id,'invalid frequency/priceBasis/scale');
    if(!object(i.countryMapping)||!Object.keys(i.countryMapping).length)fail(i.id,'countryMapping required');
    else {const codes=Object.values(i.countryMapping);if(new Set(codes).size!==codes.length)fail(i.id,'duplicate ISO3');for(const [code,iso]of Object.entries(i.countryMapping))if(!countryCodes.has(code)||typeof iso!=='string'||! /^[A-Z]{3}$/.test(iso))fail(i.id,'invalid country mapping');}
    if(!Array.isArray(i.allowedYears)||!i.allowedYears.length||new Set(i.allowedYears).size!==i.allowedYears.length||i.allowedYears.some(y=>typeof y!=='string'||!/^\d{4}$/.test(y)||!date(y+'-01-01')||Number(y)>new Date().getUTCFullYear()))fail(i.id,'invalid years');
    if(!Array.isArray(i.allowedStatuses)||!i.allowedStatuses.length||new Set(i.allowedStatuses).size!==i.allowedStatuses.length||i.allowedStatuses.some(s=>!OBSERVATION_STATUSES.includes(s)))fail(i.id,'invalid statuses');
  }
  const p=input.published;
  if(!object(p)||p.schemaVersion!==1||!Array.isArray(p.batches))fail('published','schemaVersion 1 and batches array required');
  const batches=unique((Array.isArray(p?.batches)?p.batches:[]).filter((b,i)=>{if(!object(b)){fail(`batch[${i}]`,'object required');return false;}return true;}),'batches');
  for(const b of batches.values()){
    if(typeof b.rawManifestPath!=='string'||!/^data\/acquisition\/raw\/world-bank-wdi\/wdi-[a-f0-9]{64}\/manifest\.json$/.test(b.rawManifestPath)||! /^[a-f0-9]{64}$/.test(b.rawManifestSha256??'')||b.normalizerVersion!=='1'||! /^[a-f0-9]{64}$/.test(b.observationsSha256??''))fail(b.id,'raw/output receipt required');
    if(!sources.has(b.sourceId)||sources.get(b.sourceId)?.admission!=='approved')fail(b.id,'batch source not approved');
    if(!timestamp(b.retrievedAt)||!date(b.checkedAt)||!(b.upstreamDatasetUpdatedAt===null||date(b.upstreamDatasetUpdatedAt)))fail(b.id,'invalid batch dates');
  }
  const seen=new Set();
  for(const o of arrays.observations){
    const at=`observation ${o.recordId}/${o.period}`, i=indicators.get(o.indicatorId), b=batches.get(o.batchId);
    if(!i||!sources.has(o.sourceId)||i.sourceId!==o.sourceId||sources.get(o.sourceId)?.admission!=='approved')fail(at,'source/indicator not approved or mismatched');
    if(!countryCodes.has(o.recordId)||!i?.countryMapping||i.countryMapping[o.recordId]!==o.countryIso3||!Object.hasOwn(i.countryMapping,o.recordId))fail(at,'country/ISO3 mismatch');
    if(!Array.isArray(i?.allowedYears)||!i.allowedYears.includes(o.period))fail(at,'period not allowed');
    for(const f of ['unit','currency','priceBasis','scale'])if(o[f]!==i?.[f])fail(at,`${f} mismatch`);
    if(!OBSERVATION_STATUSES.includes(o.status)||!Array.isArray(i?.allowedStatuses)||!i.allowedStatuses.includes(o.status))fail(at,'status invalid');
    if(o.status==='missing'?o.value!==null:typeof o.value!=='string'||! /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(o.value))fail(at,'value/status mismatch');
    if(!b||b.sourceId!==o.sourceId)fail(at,'unknown/mismatched batch');
    for(const f of ['retrievedAt','checkedAt','upstreamDatasetUpdatedAt'])if(o[f]!==b?.[f])fail(at,`${f} differs from batch`);
    if(!timestamp(o.retrievedAt)||!date(o.checkedAt))fail(at,'invalid observation dates');
    for(const f of ['upstreamDatasetUpdatedAt','sourcePublishedAt','sourceRevisedAt'])if(!(o[f]===null||date(o[f])))fail(at,`${f} must be null or date`);
    if(o.providerObservationStatus!=='')fail(at,'unreviewed provider status');
    const key=JSON.stringify([o.sourceId,o.indicatorId,o.recordId,o.period]);if(seen.has(key))fail(at,'duplicate key');seen.add(key);
  }
  return errors;
}
