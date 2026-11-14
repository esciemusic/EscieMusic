"""ESCIE typography Pass 10 — softened authored silhouette.

Prototype-only. Production fonts remain untouched.

Pass 10 keeps Pass 9's clean single-silhouette discipline but removes the
mechanical/pixel feel with controlled curves, softer terminal geometry, and
more human rhythm. No texture, glitch, distress, or decorative horror.
"""
import math
import os
import runpy
from fontTools.pens.transformPen import TransformPen

BASE = os.path.join(os.path.dirname(__file__), "build-fonts-pass9-clean.py")
ns = runpy.run_path(BASE)

poly = ns["poly"]
rect = ns["rect"]
BASE_DISPLAY = ns["display"]
ANCHORS = set("ACEGIMORST")

def ellipse_points(cx, cy, rx, ry, n=96, start=0.0, end=2*math.pi):
    return [(cx + rx*math.cos(start+(end-start)*i/n),
             cy + ry*math.sin(start+(end-start)*i/n)) for i in range(n+1)]

def ring_smooth(p, cx, cy, rx, ry, t):
    outer = ellipse_points(cx, cy, rx, ry)
    inner = ellipse_points(cx, cy, max(1,rx-t), max(1,ry-t))[::-1]
    poly(p, outer)
    poly(p, inner)

def band(p, pts, width):
    # One continuous sampled silhouette; avoids overlapping primitive fragments.
    out=[]; inn=[]
    half=width/2
    for i,(x,y) in enumerate(pts):
        if i == 0:
            dx=pts[1][0]-x; dy=pts[1][1]-y
        elif i == len(pts)-1:
            dx=x-pts[i-1][0]; dy=y-pts[i-1][1]
        else:
            dx=pts[i+1][0]-pts[i-1][0]; dy=pts[i+1][1]-pts[i-1][1]
        L=max(1.0,math.hypot(dx,dy)); nx=-dy/L; ny=dx/L
        out.append((x+nx*half,y+ny*half))
        inn.append((x-nx*half,y-ny*half))
    poly(p,out+inn[::-1])

def signature_pass10(ch, p, clean=False):
    w = 74 if clean else 82

    if ch == "A":
        # Curved shoulders, narrow waist, and a low human crossbar.
        poly(p, [
            (116,44),(168,360),(188,520),(205,690),(302,690),
            (350,525),(383,360),(506,44),(416,44),(360,225),
            (246,225),(200,44)
        ])
        poly(p, [(225,214),(382,214),(372,267),(236,267)])
        return

    if ch == "C":
        # Single continuous curved body with unequal terminals.
        pts = ellipse_points(318,378,218,326,128,math.radians(48),math.radians(312))
        band(p, pts, w)
        return

    if ch == "E":
        # Softer arm ends without decorative serifs.
        rect(p,108,46,84,648,.008)
        poly(p,[(155,620),(492,620),(500,680),(155,680)])
        poly(p,[(155,333),(430,333),(432,388),(155,388)])
        poly(p,[(155,46),(500,46),(490,108),(155,108)])
        return

    if ch == "G":
        pts = ellipse_points(318,378,218,326,128,math.radians(48),math.radians(318))
        band(p, pts, w)
        poly(p,[(350,337),(505,337),(505,397),(350,397)])
        poly(p,[(445,337),(505,337),(505,575),(447,575)])
        return

    if ch == "I":
        # Quiet stem with gently softened cap proportions.
        poly(p,[(145,625),(495,625),(476,695),(164,695)])
        poly(p,[(270,45),(342,45),(338,665),(267,665)])
        poly(p,[(145,45),(495,45),(476,115),(164,115)])
        return

    if ch == "M":
        # Deep central descent, but with a less rigid outer rhythm.
        band(p,[(92,45),(145,700),(305,315),(465,700),(528,45)],w)
        return

    if ch == "O":
        ring_smooth(p,315,380,208,330,76)
        return

    if ch == "R":
        rect(p,108,46,84,648,.008)
        pts = ellipse_points(184,520,245,180,96,-math.pi/2,math.pi/2)
        band(p, pts, w)
        band(p,[(205,365),(500,46)],w*.84)
        return

    if ch == "S":
        upper = ellipse_points(326,544,222,145,72,math.radians(210),math.radians(22))
        lower = ellipse_points(300,205,210,155,72,math.radians(28),math.radians(215))
        band(p,upper,w)
        band(p,lower,w)
        return

    if ch == "T":
        poly(p,[(88,625),(518,625),(505,695),(101,695)])
        poly(p,[(274,45),(346,45),(342,665),(270,665)])
        return

    BASE_DISPLAY(ch,p,clean=clean)

def display_pass10(ch,p,clean=False):
    if ch.islower() and ch.upper().isalpha():
        tp=TransformPen(p,(0.82,0,0,0.68,0,5))
        up=ch.upper()
        if up in ANCHORS:
            signature_pass10(up,tp,clean=clean)
        else:
            BASE_DISPLAY(up,tp,clean=clean)
        return
    if ch in ANCHORS:
        signature_pass10(ch,p,clean=clean)
    else:
        BASE_DISPLAY(ch,p,clean=clean)

def build_pass10(path,family,weight,kind):
    old=ns["display"]
    ns["display"]=display_pass10
    try:
        ns["build"](path,family,weight,kind)
    finally:
        ns["display"]=old

if __name__=="__main__":
    OUT=os.path.join(os.path.dirname(__file__),"dist","pass10")
    os.makedirs(OUT,exist_ok=True)
    build_pass10(os.path.join(OUT,"ESCIE.ttf"),"ESCIE",800,"escie")
    build_pass10(os.path.join(OUT,"ESCIE-SIGNAL.ttf"),"ESCIE SIGNAL",600,"signal")
    build_pass10(os.path.join(OUT,"ESCIE-SCRIPT.ttf"),"ESCIE SCRIPT",400,"script")
    print("Generated Pass 10 in",OUT)
