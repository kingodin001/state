"""Oracle for the recovered ARM64 group-to-building arrival arithmetic.
Requires the user's State.io 4.4.2 ARM64 libil2cpp.so, Unicorn, and its known hash.
No native binary is distributed with this project.
"""
import argparse,hashlib,json,struct
from pathlib import Path
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
p=argparse.ArgumentParser();p.add_argument('binary');p.add_argument('--out',required=True);a=p.parse_args();binary=Path(a.binary).read_bytes();assert hashlib.sha256(binary).hexdigest()=='e1ebe8dd23b9219b8e6ae9d646a361c049f6034492bbeda9ebb86ebdeb6edfd4'
pack=lambda fmt,*xs:struct.pack('<'+fmt,*xs)
def run(n,wave,factor,step,delay):
 u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
 for page,size in [(0x3838000,0x1000),(0x720a000,0x1000),(0x100000,0x10000),(0x200000,0x10000),(0x300000,0x1000)]:u.mem_map(page,size)
 u.mem_write(0x383868c,binary[0x383468c:0x38348a0]);state=0x100100;groups=0x101000;buildings=0x102000;g=groups+32;r=buildings+32
 u.mem_write(state+16,pack('I',1));u.mem_write(state+24,pack('Q',groups));u.mem_write(state+32,pack('Q',buildings));u.mem_write(state+40,pack('I',1));u.mem_write(groups+24,pack('I',1));u.mem_write(buildings+24,pack('I',1));u.mem_write(g+4,pack('I',2));u.mem_write(g+24,pack('I',0));u.mem_write(g+52,pack('f',delay));u.mem_write(g+60,pack('I',wave));u.mem_write(g+68,pack('f',factor));u.mem_write(g+72,pack('I',n));u.mem_write(r+4,pack('I',2));u.mem_write(r+52,pack('f',10))
 def hook(uc,at,size,ctx):
  if at==0x720adc0:
   dst,src,count=[uc.reg_read(x)for x in [UC_ARM64_REG_X0,UC_ARM64_REG_X1,UC_ARM64_REG_X2]];uc.mem_write(dst,bytes(uc.mem_read(src,count)));uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
  elif at==0x3838c0c:
   uc.reg_write(UC_ARM64_REG_S0,0x3f800000);uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
 u.hook_add(UC_HOOK_CODE,hook);u.reg_write(UC_ARM64_REG_X1,state);u.reg_write(UC_ARM64_REG_S0,0x41200000);u.reg_write(UC_ARM64_REG_S1,struct.unpack('<I',pack('f',step))[0]);u.reg_write(UC_ARM64_REG_SP,0x20fff0);u.reg_write(UC_ARM64_REG_LR,0x300000);u.emu_start(0x383868c,0x300000,count=20000);left=struct.unpack('<I',u.mem_read(g+72,4))[0];return n-left
rows=[]
for n,wave,factor,step,delay in [(1,5,1,.025,.25),(5,5,1,.125,.25),(17,5,1,.25,.25),(17,5,2,.5,.25),(100,5,3,.1,.25),(100,5,50,.25,.25),(100,5,1,.5,.25),(7,5,1,1,.25)]:rows.append({'amount':n,'maxWave':wave,'factor':factor,'step':step,'delay':delay,'arrived':run(n,wave,factor,step,delay)})
Path(a.out).write_text(json.dumps({'nativeRawOffset':'0x383468c','binarySha256':hashlib.sha256(binary).hexdigest(),'rows':rows},indent=2)+'\n');print('Verified',len(rows),'native ARM64 arrival cases')
