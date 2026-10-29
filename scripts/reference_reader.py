from pathlib import Path
from functools import lru_cache
import UnityPy
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator
from UnityPy.helpers.TypeTreeNode import TypeTreeNode
from UnityPy.helpers import TypeTreeHelper as H

def load_data(path):
 path=Path(path);env=UnityPy.Environment()
 for p in path.iterdir():
  if not p.is_file() or '.split' in p.name or p.suffix in ['.resource','.resS']:continue
  try:env.load_file(str(p))
  except Exception:pass
 for p in path.glob('*.split0'):
  stem=p.name[:-7];parts=sorted(path.glob(stem+'.split*'),key=lambda x:int(x.name.rsplit('split',1)[1]));env.load_file(b''.join(x.read_bytes() for x in parts),name=stem)
 return env
class Reader:
 def __init__(self,dlls):
  self.generator=TypeTreeGenerator('6000.3.13f1');self.generator.load_local_dll_folder(str(dlls));old=H.get_ref_type_node
  def managed(ref,asset):
   try:return old(ref,asset)
   except ValueError:
    t=ref['type'];return self.node(t['asm'],(t['ns']+'.' if t['ns'] else '')+t['class'],True) if t['class'] else None
  H.get_ref_type_node=managed
 @lru_cache(None)
 def node(self,assembly,fullname,managed=False):
  if not assembly.endswith('.dll'):assembly+='.dll'
  base=self.generator.get_nodes(assembly,fullname);nodes=[];skip=-1;registries=[i for i,n in enumerate(base) if n.m_Level==1 and n.m_Type=='ManagedReferencesRegistry']
  for i,n in enumerate(base):
   if skip>=0 and n.m_Level>skip:continue
   skip=-1
   if n.m_Level==1 and ((n.m_Type=='ManagedReferencesRegistry' and i!=registries[-1]) or (managed and n.m_Name in ['m_GameObject','m_Enabled','m_Script','m_Name','references'])):skip=n.m_Level;continue
   typ=n.m_Type;flag=n.m_MetaFlag
   if n.m_Name=='m_Enabled':flag|=16384
   if i+1<len(base) and base[i+1].m_Type=='Array' and typ!='vector':
    child=base[i+3] if i+3<len(base) else None
    if typ!='string' or not child or child.m_Type!='char':typ='vector'
   nodes.append(TypeTreeNode(n.m_Level,typ,n.m_Name,0,0,m_MetaFlag=flag))
  return TypeTreeNode.from_list(nodes)
 def read(self,o):
  d=o.read(check_read=False);s=d.m_Script.read();name=(s.m_Namespace+'.' if s.m_Namespace else '')+s.m_ClassName;node=self.node(s.m_AssemblyName,name);o.reset();start=o.reader.Position;d=H.read_value(node,o.reader,H.TypeTreeConfig(True,o.assets_file,False))
  if o.reader.Position-start!=o.byte_size:raise ValueError('Partial read '+name)
  return d
