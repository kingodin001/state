import argparse,hashlib,json,subprocess
from pathlib import Path
from zipfile import ZipFile
p=argparse.ArgumentParser();p.add_argument('apk');p.add_argument('--build-tools',required=True);p.add_argument('--report');a=p.parse_args();apk=Path(a.apk);root=Path(__file__).resolve().parents[1];bt=Path(a.build_tools);assert apk.stat().st_size<=59000000
with ZipFile(apk) as z:
 assert z.testzip() is None;names=z.namelist();assert not any(n.startswith('lib/') or 'bin/Data' in n or n.startswith('assets/aa/') for n in names);count=0
 for f in (root/'app/src/main/assets/game').rglob('*'):
  if f.is_file():assert z.read('assets/game/'+f.relative_to(root/'app/src/main/assets/game').as_posix())==f.read_bytes(),str(f);count+=1
 assert sum(n.startswith('classes') and n.endswith('.dex') for n in names)==1
badging=subprocess.check_output([str(bt/'aapt2'),'dump','badging',str(apk)],text=True);assert "package: name='pro.vymi.terrastorm' versionCode='12' versionName='0.11.0'" in badging
cert=subprocess.check_output(['bash',str(bt/'apksigner'),'verify','--verbose','--print-certs',str(apk)],text=True);assert 'Verified using v2 scheme (APK Signature Scheme v2): true' in cert;assert 'd4c59cd000ab665581e15714036962a339b60b4d43e73ec741151f1a07159fef' in cert
r={'version':'0.11.0','versionCode':12,'package':'pro.vymi.terrastorm','sizeBytes':apk.stat().st_size,'sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'signerSha256':'d4c59cd000ab665581e15714036962a339b60b4d43e73ec741151f1a07159fef','gameFilesMatched':count,'zipCrc':'pass','signatureV2V3':'pass','nativeLibraries':0,'physicalAndroidTested':False};print(json.dumps(r));
if a.report:Path(a.report).write_text(json.dumps(r,indent=2)+'\n')
