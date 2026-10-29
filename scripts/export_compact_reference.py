"""Export a game-only config whitelist and compact visual pack from the supplied XAPK.
Uses declaration DLLs, never packages source executable code or SDK configuration.
"""
import json,argparse,re,hashlib,collections
from pathlib import Path
from PIL import Image
from UnityPy.classes.PPtr import PPtr
from UnityPy.export import SpriteHelper as SH
from UnityPy.export.Texture2DConverter import get_image_from_texture2d
from UnityPy.helpers.MeshHelper import MeshHandler
from reference_reader import Reader,load_data
p=argparse.ArgumentParser();p.add_argument('--data',required=True);p.add_argument('--dlls',required=True);p.add_argument('--out',required=True);a=p.parse_args();out=Path(a.out);out.mkdir(parents=True,exist_ok=True);images=out/'images';images.mkdir(exist_ok=True)
e=load_data(a.data);r=Reader(a.dlls);all=[];errors=[];objects={(o.assets_file.name,str(o.path_id)):o for o in e.objects}
for o in e.objects:
 if o.type.name!='MonoBehaviour':continue
 try:
  d=r.read(o)
  if d.get('m_Name'):all.append({'file':o.assets_file.name,'id':str(o.path_id),'kind':o.read(check_read=False).m_Script.read().m_ClassName,'data':d})
 except Exception as ex:errors.append(str(ex))
print('Named configurations',len(all),'other unreadable components',len(errors),flush=True)
index={(x['file'],x['id']):x for x in all}
def ref(x,v):
 if not v or not v.get('m_PathID'):return None
 o=objects[(x['file'],x['id'])];t=PPtr(m_FileID=v['m_FileID'],m_PathID=v['m_PathID'],assetsfile=o.assets_file).deref();return(t.assets_file.name,str(t.path_id))
def sprite(x,v):
 k=ref(x,v);return ':'.join(k) if k else None
def cfg(x,v):return index[ref(x,v)]
def one(k):return next(x['data'] for x in all if x['kind']==k)
def clean(v):
 if isinstance(v,list):return [clean(x) for x in v]
 if isinstance(v,dict):return {k:str(x) if k in ('rid','m_PathID') else clean(x) for k,x in v.items() if k not in ['m_GameObject','m_Enabled','m_Script','m_Name']}
 return v
skins=[]
for x in all:
 cat={'BuildingSkin':'base','FighterSkin':'fighter','LeaderSkin':'leader','ColorSkin':'color'}.get(x['kind'])
 if not cat:continue
 d=x['data'];s=clean(d);s.update(category=cat,nativeId=d['_id'],sourceName=d['m_Name'],sprite=sprite(x,d.get('_spawnerSkin')or d.get('_skin')),preview=sprite(x,d.get('_3dPreviewSprite')),details=sprite(x,d.get('_3dDetailsSprite')),skills=[{'kind':t['type']['class'],'data':clean(t.get('data',{}))} for t in d.get('references',{}).get('RefIds',[]) if t['type']['class']]);s.pop('references',None);skins.append(s)
rarities=[]
for x in all:
 if x['kind']=='SkinRarityStyleConfig':
  d=x['data'];rarities.append({'rarity':d['_rarityType'],'color':d['_frameColor'],'card':sprite(x,d['_cardBackRectSprite']),'square':sprite(x,d['_cardBackSquareSprite'])})
rarities.sort(key=lambda x:x['rarity']);sets=[]
for x in all:
 if x['kind']!='StickersSetConfig':continue
 d=x['data'];stickers=[]
 for ptr in d['_stickerConfigs']:
  t=cfg(x,ptr);s=t['data'];stickers.append({'id':s['_id'],'title':s['_titleLocalizedString']['mTerm'],'sprite':sprite(t,s['_iconSprite'])})
 sets.append({'id':d['_id'],'title':d['_titleLocalizedString']['mTerm'],'color':d['_titleColor'],'sprite':sprite(x,d['_iconSprite']),'stickers':stickers})
