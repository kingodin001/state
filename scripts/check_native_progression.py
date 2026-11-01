"""Narrow ARM64 arithmetic oracle; no source executable is included in the repo."""
import argparse,hashlib,json,struct,math
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
 elif address==0x720aea0:
  value=struct.unpack('<d',struct.pack('<Q',uc.reg_read(UC_ARM64_REG_D0)))[0];uc.reg_write(UC_ARM64_REG_D0,struct.unpack('<Q',struct.pack('<d',math.log(value)))[0]);uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
 elif address==0x35280c0:uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
u.hook_add(UC_HOOK_CODE,hook)
u.mem_write(0x76d67f8,struct.pack('<Q',B+0x50000));u.mem_write(B+0x50000,struct.pack('<Q',B+0x51000));u.mem_write(B+0x510e4,struct.pack('<I',1));u.mem_write(0x7be1679,b'\x01')
def run(va,x0=0,x1=0):
 u.reg_write(UC_ARM64_REG_SP,B+0x80000);u.reg_write(UC_ARM64_REG_LR,END);u.reg_write(UC_ARM64_REG_X0,x0);u.reg_write(UC_ARM64_REG_X1,x1);
 try:u.emu_start(va,END,count=2000000)
 except Exception as e:raise RuntimeError('Native failure PC='+hex(u.reg_read(UC_ARM64_REG_PC))+' level='+str(x1))from e
 assert u.reg_read(UC_ARM64_REG_PC)==END,'Native calculation did not finish';return struct.unpack('<f',struct.pack('<I',u.reg_read(UC_ARM64_REG_S0)))[0]

import subprocess
curves=json.loads(subprocess.check_output(['node','-e',"const S=require('./app/src/main/assets/game/reference/config.js'),D=require('./app/src/main/assets/game/source-rules.js').data;console.log(JSON.stringify(['playerUpgrades','botUpgrades','neutralUpgrades'].flatMap(k=>S[k]._upgrades.map(x=>({kind:k,type:x._upgradeType,curve:x._gainBalances}))).concat(D.BotSkinsUpgradesConfig[0]._skinsUpgradesGainBalances.map(x=>({kind:'skin',type:x._skinType,curve:x._levelGainBalances})))));"],text=True));cases=[]
for spec in curves:
 c=spec['curve'];rows=c['_data'];extra=c['_extrapolationData'];obj=B+0x1000;arr=B+0x2000
 u.mem_write(arr,b'\0'*32768);u.mem_write(arr+0x18,struct.pack('<Q',len(rows)));u.mem_write(arr+0x20,b''.join(struct.pack('<if',r['_level'],r['_value'])for r in rows));u.mem_write(obj,struct.pack('<Qi4fif',arr,extra['ExtrapolationType'],extra['A'],extra['B'],extra['C'],extra['D'],c['_calculationMode'],c['_baseValue']))
 for lv in [1,19,50,100,159,160,200,500,629,1000]:cases.append({'kind':spec['kind'],'type':spec['type'],'level':lv,'expected':run(0x376d688,obj,lv)})
Path(a.out).write_text(json.dumps({'sourceSha256':sha,'scope':'Native gain curves only; no gameplay decisions','cases':cases},indent=2)+'\n');print('Executed',len(cases),'native progression cases')
