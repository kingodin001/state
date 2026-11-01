"""Write public Yandex ad IDs into the server document. No passwords or API keys."""
import argparse,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--file',type=Path,default=Path(__file__).resolve().parents[1]/'server/state/ads.json');p.add_argument('--banner',required=True);p.add_argument('--interstitial',required=True);p.add_argument('--rewarded',required=True);a=p.parse_args()
for value in [a.banner,a.interstitial,a.rewarded]:
 if not re.fullmatch(r'R-M-\d{1,20}-\d{1,10}',value):p.error('Use the exact R-M-... Android ad unit identifier')
d=json.loads(a.file.read_text());d['adUnits'].update(banner=a.banner,interstitial=a.interstitial);d['enabled']=True
for k in ['rewarded_result','rewarded_upgrade','rewarded_color','rewarded_bonus']:d['adUnits'][k]=a.rewarded
a.file.write_text(json.dumps(d,indent=2)+'\n');print('Updated',a.file)
