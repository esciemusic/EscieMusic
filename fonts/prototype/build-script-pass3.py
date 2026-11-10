"""ESCIE SCRIPT refinement pass 3.

This file isolates the handwriting problem so SCRIPT can be refined without
changing the ESCIE or ESCIE SIGNAL construction. All paths are self-authored.
"""

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables._g_l_y_f import Glyph
import math, os, string

LOWER = {
"a":[(120,275),(145,205),(245,175),(330,215),(350,300),(305,360),(210,365),(145,320),(155,255),(220,245),(285,260),(310,315),(300,110)],
"b":[(135,80),(150,650),(225,690),(315,650),(345,555),(325,455),(245,405),(160,435)],
"c":[(345,325),(305,380),(220,395),(145,350),(115,275),(145,200),(225,170),(320,210)],
"d":[(350,90),(350,650),(275,690),(190,670),(140,600),(130,500),(170,425),(250,400),(325,435)],
"e":[(120,285),(190,245),(315,250),(345,300),(310,345),(205,350),(140,315),(155,240),(225,190),(315,210)],
"f":[(340,625),(295,685),(235,650),(220,400),(230,100),(285,65),(350,100)],
"g":[(330,345),(300,400),(220,415),(145,375),(125,295),(150,220),(225,190),(305,220),(330,285),(315,325),(275,345),(300,250),(315,-35),(250,-90),(180,-80)],
"h":[(130,80),(145,650),(220,690),(245,385),(310,330),(355,280),(365,80)],
"i":[(170,80),(180,330),(205,365),(225,80)],
"j":[(205,330),(220,75),(190,-45),(135,-70),(95,-30),(135,10),(180,-5)],
"k":[(140,80),(150,650),(175,395),(350,350),(205,270),(365,80)],
"l":[(205,80),(215,650),(270,690),(325,635)],
"m":[(105,80),(120,360),(175,410),(220,360),(250,220),(270,360),(325,410),(375,350),(390,80)],
"n":[(120,80),(135,360),(190,410),(240,360),(295,80)],
"o":[(305,360),(245,405),(165,380),(125,300),(145,220),(215,180),(300,205),(345,270),(335,335),(305,360)],
"p":[(125,-70),(140,360),(205,410),(295,390),(335,330),(330,255),(285,205),(205,200),(145,245)],
"q":[(335,-60),(345,360),(280,410),(195,390),(145,335),(140,255),(185,205),(265,200),(325,245)],
"r":[(125,80),(140,360),(195,405),(260,365),(315,310)],
"s":[(325,350),(290,395),(220,400),(155,365),(125,310),(160,270),(230,260),(300,240),(330,195),(295,145),(220,120),(150,145)],
"t":[(250,620),(235,110),(270,70),(335,105),(380,150)],
"u":[(125,350),(130,155),(175,100),(230,145),(250,350),(270,145),(320,100),(365,150),(370,80)],
"v":[(105,350),(220,90),(375,350)],
"w":[(90,350),(155,95),(220,315),(285,95),(375,350)],
"x":[(110,360),(350,95),(220,245),(365,360)],
"y":[(105,350),(180,105),(260,320),(335,100),(300,-55),(230,-85)],
"z":[(110,345),(340,345),(130,100),(365,100)]
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
    # Build one continuous closed outline from the smoothed centerline.
    # A single outline avoids raster seams between segment rectangles while
    # keeping the handwriting soft, readable, and self-authored.
    if len(pts) < 2:
        return
    n=len(pts)
    left=[]; right=[]
    for i,(x,y) in enumerate(pts):
        if i==0:
            dx=pts[1][0]-x; dy=pts[1][1]-y
        elif i==n-1:
            dx=x-pts[i-1][0]; dy=y-pts[i-1][1]
        else:
            dx=pts[i+1][0]-pts[i-1][0]; dy=pts[i+1][1]-pts[i-1][1]
        L=max(1,math.hypot(dx,dy))
        nx=-dy/L; ny=dx/L
        phase=i/max(1,n-1)
        pressure=1.0 + 0.055*math.sin(phase*math.pi) - 0.015*math.cos(phase*2*math.pi)
        w=(width*pressure)/2
        left.append((x+nx*w,y+ny*w))
        right.append((x-nx*w,y-ny*w))

    p.moveTo(left[0])
    for pt in left[1:]:
        p.lineTo(pt)
    for pt in reversed(right):
        p.lineTo(pt)
    p.closePath()

    # Soft endpoint caps only; joins remain part of the continuous outline.
    r=width*0.50
    round_cap(p,*pts[0],r)
    round_cap(p,*pts[-1],r)

def smooth(points,steps=12):
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
def ellipse(p,cx,cy,rx,ry,reverse=False,steps=28):
    pts=[]
    seq=range(steps-1,-1,-1) if reverse else range(steps)
    for i in seq:
        a=2*math.pi*i/steps
        pts.append((cx+math.cos(a)*rx,cy+math.sin(a)*ry))
    p.moveTo(pts[0])
    for pt in pts[1:]:
        p.lineTo(pt)
    p.closePath()

def loop_glyph(ch):
    p=TTGlyphPen(None)
    if ch=="o":
        ellipse(p,235,290,112,105)
        ellipse(p,235,290,48,42,reverse=True)
    elif ch=="a":
        ellipse(p,225,285,105,92)
        ellipse(p,225,285,44,34,reverse=True)
        stroke(p,[(315,330),(320,105)],58)
    elif ch=="b":
        stroke(p,[(155,80),(165,650)],58)
        ellipse(p,245,285,105,100)
        ellipse(p,245,285,43,40,reverse=True)
    elif ch=="d":
        stroke(p,[(320,80),(315,650)],58)
        ellipse(p,220,285,105,100)
        ellipse(p,220,285,43,40,reverse=True)
    elif ch=="p":
        stroke(p,[(150,-70),(155,350)],58)
        ellipse(p,245,285,100,98)
        ellipse(p,245,285,41,39,reverse=True)
    elif ch=="q":
        stroke(p,[(320,-60),(320,350)],58)
        ellipse(p,225,285,100,98)
        ellipse(p,225,285,41,39,reverse=True)
    elif ch=="g":
        ellipse(p,225,300,100,98)
        ellipse(p,225,300,42,38,reverse=True)
        stroke(p,[(305,300),(315,-45),(255,-85),(185,-70)],58)
    else:
        return None
    return p.glyph()

def script_glyph(ch):
    loop=loop_glyph(ch)
    if loop is not None:
        return loop
    p=TTGlyphPen(None)
    weights={"a":62,"e":64,"g":68,"m":63,"n":64,"r":61,"s":67,"t":63,"u":64,"w":62,"y":66}
    offsets={"a":-6,"e":4,"g":-4,"m":3,"n":-2,"r":5,"s":-3,"t":2,"u":-4,"w":2,"y":-2}
    pts=smooth(LOWER[ch])
    dx=offsets.get(ch,0)
    pts=[(x + dx + 0.10*(y-250), y) for x,y in pts]

    # Keep the skeleton clean. Human character comes from curve, pressure,
    # and slight letter-specific rhythm — not artificial spikes or tails.
    stroke(p,pts,weights.get(ch,58))

    if ch=="i":
        rect(p,188,430,34,34)
    elif ch=="j":
        rect(p,188,430,34,34)
    elif ch=="t":
        stroke(p,[(165,360),(350,360)],20)
    elif ch=="f":
        stroke(p,[(185,330),(330,330)],19)
    elif ch=="e":
        stroke(p,[(175,285),(330,285)],15)
    elif ch=="t":
        stroke(p,[(175,360),(350,360)],18)
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
        stroke(p,smooth(LOWER[base]),30)
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
