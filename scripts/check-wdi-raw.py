"""Verify bounded raw receipts and byte hashes offline; does not approve publication."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re

spec=importlib.util.spec_from_file_location('wdi',Path(__file__).with_name('acquire-wdi.py'))
a=importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)
root=a.ROOT/'data/acquisition/raw/world-bank-wdi'
count=0
for folder in sorted(root.glob('wdi-*')):
    manifest=json.loads((folder/'manifest.json').read_text())
    assert manifest['status']=='complete' and manifest['batchId']==folder.name
    groups={}; identity=[]
    for receipt in manifest['files']:
        name=receipt['file']
        assert re.fullmatch(r'(source|indicator|data)-[1-6]\.json',name)
        assert a.safe_url(receipt['requestUrl']) and a.safe_url(receipt['finalUrl'])
        assert receipt['httpStatus']==200 and 1<=receipt['attempts']<=3
        raw=(folder/name).read_bytes()
        assert len(raw)==receipt['bytes'] and hashlib.sha256(raw).hexdigest()==receipt['sha256']
        meta,rows,pages,total=a.envelope(raw,receipt['page'])
        assert pages==receipt['pages'] and total==receipt['total']
        kind=name.split('-')[0];groups.setdefault(kind,[]).append((receipt['page'],pages,total,len(rows)))
        identity.append([receipt['requestUrl'],receipt['sha256']]);count+=1
    assert set(groups)=={'source','indicator','data'}
    for group in groups.values():
        assert len(group)==group[0][1] and sorted(x[0]for x in group)==list(range(1,len(group)+1))
        assert sum(x[3]for x in group)==group[0][2]
    assert folder.name=='wdi-'+hashlib.sha256(json.dumps(identity,separators=(',',':')).encode()).hexdigest()
print(f'Raw acquisition receipts: {count} pages verified; no publication approval implied.')
