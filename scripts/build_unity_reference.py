#!/usr/bin/env python3
"""Offline, separate-package Unity preservation experiment; never patches checks.

Requires Java, Apktool 3, Android build tools, UnityPy, Pillow and CairoSVG.
Signing password is supplied only through TERRA_KEYSTORE_PASSWORD.
"""
from __future__ import annotations
import argparse, copy, hashlib, io, json, os, re, shutil, struct, subprocess
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ANDROID = 'http://schemas.android.com/apk/res/android'
ET.register_namespace('android', ANDROID)
def attr(name): return '{' + ANDROID + '}' + name
def sha(data): return hashlib.sha256(data).hexdigest()
def run(argv, **kwargs):
    subprocess.run(list(map(str, argv)), check=True, **kwargs)

def adapt_manifest(path):
    tree = ET.parse(path); root = tree.getroot()
    root.set('package', 'pro.vymi.terrastorm.reference')
    for name in ('requiredSplitTypes', 'splitTypes'):
        root.attrib.pop(attr(name), None)
    for child in list(root):
        if child.tag in ('permission', 'queries', 'uses-permission'):
            if child.tag == 'uses-permission' and child.get(attr('name')) == 'android.permission.VIBRATE':
                continue
            root.remove(child)
    app = root.find('application')
    for name in ('dataExtractionRules', 'fullBackupContent', 'appComponentFactory'):
        app.attrib.pop(attr(name), None)
    app.set(attr('label'), 'Терра Шторм — Unity тест')
    app.set(attr('icon'), '@drawable/terra_reference_icon')
    app.set(attr('roundIcon'), '@drawable/terra_reference_icon')
    app.set(attr('allowBackup'), 'false')
    app.set(attr('usesCleartextTraffic'), 'false')
    kept = []
    for child in list(app):
        name = child.get(attr('name'), '')
        if child.tag == 'activity' and name == 'com.unity3d.player.UnityPlayerActivity':
            kept.append(name); continue
        if child.tag == 'meta-data' and (name.startswith('unity.') or name.startswith('unityplayer.') or name in ('notch.config',)):
            continue
        app.remove(child)
    tree.write(path, encoding='utf-8', xml_declaration=True)
    return kept

def load_unity(data):
    import UnityPy
    return UnityPy.load(str(data))

def compile_logo(destination):
    """Draw repository-native vector lettering using our existing licensed font."""
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    font = TTFont(ROOT/'app/src/main/assets/game/fonts/RussoOne-Regular.ttf')
    gs = font.getGlyphSet(); cmap = font.getBestCmap()
    paths = []
    for text, top, colour in [('ТЕРРА', 126, '#ef6667'), ('ШТОРМ', 257, '#53b9f5')]:
        advance = sum(gs[cmap[ord(c)]].width for c in text)
        scale = min(470/advance, 126/font['head'].unitsPerEm)
        x = (512-advance*scale)/2
        pen = SVGPathPen(gs)
        for c in text:
            name = cmap[ord(c)]
            gs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, top)))
            x += gs[name].width*scale
        outline=pen.getCommands()
        paths.append(f'<path d="{outline}" fill="none" stroke="#fff" stroke-width="15" stroke-linejoin="round"/><path d="{outline}" fill="{colour}"/>')
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="283" viewBox="0 0 512 283">'+''.join(paths)+'</svg>'
    destination.write_text(svg)
    return svg

