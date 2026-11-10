"""ESCIE original letterform prototype — Pass 2.

Self-authored vector construction. No reference font outlines are imported.
Run from fonts/prototype:
  python build-fonts-pass2.py
"""
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables._g_l_y_f import Glyph
import math, os, string

ACC = {"é":("e","acute"),"è":("e","grave"),"ê":("e","circumflex"),"ë":("e","diaeresis"),
"à":("a","grave"),"â":("a","circumflex"),"ä":("a","diaeresis"),"î":("i","circumflex"),
"ï":("i","diaeresis"),"ô":("o","circumflex"),"ö":("o","diaeresis"),"ù":("u","grave"),
"û":("u","circumflex"),"ü":("u","diaeresis"),"ç":("c","cedilla"),
"É":("E","acute"),"È":("E","grave"),"Ê":("E","circumflex"),"Ë":("E","diaeresis"),
"À":("A","grave"),"Â":("A","circumflex"),"Ä":("A","diaeresis"),"Î":("I","circumflex"),
"Ï":("I","diaeresis"),"Ô":("O","circumflex"),"Ö":("O","diaeresis"),"Ù":("U","grave"),
"Û":("U","circumflex"),"Ü":("U","diaeresis"),"Ç":("C","cedilla")}

def poly(p, pts, rev=False):
    if rev: pts=pts[::-1]
    p.moveTo(pts[0])
    for q in pts[1:]: p.lineTo(q)
    p.closePath()

def rect(p,x,y,w,h,sk=0):
    d=sk*h; poly(p,[(x,y),(x+w,y),(x+w+d,y+h),(x+d,y+h)])

def wedge(p,x,y,w,h,t=28,up=True):
    poly(p,[(x,y),(x+w,y),(x+w-t,y+h),(x+t,y+h)] if up else
          [(x+t,y),(x+w-t,y),(x+w,y+h),(x,y+h)])

def stroke(p,pts,width):
    for a,b in zip(pts,pts[1:]):
        dx=b[0]-a[0]; dy=b[1]-a[1]; L=max(1,math.hypot(dx,dy))
        nx=-dy/L; ny=dx/L; w=width/2
        poly(p,[(a[0]+nx*w,a[1]+ny*w),(b[0]+nx*w,b[1]+ny*w),
                (b[0]-nx*w,b[1]-ny*w),(a[0]-nx*w,a[1]-ny*w)])

def smooth(pts,n=5):
    if len(pts)<3:return pts
    q=[pts[0]]+pts+[pts[-1]]; out=[]
    for i in range(1,len(q)-2):
        p0,p1,p2,p3=q[i-1:i+3]
        for j in range(n):
            t=j/n; t2=t*t; t3=t2*t
            out.append((.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
                        .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t3)))
    out.append(pts[-1]); return out

def arc(p,cx,cy,rx,ry,a0,a1,w,n=28):
    stroke(p,[(cx+rx*math.cos(a0+(a1-a0)*i/n),cy+ry*math.sin(a0+(a1-a0)*i/n)) for i in range(n+1)],w)

def ring(p,cx,cy,rx,ry,t):
    outer=[(cx+rx*math.cos(2*math.pi*i/40),cy+ry*math.sin(2*math.pi*i/40)) for i in range(40)]
    inner=[(cx+(rx-t)*math.cos(2*math.pi*i/40),cy+(ry-t)*math.sin(2*math.pi*i/40)) for i in range(40)]
    poly(p,outer); poly(p,inner,True)

SKELETON={
"A":[(105,40),(190,700),(310,700),(510,40)],"K":[(190,45),(190,700),(500,690),(210,370),(505,45)],
"M":[(90,45),(150,690),(305,390),(465,690),(530,45)],"N":[(100,45),(150,690),(465,80),(515,690)],
"V":[(100,690),(310,45),(520,690)],"W":[(70,690),(180,45),(310,430),(440,45),(550,690)],
"X":[(105,690),(505,45),(250,360),(505,690)],"Y":[(100,690),(310,380),(520,690),(310,350),(300,45)],
"Z":[(95,665),(505,665),(120,80),(505,80)]}

