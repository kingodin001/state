#!/usr/bin/env python3
"""Select Android resources referenced by the retained Android classes.

Unity's own art/UI/data is not processed by this script. Resource IDs stay stable.
The result remains an experiment until native startup and UI have been tested.
"""
import argparse, collections, json, re, shutil
from pathlib import Path
import xml.etree.ElementTree as ET

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--decoded', required=True); ap.add_argument('--smali', required=True)
    ap.add_argument('--out', required=True); args = ap.parse_args()
    source = Path(args.decoded) / 'res'; output = Path(args.out); output.mkdir(parents=True, exist_ok=True)
    public = ET.parse(source/'values/public.xml').getroot()
    by_id = {int(e.get('id'), 16): (e.get('type'), e.get('name')) for e in public}
    by_key = {v: k for k, v in by_id.items()}
    by_name = collections.defaultdict(set)
    for kind, name in by_key: by_name[name].add((kind, name))
    definitions = collections.defaultdict(list); files = collections.defaultdict(list)
    for folder in source.iterdir():
        if not folder.is_dir(): continue
        kind = folder.name.split('-')[0]
        for p in folder.iterdir():
            if kind == 'values':
                if p.name == 'public.xml': continue
                for child in ET.parse(p).getroot():
                    key = (child.get('type') or child.tag, child.get('name'))
                    if key[1]: definitions[key].append((p, child))
            else:
                name = p.name.split('.')[0]; files[(kind, name)].append(p)
    chosen = {('style', 'UnityThemeSelector'), ('style', 'BaseUnityTheme')}
    # Lookups by name made by Firebase's native bridge, not represented in DEX IDs.
    for key in definitions:
        if key[0] == 'string' and (key[1].startswith(('google_', 'gcm_', 'firebase_', 'com.google.firebase.'))
                                  or key[1] in ('project_id', 'default_web_client_id')):
            chosen.add(key)
    named_roots = collections.defaultdict(set)
    unity_named_strings = set()
    unity_named_resources = set()
    for p in Path(args.smali).rglob('*.smali'):
        if p.name == 'R.smali' or p.name.startswith('R$'): continue
        text = p.read_text()
        # Resources.getIdentifier() resolves literal names, not numeric IDs or R
        # fields. Unity's U constructor uses game_view_content_description this
        # way. Retain every literal matching an actual source resource name.
        for name in re.findall(r'const-string(?:/jumbo)?\s+[^,]+, "([A-Za-z_][A-Za-z0-9_.]*)"', text):
            for key in by_name.get(name, ()):
                chosen.add(key); named_roots[key].add(str(p.relative_to(args.smali)))
                if '/com/unity3d/player/' in '/'+str(p.relative_to(args.smali)):
                    unity_named_resources.add(key)
                    if key[0] == 'string': unity_named_strings.add(name)
        for value in re.findall(r'\b0x7f[0-9a-fA-F]{6}\b', text):
            if int(value, 16) in by_id: chosen.add(by_id[int(value, 16)])
        for kind, name in re.findall(r'/R\$([\w]+);->([\w]+):', text):
            if (kind, name) in by_key: chosen.add((kind, name))
    reference = re.compile(r'[@?](?:\+)?(?:(\w+):)?([\w]+)/([\w.]+)')
    def refs(text):
        for package, kind, name in reference.findall(text):
            if not package: yield kind, name
    pending = list(chosen)
    while pending:
        key = pending.pop(); dependencies = set()
        for path, element in definitions[key]:
            dependencies.update(refs(ET.tostring(element, encoding='unicode')))
            if key[0] == 'style':
                parent = element.get('parent', '')
                if parent and not parent.startswith('@android:'):
                    dependencies.add(('style', parent.removeprefix('@style/')))
                elif not parent and '.' in key[1]: dependencies.add(('style', key[1].rsplit('.', 1)[0]))
                for item in element:
                    name = item.get('name', '')
                    if ':' not in name: dependencies.add(('attr', name))
        for path in files[key]:
            if path.suffix == '.xml': dependencies.update(refs(path.read_text()))
        for dep in dependencies - chosen:
            chosen.add(dep); pending.append(dep)
    values = {}
    for key in sorted(chosen):
        for path, element in definitions[key]:
            target = output/path.parent.name/path.name
            values.setdefault(target, ET.Element('resources')).append(element)
        for path in files[key]:
            target = output/path.parent.name/path.name; target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
    for path, root in values.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        ET.ElementTree(root).write(path, encoding='utf-8', xml_declaration=True)
    # aapt2 --stable-ids is authoritative, including holes left by removed SDKs.
    stable = output.parent/'stable-ids.txt'
    stable.write_text(''.join(f'pro.vymi.terrastorm.reference:{t}/{n} = 0x{by_key[t,n]:08x}\n'
                              for t, n in sorted(chosen) if (t, n) in by_key))
    (output.parent/'named-resource-roots.json').write_text(json.dumps([
        dict(type=t, name=n, sourceId=f'0x{by_key[t,n]:08x}', classes=sorted(paths))
        for (t,n), paths in sorted(named_roots.items())], indent=2)+'\n')
    (output.parent/'unity-required-strings.txt').write_text(''.join(name+'\n' for name in sorted(unity_named_strings)))
    (output.parent/'unity-resources.index').write_text(''.join(
        f'{t}\t{n}\t{by_key[t,n]:08x}\n' for t,n in sorted(unity_named_resources)))
    print('selected', len(chosen), 'resources;', sum(1 for _ in output.rglob('*') if _.is_file()), 'files')

if __name__ == '__main__': main()
