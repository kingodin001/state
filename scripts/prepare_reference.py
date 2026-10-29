from pathlib import Path
from zipfile import ZipFile
root=Path(__file__).resolve().parents[1];target=root/'app/src/main/assets/game/reference/images';target.mkdir(exist_ok=True,parents=True)
with ZipFile(root/'reference-content/visuals.zip') as z:
 for name in z.namelist():
  if Path(name).name!=name:raise ValueError('Unexpected visual pack path')
  (target/name).write_bytes(z.read(name))
print('Prepared',len(z.namelist()),'visual files')
