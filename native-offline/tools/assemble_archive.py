#!/usr/bin/env python3
"""Assemble an unsigned offline experiment; signing is a separate guarded step."""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZIP_STORED

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--work', required=True); p.add_argument('--base', required=True)
    p.add_argument('--arm64', required=True); p.add_argument('--out', required=True)
    a = p.parse_args(); work = Path(a.work)
    source_assets = ('assets/UnityServicesProjectConfiguration.json', 'assets/google-services.json',
                     'assets/google-services-desktop.json', 'assets/GoogleService-Info.plist',
                     'assets/NatoSans/NotoSans_OFL.txt', 'assets/Righteous/OFL.txt',
                     'assets/MuseoSansCyrl/MuseoSansCyrl - FONT SOFTWARE FOR MOBILE APPLICATIONS END USER LICENSE AGREEMENT.html')
    with ZipFile(work/'resource-shell-opt2.apk') as resources, ZipFile(a.base) as base, \
         ZipFile(a.arm64) as arm, ZipFile(a.out, 'w') as apk:
        for e in resources.infolist(): apk.writestr(e, resources.read(e))
        apk.write(work/'host-dex/classes.dex', 'classes.dex', compress_type=ZIP_DEFLATED, compresslevel=9)
        for f in sorted((work/'offline').iterdir()):
            apk.write(f, 'assets/offline/'+f.name,
                      compress_type=ZIP_STORED if f.suffix == '.xz' else ZIP_DEFLATED, compresslevel=9)
        # Also communicates the original ARM64-only ABI to Android's installer.
        apk.writestr('lib/arm64-v8a/libmain.so', arm.read('lib/arm64-v8a/libmain.so'),
                     compress_type=ZIP_DEFLATED, compresslevel=9)
        for name in source_assets:
            apk.writestr(name, base.read(name), compress_type=ZIP_DEFLATED, compresslevel=9)
        for e in base.infolist():
            if '/' not in e.filename and e.filename.endswith('.properties') and e.filename.startswith(('firebase-', 'play-services-', 'transport-')):
                apk.writestr(e.filename, base.read(e), compress_type=ZIP_DEFLATED, compresslevel=9)
    size = Path(a.out).stat().st_size
    print('Unsigned offline APK:', size, 'bytes')
    if size > 58_980_000: raise SystemExit('Insufficient headroom for signing under 59,000,000 bytes')

if __name__ == '__main__': main()
