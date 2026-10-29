"""Import declarative territory/stage data from the user's State.io 4.4.2 bundles.
No Unity executable code, textures, characters, SDKs or network configuration is copied.
Requires UnityPy, numpy and shapely. Run with --bundles /path/to/assets/aa/Android.
"""
from pathlib import Path
import argparse,json,math,collections,re
from functools import lru_cache
from UnityPy.classes.PPtr import PPtr
import numpy as np
import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
args=argparse.ArgumentParser();args.add_argument('--bundles',required=True);args.add_argument('--output',default=str(Path(__file__).resolve().parents[1]/'app/src/main/assets/game/reference-levels.js'));args.add_argument('--report');a=args.parse_args()
e=UnityPy.load(*map(str,Path(a.bundles).glob('*.bundle')))
objects={};gos={};trs={};components=collections.defaultdict(list);matrices={};mesh_cache={};errors=[]
def key(o):return(o.assets_file.name,o.path_id)
def deref(p):return p.deref() if p and p.path_id else None
for o in e.objects:
 if o.type.name=='GameObject':gos[key(o)]=o.read()
 elif o.type.name in ('Transform','RectTransform'):
  d=o.read();trs[key(deref(d.m_GameObject))]=o
 elif o.type.name in ('MonoBehaviour','SpriteRenderer'):
  try:d=o.read();components[key(deref(d.m_GameObject))].append(o)
  except:pass

@lru_cache(None)
def parent(g):
 t=trs.get(g)
 if not t:return None
 f=deref(t.read().m_Father)
 return key(deref(f.read().m_GameObject)) if f else None

@lru_cache(None)
def ancestors(g):return (g,)+ancestors(parent(g)) if g else ()

def matrix(g):
 if g in matrices:return matrices[g]
 t=trs[g].read();q=t.m_LocalRotation;ang=math.atan2(2*(q.w*q.z+q.x*q.y),1-2*(q.y*q.y+q.z*q.z));c,s=math.cos(ang),math.sin(ang);p=t.m_LocalPosition;v=t.m_LocalScale
 m=np.array([[c*v.x,-s*v.y,p.x],[s*v.x,c*v.y,p.y],[0,0,1.]])
 pg=parent(g)
 if pg:m=matrix(pg)@m
 matrices[g]=m;return m

@lru_cache(None)
def mb(g):
 out=[]
 for o in components.get(g,[]):
  if o.type.name=='MonoBehaviour':
   try:out.append((o,o.read_typetree()))
   except:pass
 return out

def world(g,x=0,y=0):return (matrix(g)@np.array([x,y,1.]))[:2].tolist()
def shape(g):
 for o in components.get(g,[]):
  if o.type.name!='SpriteRenderer':continue
  d=o.read()
  try:spr=d.m_Sprite.read();sk=key(deref(d.m_Sprite))
  except:continue
  if sk not in mesh_cache:
   mh=MeshHandler(spr.m_RD,version=o.version);mh.process();verts=mh.m_Vertices;tris=[t for sm in mh.get_triangles() for t in sm];polys=[]
   for t in tris:
    if len(t)!=3:continue
    p=Polygon([(verts[i][0],verts[i][1]) for i in t])
    if p.area>1e-10:polys.append(p)
   mesh_cache[sk]=unary_union(polys).buffer(0)
  geom=mesh_cache[sk];m=matrix(g)
  def trpoly(p):
   points=[]
   for x,y in list(p.exterior.coords)[:-1]:
    if d.m_FlipX:x=-x
    if d.m_FlipY:y=-y
    points.append((m@np.array([x,y,1.]))[:2])
   return Polygon(points)
  parts=[geom] if geom.geom_type=='Polygon' else list(geom.geoms)
  return unary_union([trpoly(p) for p in parts]).buffer(0)
 return None

cameras={};roots=[]
for g in gos:
 for o,d in mb(g):
  if '_cameraSettings'in d:
   cameras[g]=d['_cameraSettings']
   if '_previewCamera' in d or gos[g].m_Name.startswith('Level'):roots.append(g)
