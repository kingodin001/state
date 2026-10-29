#!/usr/bin/env python3
"""Losslessly unwrap UnityFS members for solid offline compression.

Never reserializes a SerializedFile: every bundle member must remain byte-identical.
Requires UnityPy and xz 5.4+; input APK is supplied separately by the owner.
"""
import argparse, hashlib, json, struct, subprocess, zlib
from pathlib import Path
from zipfile import ZipFile
import UnityPy
from UnityPy.streams import EndianBinaryWriter
from UnityPy.files import BundleFile

_read_fs = BundleFile.read_fs
def _capture_fs(self, reader):
    nodes, blocks = _read_fs(self, reader)
    self._lossless_nodes, self._lossless_body = nodes, blocks.bytes
    return nodes, blocks
BundleFile.read_fs = _capture_fs

def digest(b): return hashlib.sha256(b).hexdigest()

def unpacked_bundle(data, name):
    original = UnityPy.Environment().load_file(data, name=name)
    body = original._lossless_body
    members = {key: (value.reader.bytes if hasattr(value, 'reader') else value.bytes)
               for key, value in original.files.items()}
    # Preserve the entire decompressed block stream, including gaps and padding.
    # UnityPy's generic save() would reserialize files and repack node offsets.
    info = EndianBinaryWriter(b'\0' * 16)
    info.write_int(1); info.write_u_int(len(body)); info.write_u_int(len(body)); info.write_u_short(0)
    info.write_int(len(original._lossless_nodes))
    for node in original._lossless_nodes:
        info.write_long(node.offset); info.write_long(node.size)
        info.write_u_int(node.flags); info.write_string_to_null(node.path)
    out = EndianBinaryWriter()
    out.write_string_to_null(original.signature); out.write_u_int(original.version)
    out.write_string_to_null(original.version_player); out.write_string_to_null(original.version_engine)
    size_position = out.Position
    out.write_long(0); out.write_u_int(info.Length); out.write_u_int(info.Length); out.write_u_int(64)
    if original._uses_block_alignment: out.align_stream(16)
    out.write(info.bytes); out.write(body)
    length = out.Length; out.Position = size_position; out.write_long(length)
    result = out.bytes
    check = UnityPy.Environment().load_file(result, name=name)
    assert check._lossless_body == body, name
    assert members.keys() == check.files.keys(), name
    for key, value in check.files.items():
        raw = value.reader.bytes if hasattr(value, 'reader') else value.bytes
        assert raw == members[key], (name, key)
    return result, {key: digest(raw) for key, raw in members.items()}

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--base', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--dictionary', default='128MiB')
    args = p.parse_args()
    output = Path(args.out); output.parent.mkdir(parents=True, exist_ok=True)
    records = []
    with output.open('wb') as dest, ZipFile(args.base) as source:
        encoder = subprocess.Popen(['xz', '-T1', '--lzma2=preset=9e,dict='+args.dictionary, '-c'], stdin=subprocess.PIPE, stdout=dest)
        try:
            for name in sorted(source.namelist()):
                if name.endswith('/') or not name.startswith(('assets/bin/Data/', 'assets/aa/')):
                    continue
                raw = source.read(name); original_sha = digest(raw); members = None
                if raw.startswith(b'UnityFS'):
                    raw, members = unpacked_bundle(raw, name)
                label = name.encode('utf-8')
                encoder.stdin.write(struct.pack('<IQ', len(label), len(raw)) + label)
                encoder.stdin.write(raw)
                records.append(dict(name=name, size=len(raw), crc=zlib.crc32(raw), sha256=digest(raw),
                                    originalSha256=original_sha, members=members))
                if len(records) % 400 == 0: print(len(records), 'files', flush=True)
            encoder.stdin.close()
            if encoder.wait() != 0: raise RuntimeError('xz failed')
        except BaseException:
            encoder.kill(); raise
    output.with_suffix('.json').write_text(json.dumps(records, separators=(',', ':')))
    output.with_suffix('.index').write_text(''.join(f"{r['name']}\t{r['size']}\t{r['crc']}\t{r['sha256']}\n" for r in records))
    print(json.dumps(dict(files=len(records), packedBytes=output.stat().st_size,
                          bundles=sum(r['members'] is not None for r in records))), flush=True)

if __name__ == '__main__': main()
