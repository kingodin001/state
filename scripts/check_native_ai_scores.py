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
def state(base,count,forces,weights=None):
 u.mem_write(base,b'\0'*0x1000);u.mem_write(base+0x18,P('QQif',base+0x200,base+0x300,count,0));u.mem_write(base+0x318,P('Q',count))
 for i in range(count):
  u.mem_write(base+0x320+i*60,P('ii',i,1));u.mem_write(base+0x350+i*60,P('fff',weights[i] if weights else 1,forces/count,0))
 return base
rng=random.Random(21022);scores=[];interests=[]
for i in range(120):
 c={'before':{'forces':rng.choice([0,.5,10,100]),'buildings':rng.randrange(1,5)},'after':{'forces':rng.randrange(0,200),'buildings':rng.randrange(1,6)},'settings':{'_forcesBalanceFactor':rng.choice([0,.1,1]),'_buildingsBalanceFactor':rng.choice([0,.2,1]),'_goalReachPenaltyPercent':rng.choice([0,20,50])},'reached':rng.choice([-1,0,.5,2,7]),'expected':bool(i%2)}
 state(B+0x1000,c['before']['buildings'],c['before']['forces']);state(B+0x3000,c['after']['buildings'],c['after']['forces']);u.mem_write(B+0x800,P('QQ',B+0x1000,B+0x3000));u.mem_write(B+0x7000,b'\0'*0x80);s=c['settings'];u.mem_write(B+0x7018,P('fff',.5,s['_forcesBalanceFactor'],s['_buildingsBalanceFactor']));u.mem_write(B+0x7028,P('f',s['_goalReachPenaltyPercent']))
 c['score']=call(0x3864eb8,{UC_ARM64_REG_X0:0,UC_ARM64_REG_X1:1,UC_ARM64_REG_X2:B+0x7000,UC_ARM64_REG_X3:B+0x800,UC_ARM64_REG_X4:B+0x808,UC_ARM64_REG_X5:int(c['expected'])},[c['reached']]);scores.append(c)
for i in range(80):
 weights=[rng.choice([0,.1,.5,1,2,4])for _ in range(4)];state(B+0x1000,4,10,weights);u.mem_write(B+0x800,P('Q',B+0x1000));sources=[0,1]if i%2 else[0];u.mem_write(B+0x7218,P('Q',len(sources)));u.mem_write(B+0x7220,P('i'*len(sources),*sources));mult=call(0x383438c,{UC_ARM64_REG_X0:0,UC_ARM64_REG_X1:B+0x800,UC_ARM64_REG_X2:B+0x7200,UC_ARM64_REG_X3:len(sources),UC_ARM64_REG_X4:3});score=rng.choice([-2,-.1,0,.1,1]);factor=rng.choice([.5,1,2]);result=call(0x3837490,{},[score,factor,mult]);interests.append({'weights':weights,'sources':sources,'target':3,'multiplier':mult,'score':score,'factor':factor,'expected':result})
Path(a.out).write_text(json.dumps({'sourceSha256':sha,'scores':scores,'interests':interests},separators=(',',':'))+'\n');print('Executed',len(scores)+len(interests),'native scoring cases')
