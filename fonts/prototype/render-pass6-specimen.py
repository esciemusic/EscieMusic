"""Render the ESCIE Pass-6 prototype family for visual review."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parent
FONT_DIR=ROOT/"dist"/"pass6"
OUT_DIR=ROOT/"dist"/"pass6-specimen"

SPECIMENS=[
("ESCIE","ESCIE"),
("IDENTITY","ESCIE — THE FATHER / THE MAN / THE MONSTER"),
("SECTIONS","ART   THE PEOPLE   PLACES   MOMENTS   FRAGMENTS   PROOF   BODIES   PATH   THE WEB   THE ARCHIVES"),
("LOCATION","Montréal, Québec, Canada."),
("PRINCIPLE","THE ART DOES NOT CREATE THE UNIVERSE. THE UNIVERSE CREATES THE ART."),
("SIGNAL","ENTER THE WORLD   INDEX   GLASS EYE   PROOF   ARCHIVES"),
("FRENCH","ÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ   éèêëàâäîïôöùûüç"),
("LOWER","signal metadata visitor trace navigation evidence"),
]

def load(path,size):
    return ImageFont.truetype(str(path),size=size)

def render(path,width,title,size):
    bg=(8,8,8); fg=(245,245,245)
    margin=48 if width>600 else 24
    gap=34 if width>600 else 22
    img=Image.new("RGB",(width,1800),bg)
    d=ImageDraw.Draw(img); y=margin
    d.text((margin,y),title,font=load(path,20 if width>600 else 15),fill=fg); y+=54
    for label,txt in SPECIMENS:
        d.text((margin,y),label,font=load(path,15 if width>600 else 12),fill=fg); y+=30
        f=load(path,size); words=txt.split(" "); lines=[]; line=""
        max_width=width-margin*2
        for word in words:
            cand=(line+" "+word).strip()
            if d.textbbox((0,0),cand,font=f)[2] <= max_width:
                line=cand
            else:
                if line: lines.append(line)
                line=word
        if line: lines.append(line)
        for ln in lines:
            d.text((margin,y),ln,font=f,fill=fg); y+=size+gap
        y+=28
    return img.crop((0,0,width,min(y+margin,img.height)))

def main():
    OUT_DIR.mkdir(parents=True,exist_ok=True)
    files={k:FONT_DIR/f for k,f in {
        "escie":"ESCIE.ttf","signal":"ESCIE-SIGNAL.ttf","script":"ESCIE-SCRIPT.ttf"}.items()}
    if not all(p.exists() for p in files.values()):
        raise SystemExit("Generate Pass 6 first: python build-fonts-pass6-solid.py")
    render(files["escie"],1440,"ESCIE — PASS 6 / DESKTOP",58).save(OUT_DIR/"escie-desktop.png")
    render(files["escie"],390,"ESCIE — PASS 6 / PHONE",30).save(OUT_DIR/"escie-phone.png")
    render(files["signal"],1440,"ESCIE SIGNAL — PASS 6 / DESKTOP",34).save(OUT_DIR/"signal-desktop.png")
    render(files["signal"],390,"ESCIE SIGNAL — PASS 6 / PHONE",20).save(OUT_DIR/"signal-phone.png")
    render(files["script"],1440,"ESCIE SCRIPT — PASS 6 / DESKTOP",34).save(OUT_DIR/"script-desktop.png")
    render(files["script"],390,"ESCIE SCRIPT — PASS 6 / PHONE",20).save(OUT_DIR/"script-phone.png")

if __name__=="__main__":
    main()