roots=[g for g in roots if not any(p in cameras for p in ancestors(g)[1:])]
print('Found',len(roots),'level roots',len(cameras),'cameras',flush=True)
levels=[]
for root in roots:
 stages=[g for g in cameras if g!=root and root in ancestors(g)];stages.sort(key=lambda g:[int(x) for x in re.findall(r'\d+',gos[g].m_Name)] or [0])
 if not stages:stages=[root]
 regions=[];zones=[];tutorial=[];tutorial_hidden=[]
 for g in gos:
  chain=list(ancestors(g))
  if root not in chain:continue
  for o,d in mb(g):
   if '_tutorialData'in d:
    tutorial=d['_tutorialData'].get('TutorialSteps',[]);tutorial_hidden=[str(p['m_PathID']) for p in d['_tutorialData'].get('BuildingsToHideBeforeTutorial',[])]
   if '_playerOnStart' not in d:continue
   sg=next((p for p in chain if p in stages),stages[0]);stage=stages.index(sg);country=next((p for p in chain[1:] if any(z.type.name=='SpriteRenderer' for z in components.get(p,[]))),None)
   if not country:
    for p in chain[1:]:
     candidates=[q for q in gos if parent(q)==p and any(z.type.name=='SpriteRenderer' for z in components.get(q,[]))]
     if len(candidates)==1:country=candidates[0];break
   if not country:errors.append([gos[root].m_Name,gos[g].m_Name,'no territory sprite']);continue
   try:geom=shape(country)
   except Exception as ex:errors.append([gos[root].m_Name,gos[g].m_Name,str(ex)[:90]]);continue
   if geom is None or geom.is_empty:errors.append([gos[root].m_Name,gos[g].m_Name,'empty outline']);continue
   pop=deref(o.read().m_GameObject);settings=next((dd for _,dd in mb(g) if '_overrideData' in dd),{})
   spawn=next((dd['_spawnType'] for _,dd in sum((mb(p) for p in chain),[]) if '_spawnType' in dd),None)
   pos=world(g);parts=[geom] if geom.geom_type=='Polygon' else list(geom.geoms);parts.sort(key=lambda p:p.area,reverse=True)
   polys=[[[float(x),float(y)] for x,y in list(p.simplify(.003,preserve_topology=True).exterior.coords)[:-1]] for p in parts if p.area>.0001]
   regions.append({'sourceId':str(o.path_id),'name':gos[country].m_Name,'sourceStage':gos[sg].m_Name,'stage':stage,'center':pos,'polys':polys,'spawn':spawn,'override':settings.get('_overrideData') if settings.get('_isOverride') else None,'multiplier':settings.get('_startUnitsMultiplier',1),'kind':'normal'})
 if not regions:continue
 # Stable order: tutorial source / first target, then the rest of each stage.
 tutorial_order=[]
 for step in tutorial:
  tutorial_order += [str(p['m_PathID']) for p in step.get('Source',[])]+[str(step.get('Target',{}).get('m_PathID'))]
 tutorial_order=list(dict.fromkeys(tutorial_order))
 regions.sort(key=lambda r:(r['stage'],0 if r['spawn']==0 else 1, tutorial_order.index(r['sourceId']) if r['sourceId'] in tutorial_order else 999,r['name']))
 for stage in range(len(stages)):
  enemy=1
  for r in regions:
   if r['stage']!=stage:continue
   r['owner']=1 if r['spawn']==0 else enemy+1 if r['spawn']==1 else 0
   if r['spawn']==1:enemy+=1
  # Some PvP prefabs have spawn positions on a separate child; declare any omission.
  if not any(r['owner']==1 or 'pvp' in gos[root].m_Name.lower() and r['spawn']==2 for r in regions if r['stage']==stage):errors.append([gos[root].m_Name,stage,'no player spawn'])
 # Mechanic views that are active within their territory, not dormant generic indicators.
 for g in gos:
  chain=list(ancestors(g))
  if root not in chain:continue
  for o,d in mb(g):
   if not any(k in d for k in ['_zoneConfig','_shootingContainer','_additionalFightersBuildingConfig','_shieldBuildingConfig']):continue
   if any(not gos[p].m_IsActive for p in chain if p!=root):continue
   pos=world(g);nearest=min(regions,key=lambda r:math.dist(r['center'],pos));near=math.dist(nearest['center'],pos)<2
   if '_shootingContainer'in d and near:nearest['kind']='turret'
   if '_zoneConfig'in d:
    try:
     p=d['_zoneConfig'];config=PPtr(**p,assetsfile=o.assets_file).deref();cd=config.read_typetree();factor=1+cd.get('_zoneImpactPercentage',0)/100
     p=d['_zoneView'];zv=PPtr(**p,assetsfile=o.assets_file).deref();zd=zv.read_typetree();radius=zd.get('_zoneRadius',1.75)
     zones.append({'x':pos[0],'y':pos[1],'radius':radius,'factor':factor,'stage':nearest['stage'],'source':cd.get('m_Name','')})
    except:pass
   if '_additionalFightersBuildingConfig'in d and near and not any('Indicator' in gos[p].m_Name for p in chain):nearest['kind']='reinforcement';nearest['captureBonus']=50
   if '_shieldBuildingConfig'in d and near and not any('Visual' in gos[p].m_Name or 'Indicator' in gos[p].m_Name for p in chain):
    nearest['kind']='shield';p=d['_shieldBuildingConfig'];cd=PPtr(**p,assetsfile=o.assets_file).deref().read_typetree();nearest['shieldPoints']=cd.get('_shieldAmount',50)
 points=[p for r in regions for poly in r['polys'] for p in poly];xmin=min(p[0] for p in points);xmax=max(p[0] for p in points);ymin=min(p[1] for p in points);ymax=max(p[1] for p in points);unit=40
 def tr(p):return [round((p[0]-xmin)*unit,3),round((ymax-p[1])*unit,3)]
 def cam(g):
  c=cameras[g];return {'center':tr([c['Position']['x'],c['Position']['y']]),'halfHeight':round(c['Size']*unit,3)}
 for i,r in enumerate(regions):
  r['id']=i;r['center']=tr(r['center']);r['polys']=[[tr(p) for p in poly] for poly in r['polys']];r['poly']=r['polys'][0];r['units']=r['override']['StartAmount'] if r['override'] else (15 if r['owner']==1 else 20 if r['owner']>1 else 5);r['units']=round(r['units']*r['multiplier']);r['sourceOverride']=bool(r['override'])
  if r['override']:r['sourceSettings']=r['override'];r['spawnRate']=r['override']['SpawnSpeed'];r['sourceCap']=r['override']['LimitAmount']
  del r['override']
 for z in zones:z['x'],z['y']=tr([z['x'],z['y']]);z['radius']=round(z['radius']*unit,3)
 levels.append({'source':gos[root].m_Name,'sourceId':str(root[1]),'width':round((xmax-xmin)*unit,3),'height':round((ymax-ymin)*unit,3),'regions':regions,'stages':[{'name':gos[g].m_Name,'camera':cam(g),'regions':[r['id'] for r in regions if r['stage']==i]} for i,g in enumerate(stages)],'previewCamera':cam(root),'zones':zones,'tutorial':bool(tutorial),'tutorialTargets':[next((r['id'] for r in regions if r['sourceId']==str(t.get('Target',{}).get('m_PathID'))),-1) for t in tutorial],'tutorialHidden':[r['id'] for r in regions if r['sourceId'] in tutorial_hidden],'unit':unit})
 print('Exported',gos[root].m_Name,len(regions),'territories',len(stages),'stages',flush=True)