def replace_sprite(sprite, svg, new_name):
    """Compile a new SVG asset to its own native texture, without editing an atlas."""
    import cairosvg
    from PIL import Image
    from UnityPy.streams import EndianBinaryReader
    data = sprite.read_typetree()
    atlas = sprite.read().m_SpriteAtlas.deref()
    sf = atlas.assets_file
    ad = atlas.read_typetree()
    entry = next(v for k, v in ad['m_RenderDataMap'] if k == data['m_RenderDataKey'])
    template = next(o for o in sf.objects.values() if o.type.name == 'Texture2D')
    td = template.read_typetree()
    w, h = round(data['m_Rect']['width']), round(data['m_Rect']['height'])
    rgba = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(),output_width=w,output_height=h))).convert('RGBA')
    # Unity stores texture rows bottom-up. This is format conversion of the SVG.
    pixels = rgba.transpose(Image.Transpose.FLIP_TOP_BOTTOM).tobytes()
    td.update(m_Name=new_name, m_Width=w, m_Height=h, m_TextureFormat=4,
              m_CompleteImageSize=len(pixels), m_MipCount=1, m_ImageCount=1,
              m_IsReadable=False, m_StreamingMipmaps=False, m_StreamingMipmapsPriority=0,
              m_MipsStripped=0, image_data=pixels)
    if 'm_PlatformBlob' in td: td['m_PlatformBlob'] = []
    if 'm_StreamData' in td: td['m_StreamData'].update(offset=0,size=0,path='')
    # Texture2D stores the serialized byte field as 'image data'.
    td.pop('image_data', None); td['image data'] = pixels
    new = copy.copy(template); new.path_id = max(sf.objects)+1
    new.reader = EndianBinaryReader(b'', endian=template.reader.endian)
    new.data = None; sf.objects[new.path_id] = new
    new.save_typetree(td)
    ptr = {'m_FileID':0,'m_PathID':new.path_id}
    transform = dict(data['m_RD']['uvTransform'])
    entry.update(texture=ptr, alphaTexture={'m_FileID':0,'m_PathID':0},
        textureRect={'x':0.,'y':0.,'width':float(w),'height':float(h)},
        textureRectOffset={'x':0.,'y':0.},atlasRectOffset={'x':0.,'y':0.},
        uvTransform=transform, settingsRaw=0, downscaleMultiplier=1.)
    atlas.save_typetree(ad)
    # Fallback render data has the same texture if the atlas is not yet bound.
    data['m_RD'].update({k:entry[k] for k in ('texture','alphaTexture','textureRect','textureRectOffset','atlasRectOffset','uvTransform','settingsRaw','downscaleMultiplier')})
    data['m_RD']['texture'] = {'m_FileID':data['m_SpriteAtlas']['m_FileID'],'m_PathID':new.path_id}
    sprite.save_typetree(data)
    return {'sprite':data['m_Name'],'file':sprite.assets_file.name,'textureFile':sf.name,'id':sprite.path_id,
            'newTexture':new.path_id,'size':[w,h],'svgSha256':sha(svg.encode())}

