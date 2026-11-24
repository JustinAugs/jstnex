"""Offline transport substitutes; never make network requests."""
import importlib.util
import json
from pathlib import Path
import ssl
import tempfile
import unittest
import urllib.error

spec = importlib.util.spec_from_file_location('acquire_wdi', Path(__file__).with_name('acquire-wdi.py'))
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)
ROOT = a.ROOT
FIX = ROOT / 'docs/evidence/task09-2026-11-23'
RAW = {k: (FIX / v).read_bytes() for k, v in [('source','wdi-source.json'),('indicator','wdi-indicator.json'),('data','wdi-sample.json')]}

def responder(change=None):
    def transport(url):
        kind = 'source' if '/source/' in url else 'data' if '/country/' in url else 'indicator'
        obj = json.loads(RAW[kind])
        if change:
            change(kind,obj)
        return 200, {'Content-Type':'application/json'}, url, json.dumps(obj).encode()
    return transport

class Tests(unittest.TestCase):
    def test_complete_replay_immutable(self):
        with tempfile.TemporaryDirectory() as d:
            first=a.acquire(d,responder(),sleep=lambda _:None)
            batch=Path(d)/first['batchId'];before={p.name:p.read_bytes()for p in batch.iterdir()}
            again=a.acquire(d,responder(),sleep=lambda _:None)
            self.assertEqual(first['batchId'],again['batchId']);self.assertNotEqual(first['runId'],again['runId'])
            self.assertEqual(before,{p.name:p.read_bytes()for p in batch.iterdir()})
            self.assertEqual(len(list(Path(d).glob('wdi-*'))),1)
    def test_retry_statuses(self):
        for status in [429,500,503]:
            calls=[];waits=[]
            def transport(url):
                calls.append(url);return status,{},url,b''
            with self.assertRaises(a.AcquisitionError):a.fetch(a.url_for('data'),transport,waits.append)
            self.assertEqual(len(calls),3);self.assertEqual(waits,[1,2])
    def test_retry_then_success(self):
        calls=[]
        def transport(url):
            calls.append(url)
            return (429,{'Retry-After':'0'},url,b'') if len(calls)==1 else responder()(url)
        _,receipt=a.fetch(a.url_for('source'),transport,lambda _:None)
        self.assertEqual(receipt['attempts'],2)
    def test_deferred(self):
        with self.assertRaises(a.Deferred):a.fetch(a.url_for('data'),lambda u:(429,{'Retry-After':'61'},u,b''),lambda _:self.fail('must not wait'))
    def test_403_no_retry(self):
        calls=[]
        with self.assertRaises(a.AcquisitionError):a.fetch(a.url_for('data'),lambda u:(calls.append(u) or (403,{},u,b'')))
        self.assertEqual(len(calls),1)
    def test_timeout(self):
        calls=[]
        def transport(url):calls.append(url);raise TimeoutError()
        with self.assertRaises(a.AcquisitionError):a.fetch(a.url_for('data'),transport,lambda _:None)
        self.assertEqual(len(calls),3)
    def test_tls_no_retry(self):
        calls=[]
        def transport(url):calls.append(url);raise urllib.error.URLError(ssl.SSLCertVerificationError('bad certificate'))
        with self.assertRaises(a.AcquisitionError):a.fetch(a.url_for('data'),transport,lambda _:self.fail('TLS retry'))
        self.assertEqual(len(calls),1)
    def test_bad_http_payload(self):
        for content,raw in [('text/html',b'<html>login</html>'),('application/json',b'{"message":"bad"}'),('application/json',b'NaN')]:
            with tempfile.TemporaryDirectory() as d:
                with self.assertRaises(a.AcquisitionError):a.acquire(d,lambda u:(200,{'Content-Type':content},u,raw))
                self.assertEqual(list(Path(d).glob('wdi-*')),[])
                self.assertEqual(list(Path(d).glob('.candidate-*')),[])
    def test_outside_redirect(self):
        with self.assertRaises(a.AcquisitionError):a.fetch(a.url_for('data'),lambda u:(200,{'Content-Type':'application/json'},'https://evil.example/',b'[]'))
        with self.assertRaises(a.AcquisitionError):a.RedirectGuard().redirect_request(None,None,302,'',{},'https://evil.example/')
    def test_bad_pagination_and_definition(self):
        mutations=[lambda k,o:o[0].update(total=6) if k=='source' else None,
                   lambda k,o:o[0].update(page=2) if k=='data' else None,
                   lambda k,o:o[1][0].update(sourceNote='changed') if k=='indicator' else None,
                   lambda k,o:o[1].pop() if k=='data' else None,
                   lambda k,o:o[1].__setitem__(0,o[1][1]) if k=='data' else None,
                   lambda k,o:o[1][0].update(countryiso3code='USA') if k=='data' else None,
                   lambda k,o:o[0].update(pages=7) if k=='data' else None]
        for mutate in mutations:
            with tempfile.TemporaryDirectory() as d:
                with self.assertRaises(a.AcquisitionError):a.acquire(d,responder(mutate))
                self.assertEqual(list(Path(d).glob('wdi-*')),[])
    def test_failure_preserves_old_batch(self):
        with tempfile.TemporaryDirectory() as d:
            first=a.acquire(d,responder());batch=Path(d)/first['batchId'];before=(batch/'manifest.json').read_bytes()
            def broken(path,raw):raise OSError('simulated interrupted write')
            with self.assertRaises(OSError):a.acquire(d,responder(),write_file=broken)
            self.assertEqual(before,(batch/'manifest.json').read_bytes())
            self.assertFalse(list(Path(d).glob('.candidate-*')))
            self.assertIn('failed',[json.loads(p.read_text())['status']for p in Path(d).glob('run-*.json')])
    def test_damaged_existing_batch_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            first=a.acquire(d,responder());(Path(d)/first['batchId']/'data-1.json').write_text('corrupt')
            with self.assertRaises(a.AcquisitionError):a.acquire(d,responder())
    def test_successful_pagination(self):
        def transport(url):
            status,headers,final,raw=responder()(url)
            if '/country/' in url:
                obj=json.loads(raw);page=int(a.urllib.parse.parse_qs(a.urllib.parse.urlsplit(url).query)['page'][0])
                obj[0].update(page=page,pages=2,per_page=3);obj[1]=obj[1][(page-1)*3:page*3];raw=json.dumps(obj).encode()
            return status,headers,final,raw
        with tempfile.TemporaryDirectory() as d:
            result=a.acquire(d,transport)
            manifest=json.loads((Path(d)/result['batchId']/'manifest.json').read_text())
            self.assertEqual(len(manifest['files']),4)
    def test_missing_second_page(self):
        def transport(url):
            if '/country/' in url:
                page=int(a.urllib.parse.parse_qs(a.urllib.parse.urlsplit(url).query)['page'][0])
                if page==2:raise TimeoutError()
                obj=json.loads(RAW['data']);obj[0].update(pages=2,per_page=3);obj[1]=obj[1][:3]
                return 200,{'Content-Type':'application/json'},url,json.dumps(obj).encode()
            return responder()(url)
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(a.AcquisitionError):a.acquire(d,transport,sleep=lambda _:None)
            self.assertEqual(list(Path(d).glob('wdi-*')),[])
    def test_unit_drift(self):
        def mutate(k,o):
            if k=='data':o[1][0]['unit']='LCU'
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(a.AcquisitionError):a.acquire(d,responder(mutate))
    def test_request_boundaries(self):
        for url in ['http://api.worldbank.org/v2/source/2','https://api.worldbank.org/v2/country/all','https://api.worldbank.org.evil/v2/source/2']:
            self.assertFalse(a.safe_url(url))
        for args in [('evil',1),('data',7)]:
            with self.assertRaises(a.AcquisitionError):a.url_for(*args)

if __name__=='__main__':unittest.main()
