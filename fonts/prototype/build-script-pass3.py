"""ESCIE SCRIPT refinement pass 3.

This file isolates the handwriting problem so SCRIPT can be refined without
changing the ESCIE or ESCIE SIGNAL construction. All paths are self-authored.
"""

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables._g_l_y_f import Glyph
import math, os, string

LOWER = {
"a":[(120,260),(170,190),(300,205),(370,300),(315,370),(180,330),(145,250),(155,80)],
"b":[(135,80),(150,650),(235,700),(335,620),(350,470),(270,390),(155,430)],
"c":[(350,330),(300,395),(180,390),(115,300),(145,190),(260,145),(350,205)],
"d":[(350,80),(355,650),(270,700),(155,620),(140,470),(225,390),(355,450)],
"e":[(120,285),(330,285),(315,395),(180,410),(120,315),(165,205),(300,190),(370,245)],
"f":[(355,620),(300,690),(225,650),(220,100),(275,55),(360,100)],
"g":[(340,390),(250,430),(150,380),(130,270),(205,195),(320,220),(350,330),(325,-45),(190,-80)],
"h":[(130,80),(145,650),(225,690),(250,380),(335,320),(370,250),(365,80)],
"i":[(170,80),(185,360),(205,400),(220,80)],
"j":[(205,360),(220,70),(180,-45),(115,-65),(90,-20),(145,15)],
"k":[(140,80),(150,650),(175,400),(365,365),(205,270),(370,80)],
"l":[(205,80),(215,650),(280,690),(330,630)],
"m":[(105,80),(120,390),(205,430),(245,300),(260,80),(275,365),(355,410),(390,320),(390,80)],
"n":[(120,80),(135,390),(220,430),(280,330),(300,80)],
"o":[(300,390),(180,400),(120,300),(150,190),(270,160),(350,240),(340,340),(300,390)],
"p":[(125,-70),(140,390),(220,430),(325,380),(345,270),(295,190),(145,230)],
"q":[(330,-55),(350,390),(265,430),(155,380),(135,270),(195,190),(325,230)],
"r":[(125,80),(140,390),(225,430),(305,360)],
"s":[(345,355),(290,420),(165,385),(115,315),(200,260),(320,235),(350,165),(275,105),(145,135)],
"t":[(250,620),(225,115),(260,65),(350,100),(395,160)],
"u":[(125,390),(130,145),(210,95),(285,145),(310,390),(325,145),(385,90)],
"v":[(100,390),(220,85),(390,390)],
"w":[(90,390),(160,85),(245,350),(320,85),(405,390)],
"x":[(110,390),(350,85),(210,260),(365,390)],
"y":[(105,390),(205,100),(350,390),(300,-55),(210,-80)],
"z":[(110,370),(350,370),(125,100),(365,100)]
}

def round_cap(p, x, y, r):
    pts=[]
    for i in range(12):
        a=2*math.pi*i/12
        pts.append((x+math.cos(a)*r,y+math.sin(a)*r))
    p.moveTo(pts[0])
    for pt in pts[1:]: p.lineTo(pt)
    p.closePath()

def stroke(p, pts, width=34):
    # Soft, slightly variable pressure keeps the hand human rather than
    # making every segment look mechanically extruded.
    if len(pts) < 2:
        return
    n=len(pts)
    for i,(a,b) in enumerate(zip(pts,pts[1:])):
        dx=b[0]-a[0]; dy=b[1]-a[1]; L=max(1,math.hypot(dx,dy))
        nx=-dy/L; ny=dx/L
        phase=i/max(1,n-2)
        pressure=1.0 + 0.10*math.sin(phase*math.pi) - 0.035*math.cos(phase*2*math.pi)
        w=(width*pressure)/2
        p.moveTo((a[0]+nx*w,a[1]+ny*w))
        p.lineTo((b[0]+nx*w,b[1]+ny*w))
        p.lineTo((b[0]-nx*w,b[1]-ny*w))
        p.lineTo((a[0]-nx*w,a[1]-ny*w))
        p.closePath()
    r=width*0.46
    round_cap(p,*pts[0],r)
    round_cap(p,*pts[-1],r)

def smooth(points,steps=8):
    if len(points)<3:return points
    q=[points[0]]+points+[points[-1]]
    out=[]
    for i in range(1,len(q)-2):
        p0,p1,p2,p3=q[i-1:i+3]
        for j in range(steps):
            t=j/steps; t2=t*t; t3=t2*t
            out.append((
                .5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
                .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
            ))
    out.append(points[-1])
    return out
def script_glyph(ch):
    p=TTGlyphPen(None)
    weights={"a":48,"e":50,"g":54,"m":49,"n":50,"r":47,"s":53,"t":49,"u":50,"w":48,"y":52}
    offsets={"a":-6,"e":4,"g":-4,"m":3,"n":-2,"r":5,"s":-3,"t":2,"u":-4,"w":2,"y":-2}
    pts=smooth(LOWER[ch])
    dx=offsets.get(ch,0)
    pts=[(x+dx,y) for x,y in pts]

    # Keep the skeleton clean. Human character comes from curve, pressure,
    # and slight letter-specific rhythm — not artificial spikes or tails.
    stroke(p,pts,weights.get(ch,50))

    if ch=="i":
        rect(p,188,430,34,34)
    elif ch=="j":
        rect(p,188,430,34,34)
    elif ch=="t":
        stroke(p,[(165,360),(350,360)],28)
    elif ch=="f":
        stroke(p,[(185,330),(330,330)],26)
    elif ch=="e":
        stroke(p,[(175,285),(330,285)],18)
    elif ch=="t":
        stroke(p,[(175,360),(350,360)],22)
    return p.glyph()

