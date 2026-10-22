"""Build simplified public-domain Natural Earth maps; no assets from the reference APK."""
import json, math, urllib.request, hashlib, os
from pathlib import Path
from shapely.geometry import shape, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union
root=Path(__file__).resolve().parents[1]
cache=root/'.cache/maps';cache.mkdir(parents=True,exist_ok=True)
def dataset(name):
 p=cache/name
 if not p.exists():
  url='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'+name
  with urllib.request.urlopen(url,timeout=60) as response: p.write_bytes(response.read())
 return json.loads(p.read_text())['features']
countries=dataset('ne_110m_admin_0_countries.geojson')
states=dataset('ne_110m_admin_1_states_provinces.geojson')
byname={f['properties'].get('ADMIN'):f for f in countries}
byus={f['properties']['name']:f for f in states}
def build(title,subtitle,features,players,seed,cap=50):
 geoms=[]
 for name,f in features:
  g=shape(f['geometry'])
  if isinstance(g,MultiPolygon):g=max(g.geoms,key=lambda p:p.area)
  g=g.simplify(.09,preserve_topology=True)
  geoms.append((name,g))
 bounds=[g.bounds for _,g in geoms];xmin=min(b[0] for b in bounds);xmax=max(b[2] for b in bounds);ymin=min(b[1] for b in bounds);ymax=max(b[3] for b in bounds)
 k=math.cos(math.radians((ymin+ymax)/2));width=(xmax-xmin)*k;height=ymax-ymin;scale=1000/max(width,height)
 regions=[]
 for i,(name,g) in enumerate(geoms):
  coords=list(g.exterior.coords)[:-1];pt=g.representative_point();owner=players.get(name,0)
  def tr(x,y):return [round((x-xmin)*k*scale,2),round((ymax-y)*scale,2)]
  regions.append(dict(id=i,name=name,poly=[tr(x,y) for x,y in coords],center=tr(pt.x,pt.y),owner=owner,units=(18 if owner==1 else 12+seed*2 if owner else 4+(i*7+seed)%9),kind='normal'))
 return dict(name=title,subtitle=subtitle,width=round(width*scale,2),height=round(height*scale,2),regions=regions,seed=seed,cap=cap,reward=80+seed*45,aiInterval=3.8-seed*.39,enemyRate=.62+seed*.11)
def us(names):return [(n,byus[n]) for n in names]
def co(names):return [(n,byname[n]) for n in names]
def grouped(groups):
 return [(name, {'geometry':mapping(unary_union([shape(byname[n]['geometry']) for n in members]))}) for name,members in groups]

levels=[]
levels.append(build('Первый рубеж','Запад • обучение',us(['California','Nevada','Arizona','Utah','Colorado','New Mexico','Oregon']),{'California':1,'Colorado':2},1))
levels.append(build('Большая экспансия','Северная Америка',us(['Washington','Oregon','California','Nevada','Idaho','Montana','Wyoming','Utah','Arizona','Colorado','New Mexico','North Dakota','South Dakota','Nebraska','Kansas','Oklahoma','Texas']),{'California':1,'Montana':2,'Texas':3},2))
levels.append(build('Старый свет','Европа',grouped([
 ('Portugal',['Portugal']),('Spain',['Spain']),('France',['France']),('Belgium',['Belgium','Netherlands']),('Germany',['Germany']),
 ('Denmark',['Denmark']),('Poland',['Poland']),('Czechia',['Czechia','Slovakia']),('Austria',['Austria','Slovenia']),
 ('Switzerland',['Switzerland']),('Italy',['Italy']),('Hungary',['Hungary','Croatia']),('Romania',['Romania','Bulgaria','Republic of Serbia']),('Greece',['Greece'])
]),{'Portugal':1,'Poland':2,'Romania':3},3))
levels.append(build('Сердце континента','Африка',grouped([
 ('Morocco',['Morocco']),('Algeria',['Algeria','Tunisia']),('Libya',['Libya']),('Egypt',['Egypt']),
 ('Mauritania',['Mauritania','Senegal']),('Mali',['Mali','Guinea','Sierra Leone','Liberia']),
 ('Ghana',['Ivory Coast','Ghana','Burkina Faso','Togo','Benin']),('Niger',['Niger']),('Nigeria',['Nigeria']),
 ('Chad',['Chad','Central African Republic']),('Sudan',['Sudan']),('Ethiopia',['Ethiopia','Somalia']),
 ('Democratic Republic of the Congo',['Cameroon','Gabon','Republic of the Congo','Democratic Republic of the Congo']),
 ('Angola',['Angola']),('Zambia',['Zambia','Malawi','Zimbabwe']),('Kenya',['Uganda','Kenya','United Republic of Tanzania']),
 ('Mozambique',['Mozambique']),('Namibia',['Namibia','Botswana']),('South Africa',['South Africa'])
]),{'South Africa':1,'Algeria':2,'Ethiopia':3,'Nigeria':4},4))
levels.append(build('Вершина империи','Азия • финал',grouped([
 ('Turkey',['Turkey','Georgia','Armenia','Azerbaijan']),('Syria',['Syria','Jordan','Israel']),('Iraq',['Iraq']),('Iran',['Iran']),
 ('Saudi Arabia',['Saudi Arabia','Yemen','Oman','United Arab Emirates']),('Kazakhstan',['Kazakhstan']),
 ('Uzbekistan',['Uzbekistan','Turkmenistan']),('Tajikistan',['Tajikistan','Kyrgyzstan']),('Afghanistan',['Afghanistan']),('Pakistan',['Pakistan']),
 ('India',['India','Nepal','Bangladesh','Bhutan']),('China',['China']),('Mongolia',['Mongolia']),('Myanmar',['Myanmar']),
 ('Thailand',['Thailand','Cambodia','Laos','Vietnam']),('South Korea',['South Korea','North Korea'])
]),{'India':1,'China':2,'Saudi Arabia':3,'Kazakhstan':4},5))
# Normal campaigns compensate for three independent opponents and gradual departures.
for li in (3,4):
 levels[li]['enemyRate']=.8
 levels[li]['aiInterval']*=1.25
# Distinct tactical buildings appear only after the controls have been learned.
for li,name,kind in [(2,'Germany','factory'),(3,'Democratic Republic of the Congo','factory'),(3,'Egypt','turret'),(4,'Iran','turret'),(4,'China','factory'),(4,'Afghanistan','fort')]:
 next(r for r in levels[li]['regions'] if r['name']==name)['kind']=kind
for level in levels:
 for r in level['regions']:
  # Place a dot cluster far enough inside the irregular coast.
  p=Polygon(r['poly']);padded=p.buffer(-min(13,math.sqrt(p.area)*.12));pt=(padded if not padded.is_empty else p).representative_point();r['center']=[round(pt.x,2),round(pt.y,2)]
(root/'app/src/main/assets/game/maps.js').write_text('/* Natural Earth public domain (see THIRD_PARTY.md). */\n(function(g){g.TERRA_LEVELS='+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=g.TERRA_LEVELS;})(typeof globalThis!=="undefined"?globalThis:this);\n')
print([(x['name'],len(x['regions'])) for x in levels])
