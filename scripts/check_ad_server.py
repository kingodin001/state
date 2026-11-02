"""Read-only validation of the exact public document accepted by Android."""
import json
import re
import urllib.request

URL = 'https://games-api.vymi.pro/state/ads.json'
KEYS = ['banner', 'interstitial', 'rewarded_result', 'rewarded_upgrade', 'rewarded_color', 'rewarded_bonus']

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def main():
    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(URL, headers={'Accept': 'application/json', 'Cache-Control': 'no-cache'})
    with opener.open(req, timeout=5) as response:
        if response.status != 200 or 'application/json' not in response.headers.get('Content-Type', '').lower():
            raise ValueError('Expected direct HTTP 200 with application/json')
        raw = response.read(32769)
    if len(raw) > 32768:
        raise ValueError('Document exceeds Android size limit')
    data = json.loads(raw)
    if data.get('schemaVersion') != 1 or data.get('packageName') != 'pro.vymi.terrastorm':
        raise ValueError('Wrong schema or package')
    for key in KEYS:
        value = data.get('adUnits', {}).get(key)
        if not isinstance(value, str) or not re.fullmatch(r'R-M-\d{1,20}-\d{1,10}', value.strip()):
            raise ValueError('Missing/invalid production ID: ' + key)
    print('PASS: server document, schema, package and six ad unit fields')
    print('Advertising enabled:', data.get('enabled', True))
    print('Live SDK loading and rewards still need a device check.')

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        raise SystemExit('FAIL: ' + str(error))
