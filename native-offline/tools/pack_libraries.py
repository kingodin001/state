#!/usr/bin/env python3
"""Compress unchanged ARM64 libraries, excluding explicitly named ad SDKs."""
import argparse, hashlib, subprocess
from pathlib import Path
from zipfile import ZipFile

AD_LIBRARIES = {'libadsurge_probe.so', 'libadsurgeqjs.so', 'libapminsighta.so',
                'libapminsightb.so', 'libapplovin-native-crash-reporter.so',
                'libbuffer_pgl.so', 'libfile_lock_pgl.so', 'libpglarmor.so',
                'libtt_ugen_layout.so'}

def main():
    p = argparse.ArgumentParser(); p.add_argument('--arm64', required=True)
    p.add_argument('--out', required=True); args = p.parse_args()
    output = Path(args.out); output.mkdir(parents=True, exist_ok=True); rows = []
    with ZipFile(args.arm64) as source:
        for entry in source.infolist():
            if not entry.filename.startswith('lib/') or entry.is_dir(): continue
            name = Path(entry.filename).name
            if name in AD_LIBRARIES: continue
            raw = source.read(entry)
            with (output/(name+'.xz')).open('wb') as dest:
                subprocess.run(['xz', '-T1', '--arm64', '--lzma2=preset=9e', '-c'], input=raw, stdout=dest, check=True)
            rows.append(f'{name}\t{len(raw)}\t{hashlib.sha256(raw).hexdigest()}\n')
    (output/'libs.index').write_text(''.join(rows))
    print('Retained unchanged libraries:', len(rows))

if __name__ == '__main__': main()
