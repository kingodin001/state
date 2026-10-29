#!/usr/bin/env python3
"""Regression for Unity's package/type/name lookups against a compiled APK.

0.9.0 must fail for game_view_content_description / unitySurfaceView; the fixed
APK and the refreshed private game-data APK must both pass.
"""
import argparse, json, re, subprocess
from pathlib import Path

def main():
    p = argparse.ArgumentParser(); p.add_argument('--aapt2', required=True)
    p.add_argument('--apk', required=True); p.add_argument('--named-roots', required=True)
    args = p.parse_args()
    text = subprocess.run([args.aapt2, 'dump', 'resources', args.apk], check=True,
                          stdout=subprocess.PIPE, text=True).stdout
    assert 'Package name=pro.vymi.terrastorm.reference id=7f' in text, 'Wrong resource package namespace'
    actual = {(t, n): int(i, 16) for i, t, n in re.findall(r'resource (0x[0-9a-f]+) (\w+)/([\w.]+)', text)}
    expected = json.loads(Path(args.named_roots).read_text())
    missing = [r['type']+'/'+r['name'] for r in expected if actual.get((r['type'], r['name'])) != int(r['sourceId'], 16)]
    if missing: raise SystemExit('Missing/wrong named resources: '+', '.join(missing))
    assert actual[('string', 'game_view_content_description')] == 0x7f13013d
    assert actual[('id', 'unitySurfaceView')] == 0x7f0a0562
    assert actual[('color', 'staticSplashScreenBackgroundColor')] == 0x7f060418
    print('Named resource contract passed:', len(expected), 'roots, correct package and source IDs')

if __name__ == '__main__': main()
