"""Execute the APK's ARM64 snapshot collision job; only runtime class-init is mocked."""
import argparse,json,struct,hashlib,random
from pathlib import Path
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import UC_ARM64_REG_SP,UC_ARM64_REG_LR,UC_ARM64_REG_PC,UC_ARM64_REG_X0,UC_ARM64_REG_X1
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--out',required=True);a=p.parse_args();binary=Path(a.binary);sha=hashlib.sha256(binary.read_bytes()).hexdigest();assert sha=='e1ebe8dd23b9219b8e6ae9d646a361c049f6034492bbeda9ebb86ebdeb6edfd4';u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with binary.open('rb') as f:
 for s in ELFFile(f).iter_segments():
  if s['p_type']=='PT_LOAD':
   start=s['p_vaddr']&~4095;end=(s['p_vaddr']+s['p_memsz']+4095)&~4095;u.mem_map(start,end-start);u.mem_write(s['p_vaddr'],s.data())
B=0x10000000;u.mem_map(B,0x100000);END=B+0x90000
pack=lambda fmt,*v:struct.pack('<'+fmt,*v)
u.mem_write(0x76d67f8,pack('Q',B+0x50000));u.mem_write(B+0x50000,pack('Q',B+0x51000));u.mem_write(B+0x510e4,pack('I',1))
def hook(uc,at,size,context):
 if at==0x35280c0:uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
u.hook_add(UC_HOOK_CODE,hook)
def run(rows):
 n=len(rows);ptr=[B+0x1000+i*0x1000 for i in range(7)];u.mem_write(B,b'\0'*0x100)
 for off,at in zip([0,.0+0x10,0x20,0x30,0x40,0x50,0x60],ptr):u.mem_write(B+int(off),pack('Qi',at,n));u.mem_write(at,b'\0'*0x1000)
 u.mem_write(ptr[0],pack('i'*n,*[r['owner'] for r in rows]));u.mem_write(ptr[1],pack('f'*(2*n),*[v for r in rows for v in [r['x'],r['y']]]));u.mem_write(ptr[2],pack('f'*n,*[r['radius'] for r in rows]));u.mem_write(ptr[3],pack('i'*n,*[r['amount'] for r in rows]));result=[]
 for i in range(n):
  u.reg_write(UC_ARM64_REG_SP,B+0x80000);u.reg_write(UC_ARM64_REG_LR,END);u.reg_write(UC_ARM64_REG_X0,B);u.reg_write(UC_ARM64_REG_X1,i);u.emu_start(0x380503c,END,count=10000);assert u.reg_read(UC_ARM64_REG_PC)==END
 for i in range(n):result.append({'hit':bool(u.mem_read(ptr[4]+i,1)[0]),'killer':struct.unpack('<i',u.mem_read(ptr[5]+4*i,4))[0],'amount':struct.unpack('<i',u.mem_read(ptr[6]+4*i,4))[0]})
 return result
rng=random.Random(20020);inputs=[]
for n in [1,2,3,5,12,30]:
 for scale in [.1,.5,2,10]:inputs.append([{'owner':1+i%3,'x':rng.uniform(-scale,scale),'y':rng.uniform(-scale,scale),'radius':rng.choice([.1,.25,.5]),'amount':rng.choice([1,2,4,16])}for i in range(n)])
inputs.extend([[{'owner':1,'x':0,'y':0,'radius':1,'amount':3},{'owner':2,'x':d,'y':0,'radius':1,'amount':5}]for d in [1.999,2,2.001]])
cases=[{'rows':rows,'expected':run(rows)}for rows in inputs];Path(a.out).write_text(json.dumps({'sourceSha256':sha,'jobRva':'0x380103c','fighterPrefabCollisionRadius':.25,'cases':cases},indent=2)+'\n');print('Executed',len(cases),'native collision snapshots')
