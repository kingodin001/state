#!/usr/bin/env python3
"""Retain a conservative Java dependency closure and remove ad instrumentation.

Consumes NativeDexGraph's TSV and NativeDexSelect's combined smali directory.
The five replacement bridges preserve ordinary I/O; they do not synthesize ads,
purchases, entitlements or rewards. No game-code method is patched.
"""
import argparse, collections, json, os
from pathlib import Path

ROOTS = ('Lcom/unity3d/player/', 'Lcom/google/firebase/',
         'Lcom/azur/application/identity/provider/', 'Lcom/lofelt/',
         'Lcom/unity/androidnotifications/', 'Lcom/android/billingclient/',
         'Lcom/yasirkula/unity/', 'Lspacemadness/com/lunarconsole/', 'Lio/state/fight/R')

SHIMS = {
 'android/utils/Logger': '''.method public static d(Ljava/lang/String;)I
 .registers 2
 const/4 v0, 0x0
 return v0
.end method''',
 'android/analytics/brandsafety/BrandSafetyUtils': '''.method public static detectAdClick(Landroid/content/Intent;Ljava/lang/String;)V
 .registers 2
 return-void
.end method''',
 'android/analytics/brandsafety/DetectTouchUtils': '''.method public static activityOnTouch(Landroid/app/Activity;Ljava/lang/String;Landroid/view/MotionEvent;)V
 .registers 3
 return-void
.end method''',
 'android/internal/partials/AdMobFilesBridge': '''.method public static fileOutputStreamCtor(Ljava/io/File;)Ljava/io/FileOutputStream;
 .registers 2
 new-instance v0, Ljava/io/FileOutputStream;
 invoke-direct {v0, p0}, Ljava/io/FileOutputStream;-><init>(Ljava/io/File;)V
 return-object v0
.end method''',
 'android/internal/partials/AdMobNetworkBridge': '''.method public static httpUrlConnectionGetResponseCode(Ljava/net/HttpURLConnection;)I
 .registers 2
 invoke-virtual {p0}, Ljava/net/HttpURLConnection;->getResponseCode()I
 move-result v0
 return v0
.end method
.method public static httpUrlConnectionDisconnect(Ljava/net/HttpURLConnection;)V
 .registers 1
 invoke-virtual {p0}, Ljava/net/HttpURLConnection;->disconnect()V
 return-void
.end method'''
}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--graph', required=True)
    ap.add_argument('--out', required=True); ap.add_argument('--smali')
    args = ap.parse_args(); output = Path(args.out); output.mkdir(parents=True, exist_ok=True)
    graph = {}; origin = {}
    for line in Path(args.graph).read_text().splitlines():
        name, dex, deps = line.split('\t'); origin[name] = dex
        graph[name] = deps.split(',') if deps else []
    pending = collections.deque(c for c in graph if c.startswith(ROOTS)); chosen = set()
    while pending:
        c = pending.popleft()
        if c in chosen or c not in graph: continue
        chosen.add(c)
        if not c.startswith('Lcom/safedk/'): pending.extend(graph[c])
    shims = {c for c in chosen if c.startswith('Lcom/safedk/')}
    assert shims == {'Lcom/safedk/'+name+';' for name in SHIMS}, shims
    by_dex = collections.defaultdict(list)
    for c in sorted(chosen): by_dex[origin[c]].append(c)
    keep = output/'keep-lists'; keep.mkdir(exist_ok=True)
    for dex, classes in by_dex.items(): (keep/(dex+'.txt')).write_text('\n'.join(classes)+'\n')
    (output/'kept-classes.json').write_text(json.dumps(by_dex, indent=2))
    if args.smali:
        for dex, classes in by_dex.items():
            for c in classes:
                if c.startswith('Lcom/safedk/'): continue
                relative = c[1:-1]+'.smali'; src = Path(args.smali)/relative
                target = output/'smali'/dex/relative; target.parent.mkdir(parents=True, exist_ok=True)
                if not target.exists(): os.link(src, target)
        for name, body in SHIMS.items():
            target = output/'smali/classes.dex/com/safedk'/(name+'.smali')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('.class public final Lcom/safedk/'+name+';\n.super Ljava/lang/Object;\n'+body+'\n')
    print(len(chosen), 'retained classes,', len(shims), 'instrumentation bridges')

if __name__ == '__main__': main()
