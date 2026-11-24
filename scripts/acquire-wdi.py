#!/usr/bin/env python3
"""Bounded WDI raw acquisition. No observations or published manifests are written."""
import argparse
import datetime as dt
import decimal
import email.utils
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import ssl
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://api.worldbank.org'
LIMIT = 2 * 1024 * 1024

class AcquisitionError(Exception):
    pass

class Deferred(AcquisitionError):
    pass

def now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00', 'Z')

def decode(raw):
    def reject(value):
        raise AcquisitionError('non-finite JSON number: ' + value)
    try:
        return json.loads(raw, parse_float=decimal.Decimal, parse_constant=reject)
    except (ValueError, UnicodeError) as exc:
        raise AcquisitionError('invalid JSON') from exc

def url_for(kind, page=1):
    endpoints = {'source': '/v2/source/2', 'indicator': '/v2/indicator/NE.EXP.GNFS.CD',
                 'data': '/v2/country/CHN;USA/indicator/NE.EXP.GNFS.CD'}
    if kind not in endpoints or type(page) is not int or not 1 <= page <= 6:
        raise AcquisitionError('request outside pilot')
    query = {'format': 'json', 'per_page': '100', 'page': str(page)}
    if kind != 'source':
        query['source'] = '2'
    if kind == 'data':
        query['date'] = '2022:2024'
    return ORIGIN + endpoints[kind] + '?' + urllib.parse.urlencode(query)

def safe_url(url):
    u = urllib.parse.urlsplit(url)
    # Same bounded endpoint/query set, including on redirects. No arbitrary host or expansion.
    return url in {url_for(kind, page) for kind in ('source', 'indicator', 'data') for page in range(1, 7)} and u.hostname == 'api.worldbank.org'

class RedirectGuard(urllib.request.HTTPRedirectHandler):
    max_redirections = 3
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not safe_url(newurl):
            raise AcquisitionError('redirect outside request allowlist')
        return super().redirect_request(req, fp, code, msg, headers, newurl)

class Transport:
    def __init__(self, ca_file=None):
        context = ssl.create_default_context(cafile=ca_file)
        self.opener = urllib.request.build_opener(RedirectGuard(), urllib.request.HTTPSHandler(context=context))
    def __call__(self, url):
        if not safe_url(url):
            raise AcquisitionError('URL outside pilot')
        req = urllib.request.Request(url, headers={'User-Agent': 'JSTNEX-WDI-acquisition/1.0', 'Accept': 'application/json'})
        with self.opener.open(req, timeout=20) as response:
            raw = response.read(LIMIT + 1)
            if len(raw) > LIMIT:
                raise AcquisitionError('response too large')
            return response.status, dict(response.headers.items()), response.geturl(), raw

def retry_delay(value, attempt):
    if value is None:
        return 1 + attempt
    try:
        delay = int(value)
    except ValueError:
        try:
            delay = (email.utils.parsedate_to_datetime(value) - dt.datetime.now(dt.timezone.utc)).total_seconds()
        except (ValueError, TypeError, OverflowError) as exc:
            raise AcquisitionError('invalid Retry-After') from exc
    if delay > 60:
        raise Deferred('Retry-After exceeds 60 seconds')
    return max(0, delay)

def fetch(url, transport, sleep=time.sleep, events=None):
    events = events if events is not None else []
    for attempt in range(3):
        try:
            status, headers, final, raw = transport(url)
        except urllib.error.HTTPError as exc:
            status, headers, final, raw = exc.code, dict(exc.headers.items()), url, b''
            exc.close()
        except (TimeoutError, urllib.error.URLError) as exc:
            reason = getattr(exc, 'reason', exc)
            events.append({'url': url, 'attempt': attempt + 1, 'error': type(reason).__name__})
            if isinstance(reason, ssl.SSLError) or not isinstance(reason, (TimeoutError, OSError)) or attempt == 2:
                raise AcquisitionError('TLS/network failure') from exc
            sleep(1 + attempt)
            continue
        headers = {k.lower(): v for k, v in headers.items()}
        events.append({'url': url, 'attempt': attempt + 1, 'status': status})
        if status == 429 or 500 <= status <= 599:
            if attempt == 2:
                raise AcquisitionError('retry budget exhausted')
            sleep(retry_delay(headers.get('retry-after'), attempt))
            continue
        if status != 200 or not safe_url(final):
            raise AcquisitionError('HTTP/redirect rejected')
        if 'application/json' not in headers.get('content-type', '').lower() or len(raw) > LIMIT:
            raise AcquisitionError('content type/size rejected')
        decode(raw)
        return raw, {'requestUrl': url, 'finalUrl': final, 'httpStatus': status,
                     'contentType': headers['content-type'], 'retrievedAt': now(), 'attempts': attempt + 1}
    raise AcquisitionError('unreachable')