def display(ch,p,clean=False):
    w=96 if not clean else 78
    if ch in SKELETON: stroke(p,SKELETON[ch],w*.92)
    elif ch=="A": pass
    elif ch=="B": rect(p,105,45,90,650,.02); arc(p,175,520,245,180,-math.pi/2,math.pi/2,w); arc(p,175,250,245,180,-math.pi/2,math.pi/2,w)
    elif ch=="C": arc(p,330,380,220,330,math.radians(45),math.radians(315),w); wedge(p,110,665,130,55,30); wedge(p,110,40,130,55,30,False)
    elif ch=="D": rect(p,105,45,90,650,.02); arc(p,175,370,265,325,-math.pi/2,math.pi/2,w)
    elif ch=="E": rect(p,105,45,92,650,.01); wedge(p,160,630,350,70,34); wedge(p,160,345,270,62,30); wedge(p,160,40,350,70,34,False)
    elif ch=="F": rect(p,105,45,92,650,.01); wedge(p,160,630,350,70,34); wedge(p,160,345,270,62,30)
    elif ch=="G": arc(p,330,380,220,330,math.radians(45),math.radians(330),w); stroke(p,[(350,360),(525,360),(525,120)],w)
    elif ch=="H": rect(p,105,45,92,650,.01); rect(p,420,45,92,650,.01); wedge(p,170,350,280,68,24)
    elif ch=="I": wedge(p,120,630,370,70,35); rect(p,260,45,90,650,.02); wedge(p,120,40,370,70,35,False)
    elif ch=="J": wedge(p,170,630,300,70,35); stroke(p,[(420,665),(420,150),(380,70),(260,40),(150,95)],w)
    elif ch=="L": rect(p,105,45,92,650,.01); wedge(p,160,40,350,70,34,False)
    elif ch=="O": ring(p,315,380,220,325,w)
    elif ch=="P": rect(p,105,45,92,650,.01); arc(p,180,520,250,180,-math.pi/2,math.pi/2,w)
    elif ch=="Q": ring(p,300,405,210,300,w); stroke(p,[(385,170),(520,40)],w*.7)
    elif ch=="R": rect(p,105,45,92,650,.01); arc(p,180,520,250,180,-math.pi/2,math.pi/2,w); stroke(p,[(210,360),(505,45)],w*.9)
    elif ch=="S": arc(p,330,540,220,150,math.radians(210),math.radians(30),w); arc(p,300,215,220,150,math.radians(30),math.radians(210),w)
    elif ch=="T": wedge(p,90,630,450,70,36); rect(p,270,45,90,650,.02)
    elif ch=="U": rect(p,105,360,90,335,.01); rect(p,430,360,90,335,.01); arc(p,315,365,220,300,math.pi,2*math.pi,w)

SCRIPT={
"A":[(110,80),(170,650),(300,700),(505,90)],"B":[(125,60),(130,700),(330,650),(220,380),(390,330),(450,130),(260,70)],
"C":[(480,610),(390,700),(180,650),(115,410),(150,150),(390,65),(500,170)],"D":[(125,60),(130,700),(340,680),(480,480),(440,180),(250,80)],
"E":[(460,650),(170,670),(125,400),(420,390),(145,95),(470,70)],"F":[(470,650),(160,670),(130,70),(420,360)],
"G":[(480,620),(390,700),(170,650),(120,350),(250,80),(480,160),(350,330),(510,330)],"H":[(120,60),(135,700),(470,80),(490,700)],
"I":[(150,650),(450,650),(280,610),(250,110),(430,80)],"J":[(150,620),(450,650),(360,130),(270,70),(150,150)],
"K":[(130,70),(150,700),(470,650),(190,370),(500,70)],"L":[(180,680),(130,140),(250,60),(470,80)],
"M":[(100,80),(140,690),(290,350),(350,690),(500,80)],"N":[(110,70),(150,690),(470,90),(490,690)],
"O":[(420,640),(220,700),(120,500),(150,180),(330,70),(480,180),(470,500),(420,640)],"P":[(130,60),(150,700),(360,660),(450,500),(350,380),(170,410)],
"Q":[(420,640),(220,700),(120,500),(150,180),(330,70),(480,180),(470,500),(420,640),(520,40)],"R":[(130,60),(150,700),(360,660),(450,500),(350,380),(170,410),(500,70)],
"S":[(470,620),(390,700),(170,650),(120,470),(400,400),(470,250),(250,100),(120,170)],"T":[(100,650),(480,650),(300,620),(270,80)],
"U":[(130,690),(140,170),(250,80),(410,160),(470,690)],"V":[(100,680),(280,80),(500,680)],"W":[(80,680),(170,80),(300,550),(390,80),(540,680)],
"X":[(120,650),(480,80),(250,350),(500,650)],"Y":[(100,680),(290,380),(500,680),(310,350),(300,70)],"Z":[(100,650),(500,650),(120,80),(500,80)]}

def script(ch,p):
    stroke(p,smooth(SCRIPT[ch.upper()]),46)

