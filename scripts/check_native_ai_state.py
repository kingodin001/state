"""Execute original BotStateSimulator.TraceState over flat source structs."""
import argparse,json,struct,hashlib,random
from pathlib import Path
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--out',required=True);a=p.parse_args();binary=Path(a.binary);sha=hashlib.sha256(binary.read_bytes()).hexdigest();assert sha=='e1ebe8dd23b9219b8e6ae9d646a361c049f6034492bbeda9ebb86ebdeb6edfd4';u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with binary.open('rb')as f:
 for s in ELFFile(f).iter_segments():
  if s['p_type']=='PT_LOAD':
   lo=s['p_vaddr']&~4095;hi=(s['p_vaddr']+s['p_memsz']+4095)&~4095;u.mem_map(lo,hi-lo);u.mem_write(s['p_vaddr'],s.data())
B=0x10000000;u.mem_map(B,0x400000);END=B+0x90000;P=lambda fmt,*v:struct.pack('<'+fmt,*v);get=lambda at,fmt:struct.unpack('<'+fmt,u.mem_read(at,struct.calcsize('<'+fmt)))
u.reg_write(UC_ARM64_REG_TPIDR_EL0,B+0x50000);u.mem_write(B+0x50028,P('Q',0x12345678))
u.mem_write(0x76d67f8,P('Q',B+0x51000));u.mem_write(B+0x510e4,P('I',1))
from collections import deque
history=deque(maxlen=15)
def ret():u.reg_write(UC_ARM64_REG_PC,u.reg_read(UC_ARM64_REG_LR))
def hook(uc,at,size,data):
 history.append(hex(at))
 if at in [0x35280c0,0x3528240,0x3528064]:ret()
 elif at==0x720adc0:
  dest=uc.reg_read(UC_ARM64_REG_X0);source=uc.reg_read(UC_ARM64_REG_X1);n=uc.reg_read(UC_ARM64_REG_X2);uc.mem_write(dest,bytes(uc.mem_read(source,n)));ret()
u.hook_add(UC_HOOK_CODE,hook)
def info(d):return P('ifi3fii',d['owner'],d['rate'],d['limit'],d['speed'],d['delay'],d['width'],d['wave'],d['burst'])
def building(d):return P('ii2f',d['id'],d['owner'],*d['position'])+info(d['info'])+P('3f',d.get('weight',1),d['population'],d.get('action',0))
def group(d):return P('iif i2fi2f'.replace(' ',''),d.get('simulation',1),d['owner'],d.get('created',0),d['source'],*d['from'],d['target'],*d['to'])+info(d['info'])+P('fii f'.replace(' ',''),d.get('factor',1),d.get('amount',0),d['remaining'],d.get('last',0))
def readstate(n,m):
 bs=[];gs=[]
 for i in range(n):
  row=B+0x2020+i*60;bs.append({'id':get(row,'i')[0],'owner':get(row+4,'i')[0],'population':get(row+52,'f')[0],'action':get(row+56,'f')[0],'infoOwner':get(row+16,'i')[0]})
 for i in range(m):
  row=B+0x4020+i*84;gs.append({'owner':get(row+4,'i')[0],'amount':get(row+72,'i')[0],'remaining':get(row+76,'i')[0],'last':get(row+80,'f')[0]})
 return {'buildings':bs,'groups':gs,'time':get(B+0x102c,'f')[0]}