def positive_int(value):
    if isinstance(value, bool) or not str(value).isdigit() or int(value) < 1:
        raise AcquisitionError('invalid pagination integer')
    return int(value)

def envelope(raw, expected_page):
    value = decode(raw)
    if not isinstance(value, list) or len(value) != 2 or not isinstance(value[0], dict) or not isinstance(value[1], list):
        raise AcquisitionError('invalid API envelope')
    meta, rows = value
    page, pages, total = [positive_int(meta.get(k)) for k in ('page', 'pages', 'total')]
    if page != expected_page or pages > 6 or page > pages or total > 6 or not rows or any(not isinstance(r, dict) for r in rows):
        raise AcquisitionError('pagination/rows outside pilot')
    return meta, rows, pages, total

def acquire(output, transport, root=ROOT, sleep=time.sleep, write_file=None):
    output = Path(output)
    def write(path, raw):
        path.write_bytes(raw)
    write_file = write_file or write
    source = json.loads((root / 'data/sources.json').read_text())
    indicator = json.loads((root / 'data/indicators.json').read_text())
    if len(source) != 1 or len(indicator) != 1:
        raise AcquisitionError('pilot registry changed')
    s, i = source[0], indicator[0]
    if (s['id'], s['admission'], s['datasetCode'], s['apiBase']) != ('world-bank-wdi', 'approved', '2', ORIGIN + '/v2/') or (i['sourceId'], i['providerIndicatorId'], i['countryMapping'], i['allowedYears'], i['unit'], i['currency'], i['scale'], i['priceBasis'], i['frequency']) != ('world-bank-wdi', 'NE.EXP.GNFS.CD', {'CN': 'CHN', 'US': 'USA'}, ['2022', '2023', '2024'], 'USD', 'USD', 1, 'current', 'annual'):
        raise AcquisitionError('pilot registry not approved')
    reviewed = json.loads((root / 'docs/evidence/task09-2026-11-23/wdi-indicator.json').read_text())[1][0]
    output.mkdir(parents=True, exist_ok=True)
    run_id = 'run-' + uuid.uuid4().hex
    run = {'runId': run_id, 'startedAt': now(), 'status': 'running', 'events': []}
    stage = Path(tempfile.mkdtemp(prefix='.candidate-', dir=output))
    files, identity = [], []
    try:
        data_rows = []
        source_updated = None
        for kind in ('source', 'indicator', 'data'):
            page, target_pages, target_total, gathered = 1, 1, None, []
            baseline_meta = None
            while page <= target_pages:
                url = url_for(kind, page)
                raw, receipt = fetch(url, transport, sleep, run['events'])
                meta, rows, pages, total = envelope(raw, page)
                comparable = {k: v for k, v in meta.items() if k != 'page'}
                if baseline_meta is not None and comparable != baseline_meta:
                    raise AcquisitionError('page metadata changed')
                baseline_meta = comparable
                if target_total is not None and (pages != target_pages or total != target_total):
                    raise AcquisitionError('inconsistent pagination')
                target_pages, target_total = pages, total
                name = f'{kind}-{page}.json'
                write_file(stage / name, raw)
                digest = hashlib.sha256(raw).hexdigest()
                files.append({**receipt, 'file': name, 'sha256': digest, 'bytes': len(raw), 'page': page, 'pages': pages, 'total': total})
                identity.append([url, digest])
                gathered.extend(rows)
                page += 1
            if len(gathered) != target_total:
                raise AcquisitionError('missing rows/pages')
            if kind == 'source':
                if len(gathered) != 1 or gathered[0].get('id') != '2':
                    raise AcquisitionError('source metadata mismatch')
                source_updated = gathered[0].get('lastupdated')
                try:
                    dt.date.fromisoformat(source_updated)
                except (TypeError, ValueError) as exc:
                    raise AcquisitionError('invalid source update date') from exc
            elif kind == 'indicator':
                if len(gathered) != 1 or any(gathered[0].get(k) != reviewed.get(k) for k in ('id', 'name', 'unit', 'source', 'sourceNote', 'sourceOrganization')):
                    raise AcquisitionError('indicator definition changed; review required')
            else:
                if meta.get('lastupdated') != source_updated:
                    raise AcquisitionError('dataset revision changed between requests')
                if str(meta.get('sourceid')) != '2':
                    raise AcquisitionError('data source mismatch')
                data_rows = gathered
                run['upstreamDatasetUpdatedAt'] = meta.get('lastupdated')
        seen = set()
        for row in data_rows:
            country = row.get('country', {}).get('id')
            key = (country, row.get('date'))
            value = row.get('value')
            if country not in i['countryMapping'] or row.get('countryiso3code') != i['countryMapping'][country] or row.get('indicator', {}).get('id') != i['providerIndicatorId'] or row.get('date') not in i['allowedYears'] or key in seen:
                raise AcquisitionError('unknown/duplicate observation')
            if value is not None and (isinstance(value, bool) or not isinstance(value, (int, decimal.Decimal)) or value < 0):
                raise AcquisitionError('invalid observation value')
            if row.get('unit') != reviewed['unit']:
                raise AcquisitionError('observation unit changed')
            if row.get('obs_status') != '':
                raise AcquisitionError('provider status requires review')
            seen.add(key)
        if seen != {(c, y) for c in i['countryMapping'] for y in i['allowedYears']}:
            raise AcquisitionError('incomplete country/year coverage')
        batch_id = 'wdi-' + hashlib.sha256(json.dumps(identity, separators=(',', ':')).encode()).hexdigest()
        manifest = {'schemaVersion': 1, 'batchId': batch_id, 'sourceId': s['id'], 'status': 'complete',
                    'retrievedAt': files[0]['retrievedAt'], 'completedAt': now(), 'pythonVersion': platform.python_version(),
                    'collectorVersion': '1', 'upstreamDatasetUpdatedAt': run['upstreamDatasetUpdatedAt'],
                    'attribution': s['attribution'], 'licenseUrl': s['licenseUrl'], 'termsUrl': s['termsUrl'], 'files': files}
        write_file(stage / 'manifest.json', (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode())
        target = output / batch_id
        if target.exists():
            old = json.loads((target / 'manifest.json').read_text())
            if old.get('status') != 'complete' or [(f['requestUrl'], f['sha256']) for f in old['files']] != [tuple(x) for x in identity]:
                raise AcquisitionError('existing batch conflict')
            for f in old['files']:
                if hashlib.sha256((target / f['file']).read_bytes()).hexdigest() != f['sha256']:
                    raise AcquisitionError('existing batch damaged')
        else:
            os.rename(stage, target)
        run.update(status='complete', batchId=batch_id, requests=files)
        return run
    except Exception as exc:
        run.update(status='deferred' if isinstance(exc, Deferred) else 'failed', error=str(exc))
        raise
    finally:
        if stage.exists():
            shutil.rmtree(stage)
        run['finishedAt'] = now()
        (output / (run_id + '.json')).write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'data/acquisition/raw/world-bank-wdi')
    parser.add_argument('--ca-file', type=Path, help='Trusted CA bundle; certificate/hostname verification stays enabled')
    args = parser.parse_args()
    try:
        result = acquire(args.output, Transport(args.ca_file))
        print(json.dumps({'status': result['status'], 'batchId': result['batchId'], 'runId': result['runId']}))
    except Exception as exc:
        print(json.dumps({'status': 'deferred' if isinstance(exc, Deferred) else 'failed', 'error': str(exc)}))
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
