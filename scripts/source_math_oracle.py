"""Narrow ARM64 arithmetic oracle; no source executable is included in the repo."""
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
B=0x10000000;u.mem_map(B,0x100000);END=B+0x90000;values={}
def hook(uc,address,size,user):
 if address in (0x394b22c,0x3726644):uc.reg_write(UC_ARM64_REG_S0,struct.unpack('<I',struct.pack('<f',values['meta' if address==0x394b22c else 'effective']))[0]);uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
 elif address==0x35280c0:uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
u.hook_add(UC_HOOK_CODE,hook)
def run(va,x0=0,x1=0):
 u.reg_write(UC_ARM64_REG_SP,B+0x80000);u.reg_write(UC_ARM64_REG_LR,END);u.reg_write(UC_ARM64_REG_X0,x0);u.reg_write(UC_ARM64_REG_X1,x1);u.emu_start(va,END,count=20000);return struct.unpack('<f',struct.pack('<I',u.reg_read(UC_ARM64_REG_S0)))[0]
cases=[]
for meta in [1,2,3,4.5,7]:
 for effective in [1,2,3,6,12]:
  for mult in [.5,1,1.5,2]:
   values.update(meta=meta,effective=effective);u.mem_write(B+0x110,struct.pack('<Q',B+0x800));u.mem_write(B+0x4fc,struct.pack('<f',mult));cases.append({'kind':'wave','args':[meta,effective,mult],'expected':run(0x37fe84c,B+0x100,B+0x400)})
cases.append({'kind':'step','args':[],'expected':run(0x37fe8c0)})
for mode in [0,1]:
 for rows in [[(1,1.)],[(1,1.),(11,2.),(21,3.)],[(1,.05),(11,.1)]]:
  for lv in [1,2,5,10,11,12,20,21,30,50]:
   obj=B+0x1000;arr=B+0x2000;u.mem_write(arr,b'\0'*1024);u.mem_write(arr+0x18,struct.pack('<Q',len(rows)));u.mem_write(arr+0x20,b''.join(struct.pack('<if',*r) for r in rows));u.mem_write(obj,struct.pack('<Qi4fif',arr,0,0,0,0,0,mode,10));curve={'_data':[{'_level':l,'_value':v} for l,v in rows],'_extrapolationData':{'ExtrapolationType':0},'_calculationMode':mode,'_baseValue':10};cases.append({'kind':'gain','args':[curve,lv],'expected':run(0x376d688,obj,lv)})
Path(a.out).parent.mkdir(parents=True,exist_ok=True);Path(a.out).write_text(json.dumps({'sourceSha256':sha,'scope':'Selected arithmetic, not full gameplay or AI','cases':cases},separators=(',',':')));print(len(cases),'native cases')
