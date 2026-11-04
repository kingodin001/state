"""Execute native Population.TryPopulate with injected clock and owner stats."""
import argparse,hashlib,json,struct
from pathlib import Path
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--out',required=True);a=p.parse_args();sha=hashlib.sha256(Path(a.binary).read_bytes()).hexdigest();assert sha=='e1ebe8dd23b9219b8e6ae9d646a361c049f6034492bbeda9ebb86ebdeb6edfd4';u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with open(a.binary,'rb') as fp:
 for s in ELFFile(fp).iter_segments():
  if s['p_type']=='PT_LOAD':
   va=s['p_vaddr'];start=va&~4095;end=(va+s['p_memsz']+4095)&~4095;u.mem_map(start,end-start);u.mem_write(va,s.data())
B=0x10000000;u.mem_map(B,0x100000);END=B+0x90000;P=lambda f,*v:struct.pack('<'+f,*v);get=lambda at,f:struct.unpack('<'+f,u.mem_read(at,struct.calcsize('<'+f)))[0];values={}
def ret():u.reg_write(UC_ARM64_REG_PC,u.reg_read(UC_ARM64_REG_LR))
def sf(v):u.reg_write(UC_ARM64_REG_S0,struct.unpack('<I',P('f',v))[0])
def hook(uc,at,size,data):
 if at in [0x35280c0,0x3528240]:ret()
 elif at in [0x382a93c,0x6df0900]:sf(values['rate' if at==0x382a93c else 'now']);ret()
 elif at==0x382a998:u.reg_write(UC_ARM64_REG_X0,values['limit']);ret()
u.hook_add(UC_HOOK_CODE,hook)
u.mem_write(0x76d4b00,P('Q',B+0x6000));u.mem_write(B+0x60b8,P('Q',B+0x6100));u.mem_write(B+0x6100,P('I',1))
u.mem_write(0x76d67f8,P('Q',B+0x6200));u.mem_write(B+0x62e4,P('I',1))
def run(c):
 obj=B+0x1000;u.mem_write(obj,b'\0'*0x100);u.mem_write(obj+0x30,P('Q',B+0x2000));u.mem_write(obj+0x38,P('fiff',-1,c['start'],c['block'],c['carry']));u.mem_write(obj+0x54,P('B',1));values.update(rate=c['rate'],limit=c['limit']);out=[];now=0
 for i in range(c['steps']):
  now=struct.unpack('<f',P('f',now+c['dt']))[0];values['now']=now
  if i in c.get('blocks',[]):u.mem_write(obj+0x40,P('f',now))
  u.reg_write(UC_ARM64_REG_SP,B+0x80000);u.reg_write(UC_ARM64_REG_LR,END);u.reg_write(UC_ARM64_REG_X0,obj);u.emu_start(0x37289cc,END,count=20000);assert u.reg_read(UC_ARM64_REG_PC)==END
  out.append({'time':now,'population':get(obj+0x3c,'i'),'carry':get(obj+0x44,'f')})
 return out
cases=[]
for rate in [0,1,2.52,18.5,1000]:
 for dt in [.025,.1,.5,1]:
  for start in [0,19,30]:
   c={'rate':rate,'dt':dt,'start':start,'limit':20,'block':0,'carry':.3,'blocks':[10,11,12],'steps':40};c['expected']=run(c);cases.append(c)
Path(a.out).write_text(json.dumps({'sourceSha256':sha,'rva':'0x37249CC','injected':'clock, owner spawn-rate and limit getters only','cases':cases},indent=2)+'\n');print('Executed',len(cases),'native production timelines')