styles=[dict(id=x['data']['_id'],name=x['data']['_name'],background=x['data']['_backgroundColor']) for x in all if x['kind']=='StyleSkin'];palettes={};x=next(x for x in all if x['kind']=='PaletteConfig')
for st in x['data']['_palettes']:palettes[cfg(x,st['Style'])['data']['_id']]={cfg(x,v['ColorSkin'])['data']['_id']:v['Palette'] for v in st['Palettes']}
levels=[{'id':x['data']['_id'],'name':x['data']['m_Name'],'guid':x['data']['_levelObjectRef']['m_AssetGUID'],'linear':x['data']['_linearStages'],'looped':x['data']['_loopedStages']} for x in all if x['kind']=='LevelConfig'];terms={t['Term']:{'en':t['Languages'][0],'ru':t['Languages'][1]} for t in one('LanguageSourceAsset')['mSource']['mTerms'] if len(t['Languages'])>1}
data={'sourceVersion':'State.io 4.4.2','skins':skins,'rarities':rarities,'stickerSets':sets,'styles':styles,'palettes':palettes,'levels':levels,'terms':terms,'campaign':one('LevelsConfigs'),'playerUpgrades':one('PlayerUpgradesConfig'),'botUpgrades':one('BotsUpgradesConfig'),'neutralUpgrades':one('NeutralUpgradesConfig'),'skinUpgrades':one('SkinUpgradeConfig'),'currencyRates':one('CurrencyByLevelRateConfig')}
(out/'config.js').write_text('(function(g){g.TerraSource='+json.dumps(clean(data),ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=g.TerraSource;})(globalThis);')
print('Config exported',len(skins),'skins',len(levels),'levels',flush=True)
cache=collections.OrderedDict()
def get_image(s,t,alpha):
 obj=t.deref();key=(obj.assets_file.name,obj.path_id,alpha.path_id if alpha else 0)
 if key not in cache:
  im=get_image_from_texture2d(obj.read(),False)
  if alpha:im=Image.merge('RGBA',(*im.split()[:3],get_image_from_texture2d(alpha.read(),False).split()[0]))
  cache[key]=im
  while len(cache)>3:cache.popitem(last=False)
 cache.move_to_end(key);return cache[key]
SH.get_image=get_image
records={};names=collections.defaultdict(list)
objects=[o for o in e.objects if o.type.name=='Sprite']
def atlas_key(o):
 s=o.read()
 try:
  at=s.m_SpriteAtlas.read();d=next(v for k,v in at.m_RenderDataMap if k==s.m_RenderDataKey);t=d.texture.deref();return(t.assets_file.name,t.path_id)
 except:return(o.assets_file.name,0)
objects.sort(key=atlas_key);errors=[]
for i,o in enumerate(objects):
 s=o.read();name=s.m_Name
 if any(x in name.lower() for x in ['azur','googleplay','google_play','airicore']):continue
 try:
  rid=o.assets_file.name+':'+str(o.path_id);digest=hashlib.sha256(rid.encode()).hexdigest()[:20];im=s.image.convert('RGBA')
  if re.fullmatch(r'[BF]_.+',name):
   mh=MeshHandler(s.m_RD,version=o.version);mh.process();vs=[(v[0]*.955+v[1]*.022,-v[1]*1.025) for v in mh.m_Vertices];xs=[v[0] for v in vs];ys=[v[1] for v in vs];x,y,w,h=min(xs),min(ys),max(xs)-min(xs),max(ys)-min(ys);paths=''.join('M'+' '.join('%g,%g'%vs[j] for j in tri)+'Z' for sm in mh.get_triangles() for tri in sm);fp=images/(digest+'.svg');fp.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}"><path d="{paths}" fill="white"/></svg>')
  elif name=='State_logo':
   fp=images/(digest+'.svg');fp.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256"><rect width="512" height="256" rx="40" fill="#153358"/><text x="256" y="114" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="78" fill="#59bbff">ТЕРРА</text><text x="256" y="211" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="78" fill="#ffb746">ШТОРМ</text></svg>')
  else:fp=images/(digest+'.webp');im.save(fp,'WEBP',quality=92,method=5)
  border=s.m_Border;records[rid]={'name':name,'size':list(im.size),'border':[border.x,border.y,border.z,border.w],'file':'reference/images/'+fp.name};names[name].append(rid)
 except Exception as ex:errors.append([name,str(ex)])
 if i%200==0:print('Sprites',i,len(objects),flush=True)
assert not errors,errors
(out/'assets.js').write_text('(function(g){g.TerraAssets='+json.dumps({'sprites':records,'names':names},ensure_ascii=False,separators=(',',':'))+';})(globalThis);');print('Exported',len(records),'sprites',flush=True)
