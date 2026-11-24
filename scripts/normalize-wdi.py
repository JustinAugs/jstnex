#!/usr/bin/env python3
"""Offline normalization and journaled publication. No network access."""
import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

spec=importlib.util.spec_from_file_location('wdi',Path(__file__).with_name('acquire-wdi.py'))
a=importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)
ROOT=a.ROOT
VERSION='1'

def encode(value):
    return (json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode()

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def require(ok,message):
    if not ok:raise a.AcquisitionError(message)

def atomic(path,raw):
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,name=tempfile.mkstemp(prefix='.write-',dir=path.parent)
    try:
        with os.fdopen(fd,'wb')as f:f.write(raw);f.flush();os.fsync(f.fileno())
        os.replace(name,path)
    finally:
        if Path(name).exists():Path(name).unlink()

def normalize(root,batch_id,checked_at):
    require(bool(re.fullmatch(r'wdi-[a-f0-9]{64}',batch_id)),'invalid batch ID')
    require(dt.date.fromisoformat(checked_at)<=dt.datetime.now(dt.timezone.utc).date(),'future review date')
    folder=root/'data/acquisition/raw/world-bank-wdi'/batch_id
    manifest_raw=(folder/'manifest.json').read_bytes();m=json.loads(manifest_raw)
    require(m.get('schemaVersion')==1 and m.get('collectorVersion')=='1' and m.get('batchId')==batch_id and m.get('status')=='complete','raw version/identity/status')
    sources=json.loads((root/'data/sources.json').read_text());indicators=json.loads((root/'data/indicators.json').read_text())
    s=next(x for x in sources if x['id']==m['sourceId']);i=next(x for x in indicators if x['sourceId']==s['id'])
    require(s['admission']=='approved' and s['datasetCode']=='2' and s['licenseId']=='CC-BY-4.0','source not admitted')
    require(m['licenseUrl']==s['licenseUrl'] and m['termsUrl']==s['termsUrl'] and m['attribution']==s['attribution'],'source attribution/license changed')
    reviewed=json.loads((root/'docs/evidence/task09-2026-11-23/wdi-indicator.json').read_text())[1][0]
    pages={};identity=[]
    for receipt in m['files']:
        name=receipt['file'];require(bool(re.fullmatch(r'(source|indicator|data)-[1-6]\.json',name)),'unsafe raw path')
        kind=name.split('-')[0];page=receipt['page']
        require(receipt['requestUrl']==a.url_for(kind,page) and receipt['finalUrl']==receipt['requestUrl'] and receipt['httpStatus']==200,'raw request mismatch')
        raw=(folder/name).read_bytes();require(len(raw)==receipt['bytes'] and digest(raw)==receipt['sha256'],'raw hash mismatch')
        meta,rows,n,total=a.envelope(raw,page)
        require(n==receipt['pages'] and total==receipt['total'],'raw pagination mismatch')
        require(page not in pages.setdefault(kind,{}),'duplicate page');pages[kind][page]=(meta,rows)
        identity.append([receipt['requestUrl'],receipt['sha256']])
    require('wdi-'+digest(json.dumps(identity,separators=(',',':')).encode())==batch_id,'batch content identity mismatch')
    require(set(pages)=={'source','indicator','data'},'missing raw group')
    groups={}
    for kind,group in pages.items():
        first=group[1][0];require(set(group)==set(range(1,int(first['pages'])+1)),'missing page')
        rows=[]
        for meta,values in group.values():
            require({k:v for k,v in meta.items()if k!='page'}=={k:v for k,v in first.items()if k!='page'},'mixed page metadata')
            rows.extend(values)
        require(len(rows)==int(first['total']),'wrong total');groups[kind]=rows
    require(len(groups['source'])==1 and groups['source'][0]['id']=='2','source metadata mismatch')
    require(len(groups['indicator'])==1 and all(groups['indicator'][0].get(k)==reviewed.get(k)for k in ('id','source','name','unit','sourceNote','sourceOrganization')),'unreviewed definition')
    require(i['providerIndicatorId']==reviewed['id'] and i['unit']=='USD' and i['currency']=='USD' and i['scale']==1 and i['priceBasis']=='current' and i['frequency']=='annual' and i['countryMapping']=={'CN':'CHN','US':'USA'} and i['allowedYears']==['2022','2023','2024'],'registry scope mismatch')
    update=groups['source'][0]['lastupdated'];dt.date.fromisoformat(update)
    require(m['upstreamDatasetUpdatedAt']==update and pages['data'][1][0].get('lastupdated')==update and str(pages['data'][1][0].get('sourceid'))=='2','mixed data revision')
    rows=[];seen=set()
    for r in groups['data']:
        country=r['country']['id'];period=r['date'];key=(country,period);value=r['value']
        require(country in i['countryMapping'] and r['countryiso3code']==i['countryMapping'][country] and period in i['allowedYears'] and r['indicator']['id']==i['providerIndicatorId'] and key not in seen,'row identity/duplicate')
        require(r['unit']==reviewed['unit'] and r['obs_status']=='','row unit/status changed')
        require(value is None or (not isinstance(value,bool) and isinstance(value,(int,a.decimal.Decimal)) and value>=0),'bad raw value')
        seen.add(key)
        rows.append({'recordId':country,'countryIso3':r['countryiso3code'],'sourceId':s['id'],'indicatorId':i['id'],'period':period,'value':None if value is None else format(value,'f') if isinstance(value,a.decimal.Decimal) else str(value),'status':'missing' if value is None else 'observed','unit':i['unit'],'currency':i['currency'],'priceBasis':i['priceBasis'],'scale':i['scale'],'batchId':batch_id,'retrievedAt':m['retrievedAt'],'checkedAt':checked_at,'upstreamDatasetUpdatedAt':update,'sourcePublishedAt':None,'sourceRevisedAt':None,'providerObservationStatus':r['obs_status']})
    require(seen=={(c,y)for c in i['countryMapping']for y in i['allowedYears']},'incomplete rows')
    rows.sort(key=lambda r:(r['recordId'],r['period']))
    receipt={'id':batch_id,'sourceId':s['id'],'retrievedAt':m['retrievedAt'],'checkedAt':checked_at,'upstreamDatasetUpdatedAt':update,'rawManifestPath':str((folder/'manifest.json').relative_to(root)),'rawManifestSha256':digest(manifest_raw),'normalizerVersion':VERSION,'observationsSha256':digest(encode(rows))}
    return rows,receipt

def node_validate(root,rows,published):
    payload={'sources':json.loads((root/'data/sources.json').read_text()),'indicators':json.loads((root/'data/indicators.json').read_text()),'observations':rows,'published':published}
    result=subprocess.run(['node',str(root/'scripts/check-acquisition-input.mjs')],input=encode(payload),capture_output=True)
    require(result.returncode==0,'local contracts: '+result.stdout.decode()+result.stderr.decode())

def verify_pair(root,observation_raw,published_raw):
    rows=json.loads(observation_raw);p=json.loads(published_raw)
    require(p.get('schemaVersion')==1,'publication version')
    if not rows and not p['batches']:
        node_validate(root,rows,p);return
    require(len(p['batches'])==1,'one pilot batch required')
    b=p['batches'][0];expected,receipt=normalize(root,b['id'],b['checkedAt'])
    require(rows==expected and b==receipt,'observations/receipt differ from raw normalization')
    require(p.get('observationsSha256')==digest(observation_raw),'published output hash mismatch')
    require(p.get('snapshotPath')=='data/acquisition/curated/snapshot-'+digest(observation_raw),'snapshot pointer mismatch')
    node_validate(root,rows,p)

def recover(root):
    journal=root/'data/acquisition/transaction.json'
    if journal.exists():
        j=json.loads(journal.read_text())
        # Always roll back an interrupted transaction; never guess completion.
        old_obs=j['oldObservations'].encode();old_pub=j['oldPublished'].encode()
        require(digest(old_obs)==j['oldObservationsSha256'] and digest(old_pub)==j['oldPublishedSha256'],'journal corrupted')
        verify_pair(root,old_obs,old_pub)
        atomic(root/'data/observations.json',old_obs);atomic(root/'data/acquisition/published.json',old_pub)
        journal.unlink()

def locked(root,action):
    lock=root/'data/acquisition/.publication.lock'
    try:fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
    except FileExistsError as exc:raise a.AcquisitionError('publication lock exists; inspect stopped process before removing lock')from exc
    try:
        os.write(fd,encode({'pid':os.getpid(),'startedAt':a.now()}));os.close(fd);return action()
    finally:lock.unlink()

def transact(root,rows_raw,pub_raw,fail_after=None):
    recover(root);verify_pair(root,rows_raw,pub_raw)
    obs=root/'data/observations.json';pub=root/'data/acquisition/published.json'
    old_obs,old_pub=obs.read_bytes(),pub.read_bytes();verify_pair(root,old_obs,old_pub)
    if old_obs==rows_raw and old_pub==pub_raw:return
    backup=root/'data/acquisition/curated'/('backup-'+digest(old_obs+old_pub))
    backup.mkdir(parents=True,exist_ok=True)
    for name,content in [('observations.json',old_obs),('published.json',old_pub)]:
        path=backup/name
        if path.exists():require(path.read_bytes()==content,'backup conflict')
        else:atomic(path,content)
    journal=root/'data/acquisition/transaction.json'
    j={'oldObservations':old_obs.decode(),'oldPublished':old_pub.decode(),'oldObservationsSha256':digest(old_obs),'oldPublishedSha256':digest(old_pub)}
    atomic(journal,encode(j))
    try:
        atomic(obs,rows_raw)
        if fail_after=='observations':raise OSError('simulated interrupted publication')
        atomic(pub,pub_raw)
        if fail_after=='manifest':raise OSError('simulated interrupted publication')
        verify_pair(root,obs.read_bytes(),pub.read_bytes());journal.unlink()
    except Exception:
        recover(root);raise

def candidate(root,batch_id,checked_at):
    require(not (root/'data/acquisition/transaction.json').exists(),'pending transaction; recover first')
    old=json.loads((root/'data/observations.json').read_text());rows,receipt=normalize(root,batch_id,checked_at)
    # Replaying an identical batch reuses its original review label.
    old_p=json.loads((root/'data/acquisition/published.json').read_text())
    if old_p.get('batches') and old_p['batches'][0]['id']==batch_id:
        verify_pair(root,encode(old),encode(old_p))
        rows,receipt=normalize(root,batch_id,old_p['batches'][0]['checkedAt'])
    raw=encode(rows);p={'schemaVersion':1,'batches':[receipt],'observationsSha256':digest(raw),'snapshotPath':'data/acquisition/curated/snapshot-'+digest(raw)}
    verify_pair(root,raw,encode(p))
    key=lambda r:(r['sourceId'],r['indicatorId'],r['recordId'],r['period'])
    before={key(r):r for r in old};after={key(r):r for r in rows}
    changes=[{'key':list(k),'before':before.get(k),'after':after.get(k)}for k in sorted(before.keys()|after.keys())if before.get(k)!=after.get(k)]
    revisions=[x for x in changes if x['before'] is not None and x['after'] is not None and any(x['before'].get(f)!=x['after'].get(f)for f in ('value','status','unit','currency','scale','priceBasis'))]
    directory=root/'data/acquisition/curated'/('snapshot-'+digest(raw))
    directory.mkdir(parents=True,exist_ok=True)
    for name,content in [('observations.json',raw),('published.json',encode(p))]:
        path=directory/name
        if path.exists():require(path.read_bytes()==content,'immutable candidate conflict')
        else:atomic(path,content)
    atomic(directory/'diff.json',encode({'changes':changes,'revisions':revisions,'baseObservationsSha256':digest(encode(old))}))
    return directory

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('action',choices=['prepare','publish','verify','recover','restore'])
    parser.add_argument('--batch');parser.add_argument('--checked-at');parser.add_argument('--candidate',type=Path);parser.add_argument('--accept-revisions',action='store_true')
    args=parser.parse_args();root=ROOT
    def action():
        if args.action=='recover':recover(root)
        elif args.action=='verify':
            require(not (root/'data/acquisition/transaction.json').exists(),'pending publication journal')
            obs=(root/'data/observations.json').read_bytes();pub=(root/'data/acquisition/published.json').read_bytes()
            verify_pair(root,obs,pub)
            p=json.loads(pub)
            if p.get('snapshotPath'):
                snapshot=root/p['snapshotPath']
                require((snapshot/'observations.json').read_bytes()==obs and (snapshot/'published.json').read_bytes()==pub,'canonical snapshot differs from mirror')
        elif args.action=='prepare':print(candidate(root,args.batch,args.checked_at))
        else:
            require(args.candidate is not None,'candidate directory required')
            directory=args.candidate.resolve();require(directory.is_relative_to((root/'data/acquisition/curated').resolve()),'candidate outside curated directory')
            if args.action=='publish':
                diff=json.loads((directory/'diff.json').read_text());require(digest(encode(json.loads((root/'data/observations.json').read_text())))==diff['baseObservationsSha256'],'stale candidate; prepare again')
                before=json.loads((root/'data/observations.json').read_text());after=json.loads((directory/'observations.json').read_text())
                key=lambda r:(r['sourceId'],r['indicatorId'],r['recordId'],r['period'])
                old={key(r):r for r in before}
                revised=any(key(r) in old and any(old[key(r)].get(f)!=r.get(f)for f in ('value','status','unit','currency','scale','priceBasis'))for r in after)
                require(not revised or args.accept_revisions,'revisions require explicit acceptance')
            transact(root,(directory/'observations.json').read_bytes(),(directory/'published.json').read_bytes())
        return 0
    try:return locked(root,action)
    except Exception as exc:print(str(exc));return 1

if __name__=='__main__':raise SystemExit(main())
