"""Offline raw-to-observation, transaction and recovery tests."""
import importlib.util
import json
import re
from pathlib import Path
import shutil
import tempfile
import unittest
spec=importlib.util.spec_from_file_location('normalize',Path(__file__).with_name('normalize-wdi.py'))
n=importlib.util.module_from_spec(spec);spec.loader.exec_module(n)
BATCH=next((n.ROOT/'data/acquisition/raw/world-bank-wdi').glob('wdi-*')).name
DATE='2026-11-24'

class Tests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
  for name in ['data','scripts','lib','docs']:shutil.copytree(n.ROOT/name,self.root/name,ignore=shutil.ignore_patterns('__pycache__'))
  shutil.rmtree(self.root/'data/acquisition/curated',ignore_errors=True)
  (self.root/'data/observations.json').write_bytes(n.encode([]));(self.root/'data/acquisition/published.json').write_bytes(n.encode({'schemaVersion':1,'batches':[]}))
 def tearDown(self):self.temp.cleanup()
 def test_exact(self):
  rows,b=n.normalize(self.root,BATCH,DATE)
  self.assertEqual(len(rows),6)
  self.assertEqual(next(r['value']for r in rows if r['recordId']=='CN' and r['period']=='2024'),'3828873971971.62')
  self.assertTrue(all(r['sourcePublishedAt']is None and r['sourceRevisedAt']is None for r in rows))
  self.assertEqual(rows,n.normalize(self.root,BATCH,DATE)[0])
 def test_damaged_hash(self):
  (self.root/'data/acquisition/raw/world-bank-wdi'/BATCH/'data-1.json').write_text('bad')
  with self.assertRaises(Exception):n.normalize(self.root,BATCH,DATE)
 def test_candidate_tamper(self):
  d=n.candidate(self.root,BATCH,DATE);rows=json.loads((d/'observations.json').read_text());rows[0]['value']='0'
  with self.assertRaises(Exception):n.verify_pair(self.root,n.encode(rows),(d/'published.json').read_bytes())
 def test_partial_write_rolls_back(self):
  d=n.candidate(self.root,BATCH,DATE);before=(self.root/'data/observations.json').read_bytes()
  for stage in ['observations','manifest']:
   with self.assertRaises(OSError):n.transact(self.root,(d/'observations.json').read_bytes(),(d/'published.json').read_bytes(),stage)
   self.assertEqual(before,(self.root/'data/observations.json').read_bytes());self.assertFalse((self.root/'data/acquisition/transaction.json').exists())
 def test_publish_restore_and_replay(self):
  d=n.candidate(self.root,BATCH,DATE);obs=(d/'observations.json').read_bytes();pub=(d/'published.json').read_bytes()
  n.transact(self.root,obs,pub);n.verify_pair(self.root,obs,pub)
  again=n.candidate(self.root,BATCH,'2026-11-23');self.assertEqual((again/'observations.json').read_bytes(),obs)
  backup=next((self.root/'data/acquisition/curated').glob('backup-*'));n.transact(self.root,(backup/'observations.json').read_bytes(),(backup/'published.json').read_bytes())
  self.assertEqual(json.loads((self.root/'data/observations.json').read_text()),[])
  n.transact(self.root,obs,pub)
 def test_hard_interrupt_recover(self):
  obs=(self.root/'data/observations.json').read_bytes();pub=(self.root/'data/acquisition/published.json').read_bytes()
  j={'oldObservations':obs.decode(),'oldPublished':pub.decode(),'oldObservationsSha256':n.digest(obs),'oldPublishedSha256':n.digest(pub)}
  (self.root/'data/acquisition/transaction.json').write_bytes(n.encode(j));(self.root/'data/observations.json').write_text('[null]')
  n.recover(self.root);self.assertEqual((self.root/'data/observations.json').read_bytes(),obs)
 def test_null_zero_and_precision(self):
  for token,expected in [('null',None),('0','0'),('9007199254740993.123456789','9007199254740993.123456789')]:
   folder=self.root/'data/acquisition/raw/world-bank-wdi'/BATCH
   original=(folder/'data-1.json').read_bytes();manifest=(folder/'manifest.json').read_bytes()
   modified=re.sub(rb'("value":\s*)([0-9.]+|null)',lambda m:m[1]+token.encode(),original,count=1)
   (folder/'data-1.json').write_bytes(modified);m=json.loads(manifest)
   for f in m['files']:
    if f['file']=='data-1.json':f.update(bytes=len(modified),sha256=n.digest(modified))
   identity=[[f['requestUrl'],f['sha256']]for f in m['files']]
   new_id='wdi-'+n.digest(json.dumps(identity,separators=(',',':')).encode());m['batchId']=new_id
   new=folder.with_name(new_id);folder.rename(new);(new/'manifest.json').write_bytes(n.encode(m))
   rows,_=n.normalize(self.root,new_id,DATE)
   # API's first data row is CN 2024; no rounding or missing-to-zero conversion.
   r=next(r for r in rows if r['recordId']=='CN' and r['period']=='2024');self.assertEqual(r['value'],expected)
   if token=='null':
    self.assertEqual(r['status'],'missing');r['value']='0';r['status']='observed'
    _,receipt=n.normalize(self.root,new_id,DATE)
    with self.assertRaises(Exception):n.verify_pair(self.root,n.encode(rows),n.encode({'schemaVersion':1,'batches':[receipt],'observationsSha256':n.digest(n.encode(rows))}))
   new.rename(folder);(folder/'data-1.json').write_bytes(original);(folder/'manifest.json').write_bytes(manifest)
 def test_registry_and_date(self):
  for field,value in [('currency','LCU'),('scale',1000000),('priceBasis','constant')]:
   p=self.root/'data/indicators.json';original=p.read_bytes();i=json.loads(original);i[0][field]=value;p.write_bytes(n.encode(i))
   with self.assertRaises(Exception):n.normalize(self.root,BATCH,DATE)
   p.write_bytes(original)
  with self.assertRaises(Exception):n.normalize(self.root,BATCH,'2024-02-30')
 def test_revision_requires_acceptance(self):
  import subprocess
  d=n.candidate(self.root,BATCH,DATE);n.transact(self.root,(d/'observations.json').read_bytes(),(d/'published.json').read_bytes())
  folder=self.root/'data/acquisition/raw/world-bank-wdi'/BATCH
  raw=(folder/'data-1.json').read_bytes();modified=re.sub(rb'("value":\s*)([0-9.]+|null)',lambda m:m[1]+b'1',raw,count=1)
  m=json.loads((folder/'manifest.json').read_text());newfolder=folder.with_name('candidate-raw');shutil.copytree(folder,newfolder)
  (newfolder/'data-1.json').write_bytes(modified)
  for f in m['files']:
   if f['file']=='data-1.json':f.update(bytes=len(modified),sha256=n.digest(modified))
  new_id='wdi-'+n.digest(json.dumps([[f['requestUrl'],f['sha256']]for f in m['files']],separators=(',',':')).encode())
  m['batchId']=new_id;newfolder.rename(folder.with_name(new_id));(folder.with_name(new_id)/'manifest.json').write_bytes(n.encode(m))
  d=n.candidate(self.root,new_id,DATE)
  cmd=['python3',str(self.root/'scripts/normalize-wdi.py'),'publish','--candidate',str(d)]
  denied=subprocess.run(cmd,capture_output=True,text=True);self.assertNotEqual(denied.returncode,0);self.assertIn('revisions require',denied.stdout)
  accepted=subprocess.run(cmd+['--accept-revisions'],capture_output=True,text=True);self.assertEqual(accepted.returncode,0,accepted.stdout+accepted.stderr)
 def test_lock(self):
  (self.root/'data/acquisition/.publication.lock').touch()
  with self.assertRaises(Exception):n.locked(self.root,lambda:None)

if __name__=='__main__':unittest.main()
