"""ESCIE typography Pass 11 — restrained human Gothic.

Prototype-only. Builds from Pass 9's clean silhouette and corrects Pass 10's
over-softened construction. The goal is not roundness; it is authored,
human Gothic structure with controlled curves and non-mechanical terminals.
Production fonts remain untouched.
"""
import math, os, runpy
from fontTools.pens.transformPen import TransformPen

BASE=os.path.join(os.path.dirname(__file__),"build-fonts-pass9-clean.py")
ns=runpy.run_path(BASE)
poly=ns["poly"]; rect=ns["rect"]; BASE_DISPLAY=ns["display"]
ANCHORS=set("ACEGIMORST")

def ellipse(cx,cy,rx,ry,n=64,a0=0,a1=2*math.pi):
    return [(cx+rx*math.cos(a0+(a1-a0)*i/n),
             cy+ry*math.sin(a0+(a1-a0)*i/n)) for i in range(n+1)]

def signature_pass11(ch,p,clean=False):
    # Keep Pass 9's strong silhouette language; refine only the visual roughness.
    if ch=="A":
        poly(p,[(112,44),(184,700),(302,700),(510,44),(420,44),(360,232),(246,232),(198,44)])
        # Slightly tapered, lower crossbar instead of a rigid rectangular bar.
        poly(p,[(224,215),(382,215),(372,267),(236,267)])
        return
    if ch=="C":
        # Smooth body; pointed but calm terminals.
        ns["arc"](p,318,378,218,326,math.radians(48),math.radians(312),78 if clean else 84)
        poly(p,[(105,625),(222,625),(204,570),(105,575)])
        poly(p,[(105,75),(204,80),(222,25),(105,25)])
        return
    if ch=="E":
        # Pass 9 silhouette retained; terminal ends receive a restrained Gothic taper.
        rect(p,105,45,88,650,.01)
        poly(p,[(155,625),(500,625),(486,690),(155,690)])
        poly(p,[(155,335),(430,335),(430,390),(155,390)])
        poly(p,[(155,45),(500,45),(486,110),(155,110)])
        return
    if ch=="G":
        ns["arc"](p,318,378,218,326,math.radians(48),math.radians(316),78 if clean else 84)
        poly(p,[(350,337),(505,337),(505,395),(350,395)])
        poly(p,[(448,337),(505,337),(505,575),(450,575)])
        return
    if ch=="I":
        poly(p,[(125,620),(475,620),(455,695),(145,695)])
        poly(p,[(260,45),(340,45),(336,665),(264,665)])
        poly(p,[(125,45),(475,45),(455,120),(145,120)])
        return
    if ch=="M":
        # Deep central descent with slightly less rigid outer stems.
        ns["stroke"](p,[(92,45),(145,700),(304,315),(465,700),(528,45)],78 if clean else 84)
        return
    if ch=="O":
        # Smooth, narrow oval with a stable counter.
        outer=ellipse(315,380,208,330,72)
        inner=ellipse(315,380,132,254,72)[::-1]
        poly(p,outer); poly(p,inner)
        return
    if ch=="R":
        rect(p,108,45,86,650,.01)
        ns["arc"](p,180,520,245,180,-math.pi/2,math.pi/2,78 if clean else 84)
        ns["stroke"](p,[(205,365),(505,45)],70 if clean else 76)
        return
    if ch=="S":
        # Continuous visual rhythm, but retain the two-mass authored tension.
        ns["arc"](p,325,545,225,145,math.radians(210),math.radians(22),78 if clean else 84)
        ns["arc"](p,300,205,210,155,math.radians(28),math.radians(215),78 if clean else 84)
        return
    if ch=="T":
        poly(p,[(85,625),(515,625),(500,695),(100,695)])
        poly(p,[(270,45),(346,45),(342,665),(270,665)])
        return
    BASE_DISPLAY(ch,p,clean=clean)

def display_pass11(ch,p,clean=False):
    if ch.islower() and ch.upper().isalpha():
        tp=TransformPen(p,(0.82,0,0,0.68,0,5))
        up=ch.upper()
        if up in ANCHORS: signature_pass11(up,tp,clean=clean)
        else: BASE_DISPLAY(up,tp,clean=clean)
        return
    if ch in ANCHORS: signature_pass11(ch,p,clean=clean)
    else: BASE_DISPLAY(ch,p,clean=clean)

def build_pass11(path,family,weight,kind):
    old=ns["display"]; ns["display"]=display_pass11
    try: ns["build"](path,family,weight,kind)
    finally: ns["display"]=old

if __name__=="__main__":
    out=os.path.join(os.path.dirname(__file__),"dist","pass11")
    os.makedirs(out,exist_ok=True)
    build_pass11(os.path.join(out,"ESCIE.ttf"),"ESCIE",800,"escie")
    build_pass11(os.path.join(out,"ESCIE-SIGNAL.ttf"),"ESCIE SIGNAL",600,"signal")
    build_pass11(os.path.join(out,"ESCIE-SCRIPT.ttf"),"ESCIE SCRIPT",400,"script")
    print("Generated Pass 11 in",out)
