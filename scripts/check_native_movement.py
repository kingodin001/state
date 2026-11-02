"""Execute source ARM64 PathHolder and movement arithmetic with mocked Unity transforms.
Only explicit Unity access/allocation and libm calls are replaced, never game math.
"""
import argparse,hashlib,json,math,struct
from pathlib import Path
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--out',required=True);a=p.parse_args();binary=Path(a.binary);sha=hashlib.sha256(binary.read_bytes()).hexdigest();assert sha=='e1ebe8dd23b9219b8e6ae9d646a361c049f6034492bbeda9ebb86ebdeb6edfd4'
u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with binary.open('rb')as fp:
 for s in ELFFile(fp).iter_segments():
  if s['p_type']=='PT_LOAD':
   start=s['p_vaddr']&~4095;end=(s['p_vaddr']+s['p_memsz']+4095)&~4095;u.mem_map(start,end-start);u.mem_write(s['p_vaddr'],s.data())
B=0x10000000;END=B+0x90000;u.mem_map(B,0x100000);pack=lambda f,*v:struct.pack('<'+f,*v)
def setf(reg,v):u.reg_write(reg,struct.unpack('<I',pack('f',v))[0])
def getd(reg):return struct.unpack('<d',pack('Q',u.reg_read(reg)))[0]
def retur():u.reg_write(UC_ARM64_REG_PC,u.reg_read(UC_ARM64_REG_LR))
from collections import deque
history=deque(maxlen=16)
positions={};array=B+0x10000
u.mem_write(0x76d67f8,pack('Q',B+0x50000));u.mem_write(B+0x50000,pack('Q',B+0x51000));u.mem_write(B+0x510e4,pack('I',1))
def hook(uc,at,size,user):
 history.append(at)
 if at==0x35280c0:retur()
 elif at==0x6dde8cc:retur() # Component.transform: synthetic object is its transform.
 elif at==0x6df4460:
  x,y=positions[uc.reg_read(UC_ARM64_REG_X0)];setf(UC_ARM64_REG_S0,x);setf(UC_ARM64_REG_S1,y);setf(UC_ARM64_REG_S2,0);retur()
 elif at==0x35281b0:
  n=uc.reg_read(UC_ARM64_REG_W1);uc.mem_write(array,b'\0'*1024);uc.mem_write(array+0x18,pack('I',n));uc.reg_write(UC_ARM64_REG_X0,array);retur()
 elif at==0x720ae60:
  v=getd(UC_ARM64_REG_D0);uc.mem_write(uc.reg_read(UC_ARM64_REG_X0),pack('d',math.sin(v)));uc.mem_write(uc.reg_read(UC_ARM64_REG_X1),pack('d',math.cos(v)));retur()
 elif at==0x720ae30:
  fraction,whole=math.modf(getd(UC_ARM64_REG_D0));uc.mem_write(uc.reg_read(UC_ARM64_REG_X0),pack('d',whole));uc.reg_write(UC_ARM64_REG_D0,struct.unpack('<Q',pack('d',fraction))[0]);retur()
 elif at==0x720aed0:
  v=math.atan2(getd(UC_ARM64_REG_D0),getd(UC_ARM64_REG_D1));uc.reg_write(UC_ARM64_REG_D0,struct.unpack('<Q',pack('d',v))[0]);retur()
u.hook_add(UC_HOOK_CODE,hook)
def run(va,x0,x1=0):
 u.reg_write(UC_ARM64_REG_SP,B+0x80000);u.reg_write(UC_ARM64_REG_LR,END);u.reg_write(UC_ARM64_REG_X0,x0);u.reg_write(UC_ARM64_REG_X1,x1);
 try:u.emu_start(va,END,count=200000)
 except Exception as error:raise RuntimeError('Native PC='+hex(u.reg_read(UC_ARM64_REG_PC))+' trace='+str([hex(x)for x in history])) from error
 assert u.reg_read(UC_ARM64_REG_PC)==END,'Native math did not finish'
paths=[]
for start,end in [((0,0),(5,0)),((1,-2),(2,3)),((10,10),(-3,-8))]:
 for scale in [.2,.33,.6,1]:
  src=B+0x1000;target=B+0x2000;positions[src]=start;positions[target]=end;u.mem_write(src+0x20,pack('4f',1,1,1,1));u.mem_write(src+0x40,pack('f',scale));run(0x3727f38,src,target)
  points=[struct.unpack('<4f',u.mem_read(array+0x20+16*i,16))for i in range(4)]
  for lane in [0,.25,.5,.75,1]:paths.append({'source':list(start),'target':list(end),'scale':scale,'lane':lane,'expected':[[float(x*(1-lane)+z*lane),float(y*(1-lane)+w*lane)]for x,y,z,w in points]})
steps=[]
for start,end in [((0,0),(5,0)),((1,-2),(2,3)),((10,10),(-3,-8))]:
 for speed in [3,6]:
  for dt in [.025,.1,.5]:
   job=B+0x20000;ptrs=[B+0x21000+i*0x100 for i in range(8)];u.mem_write(job,b'\0'*0x100)
   for off,ptr in zip([0,.0+0x10,0x20,0x30,0x48,0x58],ptrs):u.mem_write(job+int(off),pack('Q',ptr))
   u.mem_write(ptrs[0],pack('2f',*start));u.mem_write(ptrs[1],pack('f',0));u.mem_write(ptrs[2],pack('2f',*end));u.mem_write(ptrs[3],pack('f',speed));u.mem_write(job+0x40,pack('2f',10,dt));run(0x37fce5c,job,0);nextpos=list(struct.unpack('<2f',u.mem_read(ptrs[4],8)));steps.append({'source':list(start),'target':list(end),'speed':speed,'dt':dt,'expected':nextpos})
Path(a.out).write_text(json.dumps({'sourceSha256':sha,'pathRva':'0x3723F38','movementRva':'0x37F8E5C','paths':paths,'steps':steps},indent=2)+'\n');print('Executed',len(paths),'native paths and',len(steps),'native motion steps')
