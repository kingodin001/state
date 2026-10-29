from pathlib import Path
from zipfile import ZipFile
root=Path(__file__).resolve().parents[1]
target=root/'app/src/main/assets/game/reference/images'
target.mkdir(exist_ok=True,parents=True)
wanted=set()
for pack in ['visuals.zip','unit-textures.zip']:
 with ZipFile(root/'reference-content'/pack) as z:
  for name in z.namelist():
   if Path(name).name!=name:raise ValueError('Unexpected visual pack path')
   if pack=='unit-textures.zip':wanted.discard(Path(name).with_suffix('.svg').name)
   wanted.add(name)
   (target/name).write_bytes(z.read(name))
# This directory is generated exclusively from the versioned visual packs.
for obsolete in target.iterdir():
 if obsolete.is_file() and obsolete.name not in wanted:obsolete.unlink()
print('Prepared',len(wanted),'visual files')
