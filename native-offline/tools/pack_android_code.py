#!/usr/bin/env python3
"""Store selected DEX files and the native Activity in an offline XZ stream."""
import argparse, hashlib, subprocess
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED

def main():
    p = argparse.ArgumentParser(); p.add_argument('--dex', required=True)
    p.add_argument('--activity-dex', required=True); p.add_argument('--out', required=True)
    args = p.parse_args(); output = Path(args.out); output.mkdir(parents=True, exist_ok=True)
    files = sorted(Path(args.dex).glob('*.dex'), key=lambda f: (f.name != 'classes.dex', f.name))
    files += sorted(Path(args.activity_dex).glob('*.dex'))
    archive = output.parent/'game-java.apk'
    with ZipFile(archive, 'w', ZIP_STORED) as z:
        for i, file in enumerate(files): z.write(file, 'classes'+(str(i+1) if i else '')+'.dex')
    with (output/'java.xz').open('wb') as dest:
        subprocess.run(['xz', '-T1', '-9e', '-c', str(archive)], stdout=dest, check=True)
    (output/'code.index').write_text(f'game-java.apk\t{archive.stat().st_size}\t{hashlib.sha256(archive.read_bytes()).hexdigest()}\n')
    print('Offline Java code bytes:', (output/'java.xz').stat().st_size)

if __name__ == '__main__': main()
