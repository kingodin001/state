"""Execute FighterStacksDistributor with mocked CLR list allocation/access/sort only."""
import argparse,json,struct,hashlib
from pathlib import Path
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--out',required=True);a=p.parse_args();binary=Path(a.binary);sha=hashlib.sha256(binary.read_bytes()).hexdigest();assert sha=='e1ebe8dd23b9219b8e6ae9d646a361c049f6034492bbeda9ebb86ebdeb6edfd4';u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with binary.open('rb') as f:
 for s in ELFFile(f).iter_segments():
  if s['p_type']=='PT_LOAD':
   start=s['p_vaddr']&~4095;end=(s['p_vaddr']+s['p_memsz']+4095)&~4095;u.mem_map(start,end-start);u.mem_write(s['p_vaddr'],s.data())
B=0x10000000;u.mem_map(B,0x400000);END=B+0x90000;pack=lambda fmt,*v:struct.pack('<'+fmt,*v);read=lambda ptr,fmt:struct.unpack('<'+fmt,u.mem_read(ptr,struct.calcsize('<'+fmt)))
for cell in [0x76d67f8,0x76e1a48]:u.mem_write(cell,pack('Q',B+0x50000))
u.mem_write(B+0x500e4,pack('I',1));u.mem_write(B+0x500b8,pack('Q',B+0x51000));u.mem_write(B+0x51008,pack('Q',B+0x52000));cursor=B+0x100000
ret=lambda: u.reg_write(UC_ARM64_REG_PC,u.reg_read(UC_ARM64_REG_LR))
def values(obj):
 arr=read(obj+0x10,'Q')[0];n=read(obj+0x18,'i')[0];return list(read(arr+0x20,'i'*n)) if n else []
def setvalues(obj,rows):
 arr=read(obj+0x10,'Q')[0];u.mem_write(obj+0x18,pack('i',len(rows)))
 if rows:u.mem_write(arr+0x20,pack('i'*len(rows),*rows))
from collections import deque
history=deque(maxlen=160)
def hook(uc,at,size,ctx):
 history.append(hex(at))
 global cursor
 x0=uc.reg_read(UC_ARM64_REG_X0);w0=uc.reg_read(UC_ARM64_REG_W0);w1=uc.reg_read(UC_ARM64_REG_W1);w2=uc.reg_read(UC_ARM64_REG_W2)
 if at in [0x35280c0,0x3528064,0x3528240,0x57433a0]:ret()
 elif at==0x352835c:obj=cursor;cursor+=0x10000;u.mem_write(obj,b'\0'*0x100);u.mem_write(obj+0x10,pack('Q',obj+0x100));u.mem_write(obj+0x118,pack('i',1024));uc.reg_write(UC_ARM64_REG_X0,obj);ret()
 elif at==0x4661e34:ret()
 elif at==0x46623cc:uc.reg_write(UC_ARM64_REG_W0,values(x0)[w1]&0xffffffff);ret()
 elif at==0x4662420:rows=values(x0);rows[w1]=w2;setvalues(x0,rows);ret()
 elif at==0x46626c4:setvalues(x0,values(x0)+[w1]);ret()
 elif at==0x4664164:setvalues(x0,sorted(values(x0),reverse=True));ret()
 elif at==0x61de4ec:uc.reg_write(UC_ARM64_REG_W0,min(w0,w1));ret()
u.hook_add(UC_HOOK_CODE,hook)
cases=[]
for n in [1,2,4,7,20,149,150,151,200,999,10000,1000000]:
 for cap,base in [(150,1),(150,2),(150,8),(5,1),(5,4),(5,64)]:
  cursor=B+0x100000;u.reg_write(UC_ARM64_REG_SP,B+0x80000);u.reg_write(UC_ARM64_REG_LR,END);u.reg_write(UC_ARM64_REG_X0,B+0x60000);u.reg_write(UC_ARM64_REG_W1,n);u.reg_write(UC_ARM64_REG_W2,cap);u.reg_write(UC_ARM64_REG_W3,base)
  try:u.emu_start(0x37ff634,END,count=300000)
  except Exception as e:raise RuntimeError('PC='+hex(u.reg_read(UC_ARM64_REG_PC))+' case='+str((n,cap,base))+' trace='+str(list(history)))from e
  assert u.reg_read(UC_ARM64_REG_PC)==END;expected=values(u.reg_read(UC_ARM64_REG_X0));assert sum(expected)==n and len(expected)<=cap
  cases.append({'amount':n,'cap':cap,'base':base,'expected':expected})
Path(a.out).write_text(json.dumps({'sourceSha256':sha,'rva':'0x37FB634','cases':cases},indent=2)+'\n');print('Executed',len(cases),'native stack distributions')
