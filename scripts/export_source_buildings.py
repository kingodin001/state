"""Export active Building flags and special-building parameters from the supplied bundles."""
import argparse,json,collections
from pathlib import Path
from functools import lru_cache
import UnityPy
p=argparse.ArgumentParser();p.add_argument('--bundles',required=True);p.add_argument('--out',default='app/src/main/assets/game/source-buildings.js');p.add_argument('--audit',default='tests/fixtures/source-disabled-buildings.json');a=p.parse_args()
e=UnityPy.load(*map(str,Path(a.bundles).glob('*.bundle')));gos={};trs={};comps=collections.defaultdict(list)
def key(o):return (o.assets_file.name,o.path_id)
def ref(p):return p.deref() if p and p.path_id else None
for o in e.objects:
 try:
  if o.type.name=='GameObject':gos[key(o)]=o.read()
  elif o.type.name in ['Transform','RectTransform']:trs[key(ref(o.read().m_GameObject))]=o
  elif o.type.name=='MonoBehaviour':comps[key(ref(o.read().m_GameObject))].append(o)
 except:pass
@lru_cache(None)
def chain(g):
 t=trs.get(g);p=ref(t.read().m_Father) if t else None
 return (g,)+chain(key(ref(p.read().m_GameObject))) if p else (g,)

from UnityPy.classes.PPtr import PPtr
from pathlib import Path
from functools import lru_cache
raw=Path('app/src/main/assets/game/reference-levels.js').read_text();data=json.JSONDecoder().raw_decode(raw.split('g.TerraReference=',1)[1])[0];layouts=[*data['maps'],*data['pvp']];out={};audit=[]
@lru_cache(None)
def mono(g):
 rows=[]
 for o in comps.get(g,[]):
  try:rows.append((o,o.read_typetree()))
  except:pass
 return rows
cam=set(g for g in gos if any('_cameraSettings' in d for o,d in mono(g)))
descendants=collections.defaultdict(list)
for child in gos:
 for ancestor in chain(child):descendants[ancestor].append(child)
for l in layouts:
 root=next(g for g in gos if str(g[1])==l['sourceId'] and gos[g].m_Name==l['source']);records={};bySource={r['sourceId']:r for r in l['regions']}
 for g in gos:
  c=chain(g)
  if root not in c:continue
  for o,d in mono(g):
   if '_playerOnStart' not in d or str(o.path_id) not in bySource:continue
   stage=next((p for p in c if p!=root and p in cam),root)
   enabled=bool(d.get('m_Enabled',1)) and all(gos[p].m_IsActive for p in c[:c.index(stage)])
   records[str(o.path_id)]={'enabled':enabled}
   if not enabled:audit.append({'map':l['source'],'sourceId':str(o.path_id),'region':bySource[str(o.path_id)]['name'],'disabled':[{ 'name':gos[p].m_Name,'id':str(p[1])} for p in c[:c.index(stage)] if not gos[p].m_IsActive]})
   # Mechanics are attached to the actual active Building object through ancestors.
   if enabled:
    for cg in descendants[g]:
     cc=chain(cg)
     if not all(gos[p].m_IsActive for p in cc[:cc.index(stage)]):continue
     for co,cd in mono(cg):
      if '_turretConfig' in cd:
       cfg=PPtr(**cd['_turretConfig'],assetsfile=co.assets_file).deref().read_typetree();zone=PPtr(**cd['_zoneView'],assetsfile=co.assets_file).deref().read_typetree()
       records[str(o.path_id)].update(kind='turret',turret={k:v for k,v in cfg.items() if k.startswith('_')},zone={k:v for k,v in zone.items() if k.startswith('_')})
      if '_shieldBuildingConfig' in cd and not any('Indicator' in gos[p].m_Name or 'Visual' in gos[p].m_Name for p in cc[:cc.index(g)+1]):
       cfg=PPtr(**cd['_shieldBuildingConfig'],assetsfile=co.assets_file).deref().read_typetree();records[str(o.path_id)].update(kind='shield',shieldPoints=cfg.get('_shieldAmount',50))
      if '_additionalFightersBuildingConfig' in cd and not any('Indicator' in gos[p].m_Name for p in cc[:cc.index(g)+1]):
       cfg=PPtr(**cd['_additionalFightersBuildingConfig'],assetsfile=co.assets_file).deref().read_typetree();records[str(o.path_id)].update(kind='reinforcement',reinforcement={k:v for k,v in cfg.items() if k.startswith('_')})
 assert set(records)==set(bySource),(l['source'],set(bySource)-set(records));out[l['source']]=records;print(l['source'],len(records),'inactive',sum(not r['enabled'] for r in records.values()),flush=True)
Path(a.audit).write_text(json.dumps(audit,ensure_ascii=False,indent=2))
Path(a.out).write_text('/* Active Building objects and mechanic settings read from the supplied APK bundles. */\n(function(g){g.TerraSourceBuildings='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=g.TerraSourceBuildings;})(globalThis);\n')
print('TOTAL',sum(len(r) for r in out.values()),'INACTIVE',len(audit))
for k,v in out['Level_Africa_BM'].items():
 if not v['enabled'] or 'turret' in v:print(k,json.dumps(v,ensure_ascii=False))
