"""Native V4 scoring and command-interest oracle; no game functions stubbed."""
import argparse,json,struct,hashlib,math,random
from pathlib import Path
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--out',required=True);a=p.parse_args();binary=Path(a.binary);sha=hashlib.sha256(binary.read_bytes()).hexdigest();assert sha=='e1ebe8dd23b9219b8e6ae9d646a361c049f6034492bbeda9ebb86ebdeb6edfd4';u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with binary.open('rb')as f:
 for s in ELFFile(f).iter_segments():
  if s['p_type']=='PT_LOAD':
   lo=s['p_vaddr']&~4095;hi=(s['p_vaddr']+s['p_memsz']+4095)&~4095;u.mem_map(lo,hi-lo);u.mem_write(s['p_vaddr'],s.data())
B=0x10000000;u.mem_map(B,0x100000);END=B+0x90000;P=lambda f,*v:struct.pack('<'+f,*v)
def ret():u.reg_write(UC_ARM64_REG_PC,u.reg_read(UC_ARM64_REG_LR))
def fget(r,fmt='f'):return struct.unpack('<'+fmt,struct.pack('<I' if fmt=='f' else '<Q',u.reg_read(r)))[0]
def fset(r,n,fmt='f'):u.reg_write(r,struct.unpack('<I' if fmt=='f' else '<Q',P(fmt,n))[0])
def hook(uc,at,size,data):
 if at in [0x35280c0,0x3528240]:ret()
 elif at==0x61deb78:fset(UC_ARM64_REG_D0,math.pow(fget(UC_ARM64_REG_D0,'d'),fget(UC_ARM64_REG_D1,'d')),'d');ret()
 elif at==0x720aee0:fset(UC_ARM64_REG_D0,math.exp(fget(UC_ARM64_REG_D0,'d')),'d');ret()
u.hook_add(UC_HOOK_CODE,hook)
u.mem_write(0x76d67f8,P('Q',B+0x6000));u.mem_write(B+0x60e4,P('I',1))
def call(at,regs={},floats=[]):
 u.reg_write(UC_ARM64_REG_SP,B+0x80000);u.reg_write(UC_ARM64_REG_LR,END)
 for r,v in regs.items():u.reg_write(r,v)
 for i,v in enumerate(floats):fset(UC_ARM64_REG_S0+i,v)
 u.emu_start(at,END,count=100000);assert u.reg_read(UC_ARM64_REG_PC)==END;return fget(UC_ARM64_REG_S0)

def state(base,data):
 u.mem_write(base,b'\0'*0x1400);rs=data['regions'];gs=data['groups'];u.mem_write(base+0x10,P('i',len(gs)));u.mem_write(base+0x18,P('QQif',base+0x200,base+0x300,len(rs),0));u.mem_write(base+0x218,P('Q',len(gs)));u.mem_write(base+0x318,P('Q',len(rs)))
 for i,r in enumerate(rs):
  b=base+0x320+i*60;u.mem_write(b,P('ii',i,r['owner']));u.mem_write(b+0x14,P('fi',r['info']['rate'],r['info']['limit']));u.mem_write(b+0x34,P('f',r['units']))
 for i,g in enumerate(gs):
  b=base+0x220+i*84;u.mem_write(b+4,P('i',g['owner']));u.mem_write(b+0x48,P('i',g['n']))
rng=random.Random(22022);scores=[];randoms=[];intervals=[]
def sample_state(n):return {'regions':[{'id':i,'owner':rng.randrange(4),'units':rng.randrange(0,151),'info':{'rate':rng.choice([0,.5,1,3,10]),'limit':rng.randrange(30,151)}}for i in range(n)],'groups':[{'owner':i,'n':rng.randrange(0,80)}for i in range(4)]}
for i in range(240):
 n=rng.randrange(4,12);c={'before':sample_state(n),'after':sample_state(n),'owner':2,'mainEnemy':1,'expected':bool(i%2),'targetOwner':i%4,'targetSpawn':rng.choice([0,.5,1,3,10]),'weights':{k:{j:rng.choice([-2,-1,0,.5,1,3])for j in ['forces','buildings','spawn']}for k in ['mine','main','enemies','neutral']}}
 state(B+0x1000,c['before']);state(B+0x4000,c['after']);u.mem_write(B+0x800,P('QQ',B+0x1000,B+0x4000));u.mem_write(B+0x7000,b'\0'*0x100)
 for j,key in enumerate(['mine','main','enemies','neutral']):u.mem_write(B+0x7024+j*12,P('3f',*(c['weights'][key][f]for f in ['forces','buildings','spawn'])))
 c['score']=call(0x38615c8,{UC_ARM64_REG_X0:0,UC_ARM64_REG_X1:B+0x800,UC_ARM64_REG_X2:B+0x808,UC_ARM64_REG_X3:2,UC_ARM64_REG_X4:1,UC_ARM64_REG_X5:B+0x7000,UC_ARM64_REG_X6:int(c['expected']),UC_ARM64_REG_X7:c['targetOwner']},[c['targetSpawn']]);scores.append(c)
for seed in [0,1,2,53,2147483647,2147483648,4294967295]+[rng.randrange(4294967296)for _ in range(33)]:
 call(0x3835a68,{UC_ARM64_REG_X0:B+0x100,UC_ARM64_REG_X1:seed});c={'seed':seed,'state':struct.unpack('<I',u.mem_read(B+0x110,4))[0],'operations':[]}
 for i in range(30):
  if i%3==0:
   lo,hi=-10,1+i*10;call(0x3835aec,{UC_ARM64_REG_X0:B+0x100,UC_ARM64_REG_X1:lo,UC_ARM64_REG_X2:hi});v=u.reg_read(UC_ARM64_REG_X0)&0xffffffff;v=v if v<2147483648 else v-4294967296;op={'type':'int','min':lo,'max':hi,'expected':v}
  elif i%3==1:
   lo,hi=-1.5,3.1;v=call(0x3835bd4,{UC_ARM64_REG_X0:B+0x100},[lo,hi]);op={'type':'float','min':lo,'max':hi,'expected':v}
  else:op={'type':'next','expected':call(0x3835b78,{UC_ARM64_REG_X0:B+0x100})}
  op['state']=struct.unpack('<I',u.mem_read(B+0x110,4))[0];c['operations'].append(op)
 randoms.append(c)
for n in [-1,0,.0001,.01,.1,.5,1,2,3,10,50,100,1000,100000]:intervals.append({'rate':n,'expected':call(0x38ee4ec,{},[n])})
Path(a.out).write_text(json.dumps({'sourceSha256':sha,'scores':scores,'randoms':randoms,'poisonIntervals':intervals},separators=(',',':'))+'\n');print('Executed',len(scores),'native V5 power scores,',len(randoms),'random streams,',len(intervals),'poison intervals')
