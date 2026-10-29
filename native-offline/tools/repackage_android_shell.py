#!/usr/bin/env python3
"""Replace only the Android shell; preserve every offline game payload byte."""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

def main():
    p = argparse.ArgumentParser()
    for name in ('parent', 'resources', 'dex', 'contract', 'out'): p.add_argument('--'+name, required=True)
    a = p.parse_args()
    with ZipFile(a.parent) as old, ZipFile(a.resources) as resources, ZipFile(a.out, 'w') as out:
        for e in resources.infolist(): out.writestr(e, resources.read(e))
        for e in old.infolist():
            if e.filename in ('AndroidManifest.xml', 'resources.arsc', 'classes.dex', 'assets/offline/unity-resources.index') \
                    or e.filename.startswith(('META-INF/', 'res/')): continue
            out.writestr(e, old.read(e))
        out.write(a.dex, 'classes.dex', compress_type=ZIP_DEFLATED, compresslevel=9)
        out.write(a.contract, 'assets/offline/unity-resources.index', compress_type=ZIP_DEFLATED, compresslevel=9)
    with ZipFile(a.parent) as old, ZipFile(a.out) as new:
        payloads = [n for n in old.namelist() if n.startswith('assets/offline/')]
        for name in payloads:
            if name != 'assets/offline/unity-resources.index': assert old.read(name) == new.read(name), name
    print('Preserved game payloads:', len(payloads), '; unsigned bytes:', Path(a.out).stat().st_size)

if __name__ == '__main__': main()
