"""Original tactical subdivisions over public-domain Natural Earth coastlines."""
import math, random
from shapely.geometry import shape, MultiPolygon, Point, MultiPoint
from shapely.ops import voronoi_diagram

WORLDS=[
 ('Madagascar','Алый остров',10),('Italy','Солнечный полуостров',11),('Japan','Восточный рассвет',12),
 ('United Kingdom','Туманный рубеж',12),('India','Долина махараджей',14),('Australia','Красный континент',15),
 ('Brazil','Изумрудные земли',16),('Mexico','Золотая граница',12),('France','Лазурный фронт',12),
 ('Germany','Стальной рубеж',14),('Turkey','Врата востока',12),('Indonesia','Островной дозор',11),
 ('South Korea','Нефритовый берег',10),('Saudi Arabia','Пески империи',13),('Greenland','Полярная корона',14)
]

def add_worlds(features):
 byname={f['properties']['ADMIN']:f for f in features};result=[]
 for wi,(name,title,count) in enumerate(WORLDS):
  g=shape(byname[name]['geometry'])
  if isinstance(g,MultiPolygon):g=max(g.geoms,key=lambda p:p.area)
  g=g.simplify(.035,preserve_topology=True)
  xmin,ymin,xmax,ymax=g.bounds;k=math.cos(math.radians((ymin+ymax)/2));w=(xmax-xmin)*k;h=ymax-ymin;scale=1000/max(w,h)
  rand=random.Random(6373+wi*971);points=[];gap=math.sqrt(g.area/count)*.66;tries=0
  while len(points)<count:
   tries+=1
   if tries%3000==0:gap*=.87
   p=Point(rand.uniform(xmin,xmax),rand.uniform(ymin,ymax))
   if g.contains(p) and all(p.distance(q)>=gap for q in points):points.append(p)
  cells=voronoi_diagram(MultiPoint(points),envelope=g.envelope.buffer(max(xmax-xmin,ymax-ymin)))
  cells=sorted((c.intersection(g) for c in cells.geoms),key=lambda c:(round(c.centroid.y,6),c.centroid.x))
  regions=[]
  def tr(x,y):return [round((x-xmin)*k*scale,2),round((ymax-y)*scale,2)]
  for i,c in enumerate(cells):
   if c.is_empty:continue
   if isinstance(c,MultiPolygon):c=max(c.geoms,key=lambda p:p.area)
   c=c.simplify(.012,preserve_topology=True);p=c.representative_point()
   regions.append(dict(id=len(regions),name=f'Сектор {len(regions)+1}',poly=[tr(x,y) for x,y in list(c.exterior.coords)[:-1]],center=tr(p.x,p.y),owner=0,units=7,kind='normal'))
  regions[0]['owner']=1;regions[-1]['owner']=2;regions[0]['units']=18;regions[-1]['units']=16
  result.append(dict(name=title,subtitle=name,width=round(w*scale,2),height=round(h*scale,2),regions=regions,seed=6+wi,cap=50,reward=125,aiInterval=3.8,enemyRate=.75))
 return result
