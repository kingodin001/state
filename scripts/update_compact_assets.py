"""Guarded asset-only update of the verified 0.17 Android host.

Use a Gradle release build whenever Java, resources, manifest structure,
ProGuard rules or dependencies change. Signing is deliberately a separate step.
"""
import argparse,hashlib,json,struct,subprocess
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
ROOT=Path(__file__).resolve().parents[1]
BASE_COMMIT='18cefbe8ea0b40d7fc7c3765070d34a34f7773f7'
BASE_SHA='bfa744bdbfcb8c9afe599fda0cc2032cc2997a22eff5012c0a89b0f9382339af'
sha=lambda b:hashlib.sha256(b).hexdigest()
def manifest(data):
 b=bytearray(data);u16=lambda at:struct.unpack_from('<H',b,at)[0];u32=lambda at:struct.unpack_from('<I',b,at)[0]
 assert u16(0)==3 and u32(4)==len(b)
 strings=[];positions=[];changed_code=changed_name=0;at=u16(2)
 while at<len(b):
  kind,header,size=struct.unpack_from('<HHI',b,at)
  assert size>=header and at+size<=len(b)
  if kind==1:
   count=u32(at+8);flags=u32(at+16);start=at+u32(at+20)
   for i in range(count):
    p=start+u32(at+header+4*i)
    def length(p,utf8):
     n=b[p] if utf8 else u16(p);step=1 if utf8 else 2;p+=step
     if n & (0x80 if utf8 else 0x8000):n=((n & (0x7f if utf8 else 0x7fff))<<(8 if utf8 else 16))+(b[p] if utf8 else u16(p));p+=step
     return n,p
    utf8=bool(flags&256);n,p=length(p,utf8)
    if utf8:n,p=length(p,True)
    nbytes=n if utf8 else n*2;encoding='utf-8' if utf8 else 'utf-16le'
    strings.append(bytes(b[p:p+nbytes]).decode(encoding));positions.append((p,nbytes,encoding))
  elif kind==0x102:
   name=strings[u32(at+20)]
   if name=='manifest':
    first=at+16+u16(at+24);stride=u16(at+26)
    for i in range(u16(at+28)):
     p=first+stride*i;name=strings[u32(p+4)]
     if name=='versionCode':assert u32(p+16)==18;struct.pack_into('<I',b,p+16,19);changed_code+=1
     elif name=='versionName':
      index=u32(p+16);assert strings[index]=='0.17.0';pos,nbytes,encoding=positions[index];new='0.18.0'.encode(encoding);assert len(new)==nbytes;b[pos:pos+nbytes]=new;changed_name+=1
  at+=size
 assert changed_code==changed_name==1
 return bytes(b)
def build(base,out):
 assert sha(base.read_bytes())==BASE_SHA,'Unexpected base APK'
 protected=['app/src/main/java','app/src/main/res','app/src/main/AndroidManifest.xml','app/proguard-rules.pro','build.gradle','settings.gradle','gradle.properties']
 assert not subprocess.check_output(['git','diff',BASE_COMMIT,'--',*protected],cwd=ROOT),'Android host changed; use Gradle'
 previous=subprocess.check_output(['git','show',BASE_COMMIT+':app/build.gradle'],cwd=ROOT,text=True)
 current=(ROOT/'app/build.gradle').read_text().replace('versionCode 19','versionCode 18').replace("versionName '0.18.0'","versionName '0.17.0'")
 assert current==previous,'Android build configuration changed; use Gradle'
 assets={f.relative_to(ROOT/'app/src/main').as_posix():f for f in (ROOT/'app/src/main/assets').rglob('*') if f.is_file()}
 assert len(assets)>1157 and 'assets/game/source-ai.js' in assets
 out.parent.mkdir(parents=True,exist_ok=True)
 with ZipFile(base) as source,ZipFile(out,'w') as target:
  assert source.testzip() is None
  for item in source.infolist():
   name=item.filename
   if name.startswith(('META-INF/','assets/')) or name.endswith('.idsig'):continue
   data=source.read(name)
   if name=='AndroidManifest.xml':data=manifest(data)
   target.writestr(item,data)
  for name,path in sorted(assets.items()):target.writestr(name,path.read_bytes(),compress_type=ZIP_DEFLATED,compresslevel=9)
 with ZipFile(base) as source,ZipFile(out) as target:
  assert target.testzip() is None
  for name in source.namelist():
   if name.startswith(('META-INF/','assets/')) or name=='AndroidManifest.xml':continue
   assert source.read(name)==target.read(name),name
  assert not any(name.startswith('lib/') for name in target.namelist())
  for name,path in assets.items():assert target.read(name)==path.read_bytes(),name
  report={'baseSha256':BASE_SHA,'unsignedSha256':sha(out.read_bytes()),'assets':len(assets),'classesDexSha256':sha(target.read('classes.dex')),'resourcesArscSha256':sha(target.read('resources.arsc')),'hostUnchanged':True,'version':'0.18.0','versionCode':19}
 assert out.stat().st_size<59_000_000
 print(json.dumps(report))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--base',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();build(a.base,a.out)