def rect(p, x, y, w, h):
    p.moveTo((x,y)); p.lineTo((x+w,y)); p.lineTo((x+w,y+h)); p.lineTo((x,y+h)); p.closePath()

def simple_symbol(ch):
    p=TTGlyphPen(None)
    strokes={
        "0":[(120,120),(120,620),(230,700),(350,620),(350,120),(230,50),(120,120)],
        "1":[(235,90),(235,680),(145,560)],
        "2":[(120,560),(180,680),(320,680),(380,560),(120,100),(390,100)],
        "3":[(130,650),(340,650),(380,540),(260,390),(360,300),(340,120),(140,120)],
        "4":[(330,90),(330,680),(120,300),(390,300)],
        "5":[(370,670),(150,670),(130,390),(330,390),(380,270),(330,100),(140,100)],
        "6":[(350,620),(260,690),(140,560),(130,220),(240,90),(350,180),(330,350),(150,350)],
        "7":[(120,670),(390,670),(210,90)],
        "8":[(220,390),(120,560),(180,680),(320,680),(380,560),(280,390),(380,250),(320,100),(180,100),(120,250),(220,390)],
        "9":[(350,90),(370,520),(280,670),(150,620),(140,450),(260,350),(370,450)],
        ".":[(220,70),(280,70)], ",":[(220,90),(280,90),(250,25)], "-":[(130,360),(370,360)],
        "_":[(100,70),(400,70)], "/":[(140,80),(360,680)], ":":[(220,480),(280,480),(220,120),(280,120)],
        ";":[(220,480),(280,480),(245,100),(280,70)], "!":[(250,170),(250,680),(250,70)],
        "?":[(140,560),(200,670),(330,650),(380,540),(300,440),(250,350),(250,180),(250,70)],
        "'":[(250,620),(250,700)], '"':[ (210,620),(210,700),(290,620),(290,700)],
        "(":[(300,680),(210,580),(180,390),(210,200),(300,90)],
        ")":[(200,680),(290,580),(320,390),(290,200),(200,90)],
        "&":[(350,560),(280,680),(170,620),(150,500),(330,170),(280,80),(170,120),(140,260),(190,350),(360,90)],
        "—":[(120,380),(380,380)], "–":[(160,380),(340,380)],
        "“":[(190,620),(190,700),(250,620),(250,700)], "”":[(250,620),(250,700),(310,620),(310,700)],
        "’":[(250,620),(250,700)], "€":[(370,600),(300,670),(170,620),(130,450),(160,250),(300,180),(370,250),(150,380),(330,380)]
    }
    pts=strokes.get(ch,[])
    if pts: stroke(p,smooth(pts),30)
    return p.glyph()

def build(path):
    order=[".notdef","space"]+list(string.ascii_lowercase)+list(string.ascii_uppercase)+list(string.digits)+list(".,!?'-/:;()&—–€“”’")+list("éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ")
    glyphs={}; metrics={}; cmap={}
    p=TTGlyphPen(None)
    p.moveTo((70,0)); p.lineTo((520,0)); p.lineTo((520,760)); p.lineTo((70,760)); p.closePath()
    glyphs[".notdef"]=p.glyph(); metrics[".notdef"]=(620,0)
    glyphs["space"]=Glyph(); metrics["space"]=(250,0); cmap[32]="space"
    for ch in string.ascii_lowercase:
        glyphs[ch]=script_glyph(ch); metrics[ch]=(470,0); cmap[ord(ch)]=ch
    for ch in string.ascii_uppercase:
        glyphs[ch]=script_glyph(ch.lower()); metrics[ch]=(500,0); cmap[ord(ch)]=ch
    for ch in string.digits + ".,!?'-/:;()&—–€“”’":
        glyphs[ch]=simple_symbol(ch); metrics[ch]=(500,0); cmap[ord(ch)]=ch
    accents={"é":"e","è":"e","ê":"e","ë":"e","à":"a","â":"a","ä":"a","î":"i","ï":"i","ô":"o","ö":"o","ù":"u","û":"u","ü":"u","ç":"c",
             "É":"e","È":"e","Ê":"e","Ë":"e","À":"a","Â":"a","Ä":"a","Î":"i","Ï":"i","Ô":"o","Ö":"o","Ù":"u","Û":"u","Ü":"u","Ç":"c"}
    for ch,base in accents.items():
        p=TTGlyphPen(None)
        stroke(p,smooth(LOWER[base]),36)
        if base != "c":
            if ch.lower() in "éèàù":
                rect(p,330,690,34,90)
            elif ch.lower() in "êâîôû":
                stroke(p,[(215,705),(250,755),(285,705)],22)
            elif ch.lower() in "ëäïöü":
                rect(p,205,720,28,28); rect(p,285,720,28,28)
        else:
            rect(p,285,-55,42,65)
        glyphs[ch]=p.glyph(); metrics[ch]=(470 if ch.islower() else 500,0); cmap[ord(ch)]=ch

    fb=FontBuilder(1000,isTTF=True)
    fb.setupGlyphOrder(order); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=900,descent=-200); fb.setupCharacterMap(cmap)
    fb.setupOS2(sTypoAscender=900,sTypoDescender=-200,usWeightClass=400,usWidthClass=4)
    fb.setupNameTable({"familyName":"ESCIE SCRIPT","styleName":"Prototype Pass 3",
        "uniqueFontIdentifier":"ESCIE SCRIPT Prototype Pass 3",
        "fullName":"ESCIE SCRIPT Prototype Pass 3","psName":"ESCIESCRIPT-PrototypePass3"})
    fb.setupPost(); fb.font["post"].formatType=3.0; fb.setupHead(); fb.save(path)

if __name__=="__main__":
    os.makedirs("dist",exist_ok=True)
    build("dist/ESCIE-SCRIPT-pass3.ttf")
