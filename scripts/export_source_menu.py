"""Select main-menu RectTransform/image contracts from the versioned source UI export."""
from pathlib import Path
from zipfile import ZipFile
import json
root=Path(__file__).resolve().parents[1]
with ZipFile(root/'reference-content/ui-layout.zip') as z:raw=z.read('ui-layout.js').decode()
doc=json.JSONDecoder().raw_decode(raw.split('g.TerraSourceUI=',1)[1])[0]
scene=next(s for s in doc['scenes'] if s['name']=='View - MenuView');by={n['id']:n for n in scene['nodes']}
bindings={'menu-duel':'64','menu-league':'688','menu-operations':'3041','quests':'2248','meta-shortcuts':'3188','source-region-progress':'2773'}
selected=set(bindings.values())
for node in list(selected):
 while by[node]['parent']:
  node=by[node]['parent'];selected.add(node)
images={}
for key,node in {'duel':'2344','league':'2024','idle':'1889','rush':'2651','wheel':'1046','wheelPin':'3400','operations':'1718','quests':'708'}.items():
 images[key]=next(c['sprite'] for c in by[node]['components'] if c['kind']=='Image')
data={'scene':scene['name'],'bindings':bindings,'nodes':{k:{t:by[k][t] for t in ['name','parent','rect'] if t in by[k]} for k in sorted(selected)},'images':images,'rightGrid':{'order':['idle','rush','wheel'],'width':178,'height':198,'spacing':36},'source':'State.io 4.4.2 serialized MenuView; runtime visibility is controlled separately'}
out=root/'app/src/main/assets/game/source-menu-data.js';out.write_text('/* Main menu contracts selected from the source UI export. */\n(function(g){g.TerraSourceMenu='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=g.TerraSourceMenu;})(globalThis);\n')
print(len(selected),'menu nodes selected')
