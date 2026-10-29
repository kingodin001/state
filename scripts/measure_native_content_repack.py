"""Experimental size measurement, not an installable Android build."""
from zipfile import ZipFile
from pathlib import Path
import UnityPy,lzma,json,struct,time,argparse
parser=argparse.ArgumentParser();parser.add_argument("--base",required=True);parser.add_argument("--out",required=True);args=parser.parse_args()
start=time.monotonic();p=Path(args.out);p.parent.mkdir(parents=True,exist_ok=True);c=lzma.LZMACompressor(preset=6);n=count=0
with p.open('wb') as out,ZipFile(args.base) as z:
 for name in sorted(z.namelist()):
  if not name.startswith(('assets/bin/Data/','assets/aa/')) or name.endswith('/'):continue
  data=z.read(name)
  if data.startswith(b'UnityFS'):
   env=UnityPy.Environment();bundle=env.load_file(data,name=name);data=bundle.save(packer='none');count+=1
  label=name.encode();out.write(c.compress(struct.pack('<IQ',len(label),len(data))+label));out.write(c.compress(data));n+=1
  if n%400==0:print(n,'files',flush=True)
 out.write(c.flush())
r={'contentFiles':n,'bundlesRepackedUncompressed':count,'xzPreset6Bytes':p.stat().st_size,'seconds':round(time.monotonic()-start,1),'note':'Experiment only; repacked bundles require catalogue CRC/hash/size updates; Android runtime not tested.'};p.with_suffix('.summary.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r),flush=True)
