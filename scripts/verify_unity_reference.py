#!/usr/bin/env python3
"""Verify preservation against the supplied XAPK, not a reconstructed fixture.

This is a file/object audit. It does not launch Android or certify gameplay.
"""
import argparse, collections, hashlib, io, json, re, tempfile, zipfile
from pathlib import Path
import UnityPy

def digest(data): return hashlib.sha256(data).hexdigest()

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--xapk',type=Path,required=True)
    p.add_argument('--apk',type=Path,required=True)
    p.add_argument('--report',type=Path,required=True)
    a=p.parse_args()
    with tempfile.TemporaryDirectory(prefix='terra-audit-') as tmp:
        root=Path(tmp); original={}; native={}
        with zipfile.ZipFile(a.xapk) as x:
            for name in ('io.state.fight.apk','config.arm64_v8a.apk'):
                with zipfile.ZipFile(io.BytesIO(x.read(name))) as z:
                    for n in z.namelist():
                        if n.startswith('assets/bin/Data/'):
                            z.extract(n,root/'source')
                        if n.startswith(('assets/aa/','lib/')) or re.fullmatch(r'classes\d*\.dex',n) or n.endswith('/global-metadata.dat'):
                            original[n]=digest(z.read(n))
        with zipfile.ZipFile(a.apk) as z:
            assert z.testzip() is None,'ZIP CRC failure'
            for n in z.namelist():
                if n.startswith('assets/bin/Data/'):z.extract(n,root/'new')
                if n in original:native[n]=digest(z.read(n))
            names=z.namelist()
            for n in names:
                if '.split0' in n:
                    assert n.rsplit('.split0',1)[0] not in names,'Ambiguous split and merged file: '+n
        assert original==native,'Executable, metadata or Addressables content changed'
        source=UnityPy.load(str(root/'source/assets/bin/Data'))
        target=UnityPy.load(str(root/'new/assets/bin/Data'))
        old={(o.assets_file.name,o.path_id):o for o in source.objects}
        new={(o.assets_file.name,o.path_id):o for o in target.objects}
        missing=set(old)-set(new);assert not missing,('Missing objects',missing)
        changes=[]
        for key,obj in old.items():
            if obj.get_raw_data()!=new[key].get_raw_data():
                assert obj.type.name in ('Sprite','SpriteAtlas','PlayerSettings'),('Unexpected changed object',key,obj.type.name)
                changes.append({'file':key[0],'id':key[1],'type':obj.type.name})
        added=set(new)-set(old)
        assert all(new[k].type.name=='Texture2D' for k in added),'Unexpected object addition'
        changed=collections.Counter(x['type'] for x in changes)
        assert changed=={'Sprite':66,'SpriteAtlas':2,'PlayerSettings':1},changed
        assert len(added)==2,added
        for obj in target.objects:
            if obj.type.name=='PlayerSettings':
                settings=obj.read_typetree(check_read=False)
                assert settings['productName']=='Терра Шторм'
                assert settings['companyName']=='VYMI'
        result={'apkSha256':digest(a.apk.read_bytes()),'apkBytes':a.apk.stat().st_size,
            'immutableFilesCompared':len(original),'sourceObjects':len(old),
            'objectsPreserved':len(old),'missingObjects':[],
            'changedObjects':changes,'addedTextures':sorted(added),
            'monoBehavioursPreserved':sum(o.type.name=='MonoBehaviour' for o in old.values()),
            'runtimeTested':False}
        a.report.parent.mkdir(parents=True,exist_ok=True)
        a.report.write_text(json.dumps(result,ensure_ascii=False,indent=2))
        print(json.dumps({k:v for k,v in result.items() if k not in ('changedObjects','addedTextures')},ensure_ascii=False))

if __name__=='__main__':main()