def run(case):
 bs=case['buildings'];gs=case['groups'];n=len(bs);m=len(gs);u.mem_write(B+0x1000,b'\0'*0x100);u.mem_write(B+0x2000,b'\0'*0x1000);u.mem_write(B+0x4000,b'\0'*0x4000);u.mem_write(B+0x1000+0x10,P('i',m));u.mem_write(B+0x1000+0x18,P('Q',B+0x4000));u.mem_write(B+0x1000+0x20,P('Q',B+0x2000));u.mem_write(B+0x1000+0x28,P('if',n,0));u.mem_write(B+0x2018,P('Q',n));u.mem_write(B+0x4018,P('Q',160));
 for i,b in enumerate(bs):u.mem_write(B+0x2020+i*60,building(b))
 for i,g in enumerate(gs):u.mem_write(B+0x4020+i*84,group(g))
 u.mem_write(B+0x800,P('Q',B+0x1000));u.mem_write(B+0x900,P('iB',10,case.get('intersections',False)));out=[]
 def call(entry,regs):
  u.reg_write(UC_ARM64_REG_SP,B+0xe0000);u.reg_write(UC_ARM64_REG_LR,END)
  for reg,value in regs.items():u.reg_write(reg,value)
  try:u.emu_start(entry,END,count=100000)
  except Exception as e:raise RuntimeError('PC='+hex(u.reg_read(UC_ARM64_REG_PC))+' trace='+str(list(history)))from e
  assert u.reg_read(UC_ARM64_REG_PC)==END
 if 'command' in case:
  cmd=case['command'];u.mem_write(B+0x100,P('i',cmd.get('type',2))+b'\0'*4+P('QiiB',B+0x200,len(cmd['sources']),cmd['target'],cmd.get('partial',False))+b'\0'*3+P('f',1))
  u.mem_write(B+0x218,P('Q',len(cmd['sources'])))
  for i,source in enumerate(cmd['sources']):u.mem_write(B+0x220+i*4,P('i',source))
  call(0x3837e18,{UC_ARM64_REG_X0:B+0x1000,UC_ARM64_REG_X1:B+0x100})
  m=get(B+0x1010,'i')[0];case['afterCommand']=readstate(n,m)
 for _ in range(case['steps']):
  u.reg_write(UC_ARM64_REG_SP,B+0xe0000);u.reg_write(UC_ARM64_REG_LR,END);u.reg_write(UC_ARM64_REG_X0,1);u.reg_write(UC_ARM64_REG_X1,0);u.reg_write(UC_ARM64_REG_X2,B+0x800);u.reg_write(UC_ARM64_REG_X3,B+0x900);u.reg_write(UC_ARM64_REG_S0,struct.unpack('<I',P('f',case['dt']))[0])
  try:u.emu_start(0x38383c8,END,count=100000)
  except Exception as e:raise RuntimeError('PC='+hex(u.reg_read(UC_ARM64_REG_PC))+' trace='+str(list(history)))from e
  assert u.reg_read(UC_ARM64_REG_PC)==END;row=readstate(n,m)
  if 'command' in case:
   call(0x3838120,{UC_ARM64_REG_X0:1,UC_ARM64_REG_X1:B+0x800,UC_ARM64_REG_X2:B+0x100,UC_ARM64_REG_S0:struct.unpack('<I',P('f',row['time']))[0]});row['goalReached']=bool(u.reg_read(UC_ARM64_REG_X0))
  out.append(row)
 return out
one={'owner':1,'rate':1,'limit':50,'speed':3,'delay':.25,'width':.2,'wave':5,'burst':5};two={**one,'owner':2,'rate':2};zero={**one,'owner':0,'rate':0};cases=[]
for population in [10,30,100]:
 for owner in [0,2]:
  for dt in [.25,.5,1]:
   c={'dt':dt,'steps':12,'buildings':[{'id':0,'owner':1,'position':[0,0],'population':population,'info':one},{'id':1,'owner':owner,'position':[5,0],'population':15,'info':two if owner else zero}],'groups':[{'owner':1,'source':0,'from':[0,0],'target':1,'to':[5,0],'info':one,'remaining':population}]};c['expected']=run(c);cases.append(c)
from copy import deepcopy
for pop in [1,15,30,151,1000]:
 for partial in [False,True]:
  for dt in [.25,.5,1]:
   c=deepcopy(cases[0]);c.pop('expected',None);c['dt']=dt;c['buildings'][0]['population']=pop;c['buildings'][0]['info']['burst']=150;c['groups']=[];c['command']={'sources':[0],'target':1,'partial':partial};c['expected']=run(c);cases.append(c)
# Counterflow and three-way intersections, including pending groups, test order
# and the native width-based distance test rather than the physical collision API.
rng=random.Random(21021)
for i in range(96):
 c=deepcopy(cases[0]);c.pop('expected',None);c['intersections']=True;c['dt']=[.25,.5,1][i%3];c['groups']=[]
 for j in range(2+i%2):
  start=[rng.uniform(-3,3),rng.uniform(-3,3)];end=[rng.uniform(-3,3),rng.uniform(-3,3)];owner=j+1
  c['groups'].append({'owner':owner,'source':0,'from':start,'target':1,'to':end,'info':{**one,'owner':owner,'width':.2+i%4*.2},'created':-.2,'remaining':0,'amount':rng.randrange(1,30)})
 c['expected']=run(c);cases.append(c)
# Multi-source orders, defence, fractional populations and replacement of a
# simulated group exercise source cancellation and array order as well.
for i in range(24):
 c=deepcopy(cases[20]);c['buildings'][0]['population']=20+i+.75;c['buildings'][1]['owner']=i%3;c['buildings'][1]['info']={**one,'owner':i%3,'rate':i%3};c['buildings'].append({**deepcopy(c['buildings'][0]),'id':2,'position':[1,2],'population':10+i});c['command']['sources']=[0,2];c['groups']=[{'owner':1,'source':0,'from':[0,0],'target':2,'to':[1,2],'info':one,'remaining':10,'amount':5}];c['expected']=run(c);cases.append(c)
Path(a.out).write_text(json.dumps({'sourceSha256':sha,'rva':'0x38343C8','cases':cases},indent=2)+'\n');print('Executed',len(cases),'native AI timelines')
