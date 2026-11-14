"""ESCIE Pass 12 specimen gate — prototype only."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from fontTools.ttLib import TTFont
import importlib.util,string
ROOT=Path(__file__).resolve().parent; DIST=ROOT/"dist"/"pass12"; DIST.mkdir(parents=True,exist_ok=True)
s=importlib.util.spec_from_file_location("pass12",ROOT/"build-fonts-pass12-filled.py"); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
for fam,w,k in [("ESCIE",800,"escie"),("ESCIE SIGNAL",600,"signal"),("ESCIE SCRIPT",400,"script")]:
    m.build_pass12(str(DIST/f"{fam.replace(' ','-')}.ttf"),fam,w,k)
required=string.ascii_uppercase+string.ascii_lowercase+string.digits+"éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ"
for name,path in {"ESCIE":DIST/"ESCIE.ttf","SIGNAL":DIST/"ESCIE-SIGNAL.ttf","SCRIPT":DIST/"ESCIE-SCRIPT.ttf"}.items():
    f=TTFont(path); chars=set()
    for t in f["cmap"].tables: chars.update(chr(c) for c in t.cmap)
    missing=set(required)-chars
    if missing: raise SystemExit(f"{name} missing: {' '.join(sorted(missing))}")
def wrap(d,t,f,maxw):
    lines=[]; line=""
    for word in t.split():
        c=word if not line else line+" "+word
        if d.textbbox((0,0),c,font=f)[2]<=maxw: line=c
        else: lines.append(line); line=word
    if line: lines.append(line)
    return lines
def render(w,h,name,scale):
    im=Image.new("RGB",(w,h),(13,13,16)); d=ImageDraw.Draw(im); margin=28 if w<500 else 72; maxw=w-2*margin
    meta=ImageFont.truetype(str(DIST/"ESCIE-SIGNAL.ttf"),max(8,int(12*scale))); y=margin
    d.text((margin,y),"ESCIE / PASS 12 LETTERFORM SPECIMEN",font=meta,fill=(238,238,238)); y+=int(50*scale)
    rows=[("ESCIE","ESCIE",78),("ESCIE","A GOOD PERSON. I'M JUST NOT NICE.",31),("ESCIE","THE FATHER / THE MAN / THE MONSTER.",31),("SIGNAL","CASE FILE / PROOF / MONTRÉAL / QUÉBEC",52)]
    for fam,text,size in rows:
        d.text((margin,y),fam,font=meta,fill=(150,150,160)); y+=int(20*scale)
        f=ImageFont.truetype(str(DIST/("ESCIE.ttf" if fam=="ESCIE" else "ESCIE-SIGNAL.ttf")),max(18,int(size*scale)))
        for line in wrap(d,text,f,maxw): d.text((margin,y),line,font=f,fill=(238,238,238)); y+=int(f.size*1.22)
        y+=int(12*scale)
    f=ImageFont.truetype(str(DIST/"ESCIE-SIGNAL.ttf"),max(8,int(12*scale)))
    for line in wrap(d,"French: Montréal, Québec — ÉCOUTE / DÉTAIL / FRAGMENTS",f,maxw): d.text((margin,y),line,font=f,fill=(190,190,195)); y+=int(f.size*1.2)
    im.save(ROOT/name)
render(1440,900,"specimen-pass12-desktop.png",1); render(390,844,"specimen-pass12-phone.png",.46)
print("PASS12 coverage + renders complete")
