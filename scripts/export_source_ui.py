"""Export Unity UI hierarchy/graphics/layout, without SDK controllers or code.

Run after Cpp2IL attributeanalyzer + attributeinjector declaration generation.
Requires the reference APK data, not included in the repository.
"""
import argparse, json, re
from pathlib import Path
from UnityPy.classes.PPtr import PPtr
from reference_reader import Reader, load_data

def main():
    p = argparse.ArgumentParser(); p.add_argument('--data', required=True); p.add_argument('--bundles', required=True)
    p.add_argument('--dlls', required=True); p.add_argument('--audit', required=True); p.add_argument('--out', required=True)
    a = p.parse_args(); env = load_data(a.data); reader = Reader(a.dlls)
    for f in Path(a.bundles).glob('*.bundle'): env.load_file(str(f))
    roots = []
    for line in Path(a.audit).read_text().splitlines():
        m = re.match(r'\| (.*?) \| ([^ /]+) / (\d+) \|', line)
        if m: roots.append((m[1], m[2], m[3]))
    objects = {(o.assets_file.name, str(o.path_id)): o for o in env.objects}
    def key(ptr):
        o = ptr.deref() if ptr.path_id else None
        return (o.assets_file.name, str(o.path_id)) if o else None
    def sprite(o, value):
        if not value.get('m_PathID'): return None
        try: return ':'.join(key(PPtr(m_FileID=value['m_FileID'], m_PathID=value['m_PathID'], assetsfile=o.assets_file)))
        except Exception: return None
    scenes = []; errors = []
    graphics = {'Image', 'TextMeshProUGUI', 'Text', 'RawImage', 'HorizontalLayoutGroup',
                'VerticalLayoutGroup', 'GridLayoutGroup', 'LayoutElement', 'ContentSizeFitter',
                'Mask', 'RectMask2D', 'ScrollRect', 'Button', 'UIButton', 'Localize', 'Shadow', 'Outline'}
    for name, file, rid in roots:
        obj = objects.get((file, rid))
        if not obj or obj.type.name != 'GameObject': errors.append([name, 'missing root']); continue
        nodes = []
        def walk(go_obj, parent=None):
            go = go_obj.read(); node = dict(id=str(go_obj.path_id), name=go.m_Name, active=bool(go.m_IsActive), parent=parent)
            transform = None; values = []
            for item in go.m_Component:
                comp = item.component.deref()
                if comp.type.name in ('Transform','RectTransform'):
                    transform = comp.read()
                    if comp.type.name == 'RectTransform':
                        d = comp.read_typetree()
                        node['rect'] = {k:d[k] for k in ('m_AnchorMin','m_AnchorMax','m_SizeDelta','m_AnchoredPosition','m_Pivot','m_LocalScale')}
                elif comp.type.name == 'MonoBehaviour':
                    raw = comp.read(check_read=False); kind = raw.m_Script.read().m_ClassName
                    if kind not in graphics: continue
                    try:
                        d = reader.read(comp)
                        if kind in ('Image','RawImage'):
                            values.append(dict(kind=kind, sprite=sprite(comp,d.get('m_Sprite',{})), color=d.get('m_Color'),
                                mode=d.get('m_Type'), fill=d.get('m_FillAmount'), preserve=d.get('m_PreserveAspect')))
                        elif kind in ('TextMeshProUGUI','Text'):
                            values.append(dict(kind='text', text=d.get('m_text',d.get('m_Text','')), size=d.get('m_fontSize',d.get('m_FontData',{}).get('m_FontSize',32)),
                                color=d.get('m_fontColor',d.get('m_Color')), alignment=d.get('m_textAlignment'), margin=d.get('m_margin')))
                        elif kind == 'Localize': values.append(dict(kind='localize', term=d.get('mTerm','')))
                        else: values.append(dict(kind=kind, data={k:v for k,v in d.items() if not k.startswith('m_') or k in ('m_Padding','m_Spacing','m_ChildAlignment','m_CellSize','m_Constraint','m_ConstraintCount','m_ChildControlWidth','m_ChildControlHeight','m_ChildForceExpandWidth','m_ChildForceExpandHeight','m_IgnoreLayout','m_MinWidth','m_MinHeight','m_PreferredWidth','m_PreferredHeight','m_FlexibleWidth','m_FlexibleHeight','m_LayoutPriority','m_StartCorner','m_StartAxis','m_HorizontalFit','m_VerticalFit','m_Horizontal','m_Vertical','m_MovementType','m_Elasticity','m_Inertia','m_DecelerationRate','m_ScrollSensitivity')}))
                    except Exception as ex: errors.append([name,go.m_Name,kind,str(ex)[:120]])
            if values: node['components'] = values
            nodes.append(node)
            if transform:
                for child in transform.m_Children:
                    t = child.deref().read(); walk(t.m_GameObject.deref(),node['id'])
        walk(obj)
        scenes.append(dict(name=name, file=file, id=rid, nodes=nodes))
        if len(scenes)%20==0: print('UI scenes',len(scenes),flush=True)
    output = Path(a.out); output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text('(function(g){g.TerraSourceUI='+json.dumps({'designWidth':1080,'scenes':scenes},ensure_ascii=False,separators=(',',':'))+';})(globalThis);')
    output.with_suffix('.errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2))
    print('Exported',len(scenes),'scenes',sum(len(s['nodes']) for s in scenes),'nodes;',len(errors),'issues',flush=True)

if __name__ == '__main__': main()