priority=['Level_Madagascar_Tutorial_1 Variant','Level_Madagascar_Tutorial_2_hard Variant','Level_USA_0_SVG','Level_EU_SVG','Level_Italy_SVG','Level_Africa','Level_Arabian_SVG','Level_India_SVG','Level_China_SVG_v2','Level_Japan_SVG','Level_Korea_Fixed_SVG','Level_UK_SVG','Level_LatinAmerica','Level_Oceania_SVG_v2']
levels.sort(key=lambda x:(priority.index(x['source']) if x['source'] in priority else 100,x['source']))
pvp=[x for x in levels if 'pvp' in x['source'].lower()];normal=[x for x in levels if x not in pvp]
for level in levels:
 for region in level['regions']:del region['poly']
data={'version':'State.io 4.4.2','maps':normal,'pvp':pvp,'constants':{'slowFactor':.5,'fastFactor':1.5,'captureReinforcements':50,'shieldAmount':50,'hardShieldAmount':100},'notes':'Declarative geometry / placement / stage cameras from supplied APK; unspecified economy and AI values are our adaptation.'}
Path(a.output).write_text('/* Declarative level geometry imported from the user-supplied reference. See docs/REFERENCE_IMPORT.md. */\n(function(g){g.TerraReference='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';for(const map of [...g.TerraReference.maps,...g.TerraReference.pvp])for(const r of map.regions)r.poly=r.polys[0];if(typeof module!=="undefined")module.exports=g.TerraReference;})(typeof globalThis!=="undefined"?globalThis:this);\n')
report={'maps':len(normal),'pvp':len(pvp),'regions':sum(len(x['regions']) for x in levels),'stages':sum(len(x['stages']) for x in levels),'geometrySprites':len(mesh_cache),'errors':errors,'source':'State.io 4.4.2 supplied XAPK'}
if a.report:Path(a.report).write_text(json.dumps(report,ensure_ascii=False,indent=1))
print(json.dumps({k:v for k,v in report.items() if k!='errors'},ensure_ascii=False),'errors',len(errors),flush=True)
