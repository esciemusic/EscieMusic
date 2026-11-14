"""ESCIE typography Pass 12 — filled curved silhouettes.

Prototype-only. Production fonts remain untouched.
Pass 12 removes the remaining stroke-band/self-intersection risk from Pass 11.
Curved anchors are built as single filled contours (outer arc + inner arc),
not overlapping stroke fragments.
"""
import math, os, runpy
from fontTools.pens.transformPen import TransformPen
BASE=os.path.join(os.path.dirname(__file__),"build-fonts-pass9-clean.py")
ns=runpy.run_path(BASE)
poly=ns["poly"]; rect=ns["rect"]; BASE_DISPLAY=ns["display"]
ANCHORS=set("ACEGIMORST")

def arc_band(cx,cy,rxo,ryo,rxi,ryi,a0,a1,n=64):
    outer=[(cx+rxo*math.cos(a0+(a1-a0)*i/n),cy+ryo*math.sin(a0+(a1-a0)*i/n)) for i in range(n+1)]
    inner=[(cx+rxi*math.cos(a1-(a1-a0)*i/n),cy+ryi*math.sin(a1-(a1-a0)*i/n)) for i in range(n+1)]
    return outer+inner

def ellipse(cx,cy,rx,ry,n=72):
    return [(cx+rx*math.cos(2*math.pi*i/n),cy+ry*math.sin(2*math.pi*i/n)) for i in range(n)]

def signature_pass12(ch,p,clean=False):
    if ch=="A":
        poly(p,[(112,44),(184,700),(302,700),(510,44),(420,44),(360,232),(246,232),(198,44)])
        poly(p,[(224,215),(382,215),(372,267),(236,267)])
    elif ch=="C":
        poly(p,arc_band(318,378,218,326,136,244,math.radians(48),math.radians(312)))
    elif ch=="E":
        rect(p,105,45,88,650,.01)
        poly(p,[(155,625),(500,625),(486,690),(155,690)])
        poly(p,[(155,335),(430,335),(430,390),(155,390)])
        poly(p,[(155,45),(500,45),(486,110),(155,110)])
    elif ch=="G":
        poly(p,arc_band(318,378,218,326,136,244,math.radians(48),math.radians(316)))
        poly(p,[(350,337),(505,337),(505,395),(350,395)])
        poly(p,[(448,337),(505,337),(505,575),(450,575)])
    elif ch=="I":
        poly(p,[(125,620),(475,620),(455,695),(145,695)])
        poly(p,[(260,45),(340,45),(336,665),(264,665)])
        poly(p,[(125,45),(475,45),(455,120),(145,120)])
    elif ch=="M":
        # One filled silhouette assembled from a non-self-crossing outline.
        poly(p,[(90,45),(145,700),(220,700),(305,350),(390,700),(465,700),(530,45),(445,45),(405,515),(335,245),(275,245),(205,515),(175,45)])
    elif ch=="O":
        poly(p,ellipse(315,380,208,330))
        poly(p,ellipse(315,380,132,254)[::-1])
    elif ch=="R":
        rect(p,108,45,86,650,.01)
        poly(p,arc_band(184,520,245,180,160,95,-math.pi/2,math.pi/2))
        poly(p,[(205,365),(505,45),(438,45),(205,305)])
    elif ch=="S":
        poly(p,arc_band(325,545,225,145,145,82,math.radians(210),math.radians(22)))
        poly(p,arc_band(300,205,210,155,132,82,math.radians(28),math.radians(215)))
    elif ch=="T":
        poly(p,[(85,625),(515,625),(500,695),(100,695)])
        poly(p,[(270,45),(346,45),(342,665),(270,665)])
    else:
        BASE_DISPLAY(ch,p,clean=clean)

def display_pass12(ch,p,clean=False):
    if ch.islower() and ch.upper().isalpha():
        tp=TransformPen(p,(0.82,0,0,0.68,0,5))
        up=ch.upper()
        if up in ANCHORS: signature_pass12(up,tp,clean=clean)
        else: BASE_DISPLAY(up,tp,clean=clean)
    elif ch in ANCHORS: signature_pass12(ch,p,clean=clean)
    else: BASE_DISPLAY(ch,p,clean=clean)

def build_pass12(path,family,weight,kind):
    old=ns["display"]; ns["display"]=display_pass12
    try: ns["build"](path,family,weight,kind)
    finally: ns["display"]=old

if __name__=="__main__":
    out=os.path.join(os.path.dirname(__file__),"dist","pass12"); os.makedirs(out,exist_ok=True)
    build_pass12(os.path.join(out,"ESCIE.ttf"),"ESCIE",800,"escie")
    build_pass12(os.path.join(out,"ESCIE-SIGNAL.ttf"),"ESCIE SIGNAL",600,"signal")
    build_pass12(os.path.join(out,"ESCIE-SCRIPT.ttf"),"ESCIE SCRIPT",400,"script")
    print("Generated Pass 12 in",out)
