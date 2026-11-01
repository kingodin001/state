"""Original StateStorm interface artwork. Deterministic, editable SVG source."""
from pathlib import Path
P=Path(__file__).resolve().parents[1]/'app/src/main/assets/game/art/identity';P.mkdir(parents=True,exist_ok=True)
navy='#203c57';cyan='#44c3dc';mint='#72e0b5';coral='#ff826a';gold='#f4bc56';white='#f5fbff'
def svg(body):return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="b" x2=".25" y2="1"><stop stop-color="#41627d"/><stop offset="1" stop-color="#172f48"/></linearGradient><linearGradient id="g" x2=".25" y2="1"><stop stop-color="#ffe2a0"/><stop offset="1" stop-color="#e7a541"/></linearGradient><linearGradient id="c" x2=".25" y2="1"><stop stop-color="#96eff2"/><stop offset="1" stop-color="#27a8c8"/></linearGradient></defs><g stroke="{navy}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>\n'
def path(d,fill='none',stroke=None,w=None):return f'<path d="{d}" fill="{fill}"'+(f' stroke="{stroke}"' if stroke else '')+(f' stroke-width="{w}"'if w else '')+'/>'
def rect(x,y,w,h,fill,r=8,stroke=None):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}"'if stroke else '')+'/>'
def circle(x,y,r,fill,stroke=None):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"'+(f' stroke="{stroke}"'if stroke else '')+'/>'
def plate(body):return path('M64 6 111 33v57l-47 30-47-30V33Z','url(#b)',white)+body
icons={}
icons['coins']=path('M39 8h50l25 31v50l-25 31H39L14 89V39Z','#b87a2c')+path('M39 5h50l25 29v50l-25 29H39L14 84V34Z','url(#g)',white)+path('M46 23h36l17 20v33L82 96H46L29 76V43Z',gold,'#ca8a32')+path('M78 40c-7-7-28-5-28 7 0 12 30 6 28 21-1 12-24 14-31 4M64 29v57','none',navy,7)+path('M39 15h48',white,'#fff1c4',3)
icons['gems']=path('M64 8 100 27l13 37-49 54L15 64l13-37Z',navy,white)+path('M30 28 64 13l34 15-10 32H40Z',mint)+path('M40 60h48l-24 48Z','url(#c)')+path('m30 28 10 32-19 3m77-35L88 60l19 3M64 13 40 60m24-47 24 47', 'none',white,2)
icons['tickets']=path('M12 31 99 14l16 73-87 22-5-21c8-3 5-16-4-14Z',coral,white)+path('m76 23 13 65','none',navy,3)+path('m45 40 26 12-19 24Z',white)+path('m29 37 7-2m-1 57 7-2','none',white,3)
icons['supply']=rect(24,26,80,85,'url(#b)',12,white)+rect(42,14,44,16,gold,5)+rect(36,44,56,42,mint,5)+path('M64 50v29m-14-15h28','none',navy,7)+path('M34 100h60','none',cyan,4)
icons['stars']=plate(path('m64 28 11 23 27 4-19 19 5 27-24-13-24 13 5-27-19-19 27-4Z',gold,white))
icons['idle']=rect(14,34,90,73,'url(#b)',12,white)+rect(25,47,66,45,cyan,6)+circle(56,68,17,navy)+path('M56 58v20m-10-10h20','none',gold,4)+circle(94,36,24,'url(#g)',white)+path('M94 22v16l10 5','none',navy,5)
icons['rush']=path('M22 73 45 33l47 3 19 36-14 28H37Z','url(#b)',white)+path('m43 43 15-3-9 24H31Z',cyan)+path('M65 41h21l13 23H59Z',mint)+circle(45,94,14,navy,white)+circle(94,94,14,navy,white)+path('M28 45H12m9 16H5m23 24H10','none',coral,7)+path('m77 69-14 10 13 3-11 16',gold,gold,3)
icons['wheel']=path('M40 9h48l32 31v48l-32 31H40L9 88V40Z','url(#b)',white)+path('m64 22 29 13-29 29Z',coral)+path('m93 35 13 29H64Z',gold)+path('m106 64-13 29-29-29Z',mint)+path('m93 93-29 13V64Z',cyan)+path('m64 106-29-13 29-29Z','#7495ba')+path('M35 93 22 64h42Z',coral)+path('m22 64 13-29 29 29Z',gold)+path('m35 35 29-13v42Z',mint)+circle(64,64,15,white)+path('M53 6h22L64 29Z',gold)
icons['operations']=plate(path('M32 34 64 25l32 9v56l-32 12-32-12Z',cyan,white)+path('m64 25 1 77','none',navy,3)+path('m41 70 17 9 29-35','none',white,7)+path('M90 44 76 46l12 10Z',coral,coral))
icons['league']=path('M30 8h25l13 41-20 13Z',cyan,white)+path('M73 8h25L78 62 58 49Z',coral,white)+path('m64 41 32 19v36l-32 22-32-22V60Z','url(#g)',white)+path('m64 58 6 13 15 2-11 11 3 15-13-7-13 7 3-15-11-11 15-2Z',navy,'#fff2c0')
icons['duel']=plate(path('M31 37h27v20L44 70 31 57Z',cyan,white)+path('m70 58 14-13 14 13v25H70Z',coral,white)+path('m65 25-8 25h16l-9 31',gold,gold,4)+path('M27 83h31m12 14h31','none',white,6))
icons['quests']=rect(24,21,80,94,'url(#b)',12,white)+rect(43,10,42,20,gold,5)+path('m39 49 7 7 12-15m-19 39 7 7 12-15','none',mint,5)+path('M70 49h19M70 80h19','none',white,5)
icons['store']=path('M18 47h92v67H18Z','url(#b)',white)+path('M13 33 29 13h70l16 20v24c-7 10-17 8-25 0-7 10-18 10-26 0-7 10-18 10-26 0-8 9-19 10-25 0Z',mint,white)+path('M38 17v34m26-34v34m26-34v34','none',navy,4)+rect(31,77,27,37,gold,3)+rect(74,77,24,22,cyan,4)
icons['army']=path('M12 66c0-23 30-23 30 0v32H12Zm74 0c0-23 30-23 30 0v32H86Z','url(#b)',white)+path('M38 56c0-37 52-37 52 0v54H38Z',cyan,white)+path('M36 52h55v15H36Z',navy,white)+path('M56 50V23h16v27',mint,navy)+path('M52 79h24v21H52Z',gold,navy)
icons['play']=plate(path('M44 28v71l52-36Z',mint,white))
icons['upgrades']=plate(path('m35 79 29-31 29 31M35 55l29-30 29 30','none',mint,11)+path('M48 95h32','none',gold,7))
icons['albums']=rect(13,23,85,86,cyan,10,white)+rect(28,13,85,86,'url(#b)',10,white)+path('m43 78 18-29 13 13 14-25 14 41Z',mint,white)+circle(49,36,9,gold)
icons['settings']=plate(path('m60 28 15 4 1 11 12 7 10-3 7 14-7 9 1 13-9 12-12-3-10 7-14-7-1-11-12-7 4-15-8-10 9-12 12 2Z',cyan,white)+circle(65,66,14,navy))
icons['garrison']=plate(path('M43 96V28m3 4 45 7-12 18 10 15-43-7',coral,white)+circle(86,90,12,mint,white))
icons['production']=plate(path('M31 96V55l22 9V47l22 11V29h17v67Z',cyan,white)+path('M42 81h7m12 0h7m12 0h7','none',navy,6)+path('m63 28-9 17h16l-8 15',gold,gold,4))
icons['capacity']=plate(path('M29 95V42h16V29h13v13h12V29h13v13h16v53Z',mint,white)+path('M55 96V75q9-15 18 0v21Z',navy,white))
icons['extra_base']=icons['capacity']+circle(99,27,22,gold,white)+path('M99 15v25M87 27h25','none',navy,6)
icons['produce_boost']=icons['production']+circle(101,28,23,coral,white)+path('m89 31 12-13 12 13M101 18v24','none',white,5)
icons['move_boost']=plate(path('M51 28h27v32l22 13v24H42V72l9-10Z',cyan,white)+path('M43 92h57','none',gold,7)+path('M43 48H28m12 18H23m12 18H16','none',mint,5))
for name,color in [('chest_basic',cyan),('chest_royal',coral),('chest_legend',gold)]:
 icons[name]=path('M16 58 25 27h77l12 31v50H16Z','url(#b)',white)+path('M16 58h98v18H16Z',color,white)+path('M32 31v24m64-24v24M30 80v20m70-20v20','none',color,5)+path('m64 50 17 12v25L64 99 47 87V62Z','url(#g)',navy)+circle(64,74,6,navy)
for name,body in icons.items():(P/(name+'.svg')).write_text(svg(body))
print('Created',len(icons),'original SVG assets')
