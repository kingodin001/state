"""Export only the source's core ranks, free-item rows and bot debut profiles."""
import argparse,json
from pathlib import Path
from reference_reader import Reader,load_data
p=argparse.ArgumentParser();p.add_argument('--data',required=True);p.add_argument('--dlls',required=True);p.add_argument('--out',required=True);a=p.parse_args();r=Reader(a.dlls);out={}
for o in load_data(a.data).objects:
 if o.type.name!='MonoBehaviour':continue
 try:
  kind=o.read(check_read=False).m_Script.read().m_ClassName
  if kind not in ['CoreUpgradesConfig','ExtraItemsConfig','BotDebutPresetConfig','BotDebutProfileConfig','WaitAndAttackDebutStepActionConfig','WaitSecondsDebutStepActionConfig']:continue
  d=r.read(o);out[str(o.path_id)]={'kind':kind,**{k:v for k,v in d.items() if k not in ['m_GameObject','m_Enabled','m_Script']}}
 except (ValueError,AttributeError):continue
Path(a.out).write_text('(function(g){g.TerraSourceExtra='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=g.TerraSourceExtra;})(globalThis);\n')
print('Exported',len(out),'game-only configurations')
