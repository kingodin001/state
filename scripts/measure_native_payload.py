"""Read-only size experiment for the exact original runtime and content.
This is not an APK builder and does not claim Android runtime verification.
"""
import argparse,json,lzma,struct,time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from zipfile import ZipFile
p=argparse.ArgumentParser();p.add_argument('--base',required=True);p.add_argument('--arm64',required=True);p.add_argument('--out',required=True);a=p.parse_args();out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
core={'lib/arm64-v8a/libil2cpp.so','lib/arm64-v8a/libunity.so','lib/arm64-v8a/libmain.so'}
def selected(group,n):
 return n in core if group=='core_runtime' else n.startswith(('assets/bin/Data/','assets/aa/')) if group=='unity_content' else n.endswith('.dex')
def job(group):
 start=time.monotonic();comp=lzma.LZMACompressor(format=lzma.FORMAT_XZ,preset=6);raw=stored=0;files=[];fp=out/(group+'.xz')
 with fp.open('wb') as dst:
  for apk in [a.base,a.arm64]:
   with ZipFile(apk) as z:
    for info in sorted(z.infolist(),key=lambda x:x.filename):
     if info.is_dir() or not selected(group,info.filename):continue
     n=info.filename.encode();dst.write(comp.compress(struct.pack('<IQ',len(n),info.file_size)+n));raw+=info.file_size;stored+=info.compress_size;files.append(info.filename)
     with z.open(info) as source:
      while True:
       b=source.read(1048576)
       if not b:break
       dst.write(comp.compress(b))
  dst.write(comp.flush())
 result={'group':group,'rawBytes':raw,'sourceZipBytes':stored,'xzPreset6Bytes':fp.stat().st_size,'files':len(files),'seconds':round(time.monotonic()-start,1)};print(json.dumps(result),flush=True);return result
with ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(job,['core_runtime','unity_content','all_dex']))
r={'kind':'Compression feasibility only; not a working Android build','compression':'XZ/LZMA2 preset 6 with original bytes intact','groups':results,'coreAndContentXzBytes':sum(x['xzPreset6Bytes'] for x in results if x['group']!='all_dex'),'allThreeXzBytes':sum(x['xzPreset6Bytes'] for x in results),'limitBytes':40000000,'notes':['Core excludes optional SDK native libraries.','Content includes all original Unity/Addressables files, including unused variants.','DEX includes SDK classes; no dependency-safe shrinking was performed.','XZ payloads need a custom unpacking host and are not installable APKs.','File preservation does not prove game startup or ad removal.']};(out/'summary.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items() if k!='groups'}),flush=True)