def adapt_unity(data):
    env = load_unity(data); changes=[]; modified=set()
    logo = compile_logo(ROOT/'native-reference/branding/terra-logo.svg')
    arrow = (ROOT/'native-reference/branding/order-arrow.svg').read_text()
    sprites = [o for o in env.objects if o.type.name == 'Sprite']
    for o in sprites:
        d=o.read_typetree(); name=d['m_Name']
        if name == 'State_logo':
            changes.append(replace_sprite(o,logo,'TerraStormLogo')); modified.add(o.assets_file)
        elif name == 'arrow' and d['m_Rect']['width'] == 512:
            # Its texture lives in another file, so use a local texture template.
            # The helper adds an explicit external reference if needed below.
            changes.append(replace_sprite(o,arrow,'TerraOrderArrow')); modified.add(o.assets_file)
        elif re.match(r'^[BF]_', name):
            # Native vector mesh variation, not a raster recolour or AI asset.
            rd=d['m_RD']; vertex=rd['m_VertexData']; raw=bytearray(vertex['m_DataSize']); n=vertex['m_VertexCount']
            channels=vertex['m_Channels']; pos=channels[0]
            if pos['stream'] != 0 or pos['format'] != 0: raise ValueError('Unexpected vector format '+name)
            stride=max(c['offset']+4*(c['dimension']&15) for c in channels if c['stream']==0)
            for i in range(n):
                offset=i*stride+pos['offset'];x,y,z=struct.unpack_from('<fff',raw,offset)
                # Keep the same family, pivot and footprint; give each shape a
                # slightly different aspect and a restrained angular skew.
                skew=.022 if name.startswith('F_') else -.018
                struct.pack_into('<fff',raw,offset,x*.955+y*skew,y*1.025,z)
            vertex['m_DataSize']=bytes(raw);o.save_typetree(d);modified.add(o.assets_file)
            changes.append({'sprite':name,'file':o.assets_file.name,'id':o.path_id,'kind':'vector variant'})
    for o in env.objects:
        if o.type.name != 'PlayerSettings': continue
        raw=o.get_raw_data()
        def serialized_string(s):
            b=s.encode('utf-8');return struct.pack('<I',len(b))+b+b'\0'*((-len(b))%4)
        for old,new in [('Airion Games','VYMI'),('State.io','Терра Шторм')]:
            before=serialized_string(old);after=serialized_string(new)
            if before not in raw: raise ValueError('Missing product setting '+old)
            raw=raw.replace(before,after)
        o.set_raw_data(raw);modified.add(o.assets_file)
        changes.append({'kind':'application identity','file':o.assets_file.name,'id':o.path_id})
    # Atlas data modified by replacements can be external to the Sprite file.
    for f in env.assets:
        if f.is_changed: modified.add(f)
    written=[]
    for f in modified:
        target=data/f.name
        splits=list(data.glob(f.name+'.split*'))
        payload=f.save()
        if splits:
            # Retain Unity's original split representation. Never ship both
            # merged and split versions of one serialized asset.
            chunk=1048576
            for p in splits: p.unlink()
            for i,start in enumerate(range(0,len(payload),chunk)):
                (data/(f.name+'.split'+str(i))).write_bytes(payload[start:start+chunk])
            if target.exists(): target.unlink()
        else:
            target.write_bytes(payload)
        written.append(f.name)
    return {'changes':changes,'serializedFilesWritten':sorted(written)}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--xapk',type=Path,required=True);p.add_argument('--apktool',type=Path,required=True)
    p.add_argument('--build-tools',type=Path,required=True);p.add_argument('--keystore',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True);p.add_argument('--work',type=Path,default=ROOT/'build/unity-reference')
    p.add_argument('--reuse-decoded',action='store_true',help='Developer retry only, before any serialized files have been saved')
    a=p.parse_args(); a.work.mkdir(parents=True,exist_ok=True);a.output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(a.xapk) as z:
        z.extract('io.state.fight.apk',a.work);z.extract('config.arm64_v8a.apk',a.work)
    decoded=a.work/'decoded'
    if not a.reuse_decoded:
        run(['java','-jar',a.apktool,'d','-f','-s','-o',decoded,a.work/'io.state.fight.apk'])
    with zipfile.ZipFile(a.work/'config.arm64_v8a.apk') as z:
        for item in z.infolist():
            if item.filename.startswith('lib/'):z.extract(item,decoded)
    kept=adapt_manifest(decoded/'AndroidManifest.xml')
    target=decoded/'res/drawable-nodpi/terra_reference_icon.png';target.parent.mkdir(exist_ok=True)
    shutil.copyfile(ROOT/'app/src/main/res/drawable-nodpi/terra_icon.png',target)
    yml=decoded/'apktool.yml';text=yml.read_text();text=re.sub(r'versionCode: \d+', 'versionCode: 7',text);text=re.sub(r'versionName: .*','versionName: 0.7.0-unity-test',text);yml.write_text(text)
    assets=adapt_unity(decoded/'assets/bin/Data')
    unsigned=a.work/'unsigned.apk';aligned=a.work/'aligned.apk'
    run(['java','-jar',a.apktool,'b',decoded,'-o',unsigned])
    run([a.build_tools/'zipalign','-f','-P','16','4',unsigned,aligned])
    run(['bash',a.build_tools/'apksigner','sign','--ks',a.keystore,'--ks-key-alias','terrastorm','--ks-pass','env:TERRA_KEYSTORE_PASSWORD','--out',a.output,aligned])
    run(['bash',a.build_tools/'apksigner','verify','--verbose','--print-certs',a.output])
    original={}; source_sizes={}
    for name in ('io.state.fight.apk','config.arm64_v8a.apk'):
        with zipfile.ZipFile(a.work/name) as z:
            for item in z.infolist():
                if item.filename.startswith(('assets/bin/Data/','assets/aa/','lib/')) or re.fullmatch(r'classes\d*\.dex',item.filename):
                    original[item.filename]=sha(z.read(item));source_sizes[item.filename]=item.file_size
    with zipfile.ZipFile(a.output) as z:
        assert z.testzip() is None
        included={n:sha(z.read(n)) for n in z.namelist() if n in original}
        changed=[n for n,h in included.items() if h!=original[n]]
        missing=sorted(set(original)-set(included))
        # Only source split files replaced with their merged equivalents may go missing.
        unexpected=[n for n in missing if '.split' not in n]
        if unexpected: raise AssertionError('Missing source content: '+str(unexpected))
        immutable=[n for n in original if n.endswith('.dex') or n.startswith('lib/') or n.startswith('assets/aa/') or n.endswith('global-metadata.dat')]
        if any(included.get(n)!=original[n] for n in immutable):raise AssertionError('Executable/catalogue changed')
    report={'kind':'offline Unity preservation experiment','package':'pro.vymi.terrastorm.reference',
      'version':'0.7.0-unity-test','sourceXapkSha256':sha(a.xapk.read_bytes()),'apkSha256':sha(a.output.read_bytes()),
      'apkBytes':a.output.stat().st_size,'networkPermissions':[], 'androidEntryPoints':kept,
      'runtimeTested':False,'sourceExecutableUnchanged':True,'addressablesUnchanged':True,
      'retainedSourceFiles':len(included),'changedSourceFiles':changed,'mergedSourceSplitFiles':missing,
      'assets':assets,'sourceFiles':{n:{'sha256':h,'size':source_sizes[n]} for n,h in original.items()},
      'limitations':['Android launch and gameplay not yet tested','Original third-party executable and assets remain','No own online, payment or advertisement service integration','Separate installation; no WebView save migration']}
    a.output.with_suffix('.report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k not in ('sourceFiles','assets')},ensure_ascii=False))

if __name__=='__main__':main()