def punct(ch,p):
    for s in {".":[(270,40,75,75)],",":[(270,45,75,70),(315,0,45,75)],"!":[(270,165,75,520),(270,40,75,75)],
    "?":[(220,610,170,65),(380,500,70,100),(305,315,70,180),(305,40,70,75)],"-":[(140,355,330,58)],
    "'":[(285,575,65,135)],"/":[(155,45,65,650)],":":[(270,485,75,75),(270,90,75,75)],";":[(270,485,75,75),(300,25,55,105)],
    "(":[(285,90,65,560)],")":[(335,90,65,560)],"&":[(170,350,300,65),(275,150,75,420)]}.get(ch,[]): rect(p,*s)

def build(path,family,weight,kind):
    base=list(string.ascii_uppercase+string.digits)+list(".,!?'-/:;()&"); lower=list(string.ascii_lowercase)
    marks=["acute","grave","circumflex","diaeresis","cedilla"]; extras=list(ACC)+["—","–","€","“","”","’"]
    order=[".notdef","space"]+base+lower+marks+extras; g={}; m={}; cmap={}
    p=TTGlyphPen(None); rect(p,70,0,470,760); g[".notdef"]=p.glyph(); m[".notdef"]=(640,0)
    g["space"]=Glyph(); m["space"]=(290,0); cmap[32]="space"
    for ch in base:
        p=TTGlyphPen(None)
        if ch.isalpha(): (display if kind!="script" else script)(ch,p,clean=(kind=="signal")) if kind!="script" else script(ch,p)
        elif ch.isdigit(): display({"0":"O","1":"I","2":"Z","3":"B","4":"A","5":"S","6":"G","7":"T","8":"B","9":"G"}[ch],p,clean=(kind=="signal"))
        else: punct(ch,p)
        g[ch]=p.glyph(); m[ch]=(590 if kind!="escie" else 565,0); cmap[ord(ch)]=ch
    for ch in lower:
        p=TTGlyphPen(None); (script if kind=="script" else display)(ch,p,clean=(kind=="signal"))
        g[ch]=p.glyph(); m[ch]=(455 if kind=="script" else 450,0); cmap[ord(ch)]=ch
    for mark in marks:
        p=TTGlyphPen(None)
        if mark=="acute": rect(p,270,750,55,125,-.15)
        elif mark=="grave": rect(p,310,750,55,125,.15)
        elif mark=="circumflex": stroke(p,[(230,750),(300,815),(370,750)],40)
        elif mark=="diaeresis": rect(p,220,770,55,55); rect(p,345,770,55,55)
        else: rect(p,295,-70,70,80)
        g[mark]=p.glyph(); m[mark]=(0,0)
    for ch,(base_ch,mark) in ACC.items():
        p=TTGlyphPen(None); (script if kind=="script" else display)(base_ch,p,clean=(kind=="signal"))
        if mark=="acute": rect(p,350,730,45,120,-.12)
        elif mark=="grave": rect(p,370,730,45,120,.12)
        elif mark=="circumflex": stroke(p,[(230,745),(300,805),(370,745)],34)
        elif mark=="diaeresis": rect(p,220,760,50,50); rect(p,350,760,50,50)
        else: rect(p,290,-70,65,75)
        g[ch]=p.glyph(); m[ch]=(450,0); cmap[ord(ch)]=ch
    for ch in ["—","–","€","“","”","’"]:
        p=TTGlyphPen(None); rect(p,95,350,450,55) if ch=="—" else rect(p,135,350,365,50) if ch=="–" else rect(p,225,560,55,120) if ch in "“”" else rect(p,285,570,60,125)
        g[ch]=p.glyph(); m[ch]=(590,0); cmap[ord(ch)]=ch
    fb=FontBuilder(1000,isTTF=True); fb.setupGlyphOrder(order); fb.setupGlyf(g); fb.setupHorizontalMetrics(m)
    fb.setupHorizontalHeader(ascent=900,descent=-200); fb.setupCharacterMap(cmap)
    fb.setupOS2(sTypoAscender=900,sTypoDescender=-200,usWeightClass=weight,usWidthClass=4)
    fb.setupNameTable({"familyName":family,"styleName":"Prototype Pass 2","uniqueFontIdentifier":family+" Prototype Pass 2","fullName":family+" Prototype Pass 2","psName":family.replace(" ","")+"-PrototypePass2"})
    fb.setupPost(); fb.font["post"].formatType=3.0; fb.setupHead(); fb.save(path)

if __name__=="__main__":
    os.makedirs("dist",exist_ok=True)
    build("dist/ESCIE.ttf","ESCIE",800,"escie")
    build("dist/ESCIE-SIGNAL.ttf","ESCIE SIGNAL",600,"signal")
    build("dist/ESCIE-SCRIPT.ttf","ESCIE SCRIPT",400,"script")
