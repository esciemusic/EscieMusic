"""ESCIE typography Pass 7 — solid silhouette cleanup.

Prototype-only. Rebuilds the nine signature anchors with cleaner silhouettes
and fewer overlapping primitives. Production typography remains untouched.
"""

import math
import os
import runpy
from fontTools.pens.transformPen import TransformPen

BASE = os.path.join(os.path.dirname(__file__), "build-fonts-pass2.py")
ns = runpy.run_path(BASE)

poly = ns["poly"]
rect = ns["rect"]
wedge = ns["wedge"]
stroke = ns["stroke"]
arc = ns["arc"]
ring = ns["ring"]
build = ns["build"]

ANCHORS = {"A","C","E","G","I","M","O","R","S","T"}

def signature_pass7(ch, p, clean=False):
    weight = 82 if clean else 88

    if ch == "A":
        # Tall shoulders, compressed apex, and a lower structural crossbar.
        poly(p, [(122,40),(188,700),(304,700),(500,40),(417,40),
                 (365,245),(250,245),(198,40)])
        rect(p,228,225,155,54,.01)
        return

    if ch == "C":
        # Stable open oval; terminals are architectural rather than damaged.
        arc(p,320,380,215 if not clean else 220,325,math.radians(48),
            math.radians(312),weight)
        wedge(p,105,625,120,58,32 if clean else 26)
        wedge(p,105,40,150,58,28 if clean else 34,False)
        return

    if ch == "E":
        rect(p,105,45,88,650,.01)
        wedge(p,155,625,350,68,34)
        wedge(p,155,335,225 if not clean else 255,54,28)
        wedge(p,155,40,350,68,34,False)
        return

    if ch == "G":
        arc(p,320,380,215 if not clean else 220,325,math.radians(48),
            math.radians(318),weight)
        rect(p,365,342,145,60,.01)
        rect(p,445,342,68,245,-.01)
        return

    if ch == "I":
        # Quiet authoritative stem; no decorative serif.
        wedge(p,150,625,350,68,34)
        rect(p,268,45,74,620,.01)
        return

    if ch == "M":
        # Tall outer stems and a deep controlled central descent.
        stroke(p,[(92,45),(145,700),(304,300),(462,700),(528,45)],weight)
        return

    if ch == "O":
        ring(p,315,380,200 if not clean else 208,330,82 if not clean else 76)
        return

    if ch == "R":
        rect(p,108,45,86,650,.01)
        arc(p,180,520,245,180,-math.pi/2,math.pi/2,weight)
        stroke(p,[(205,365),(505,45)],weight*.86)
        return

    if ch == "S":
        # Separate upper/lower masses with a controlled overlap, not texture.
        arc(p,325,545,225,145,math.radians(210),math.radians(22),weight)
        arc(p,300,205,210,155,math.radians(28),math.radians(215),weight)
        return

    if ch == "T":
        wedge(p,85,625,465,72,34 if clean else 38)
        rect(p,274,45,72,620,.01)
        return

    ns["display"](ch,p,clean=clean)

def display_pass7(ch,p,clean=False):
    if ch.islower() and ch.upper().isalpha():
        tp=TransformPen(p,(0.82,0,0,0.68,0,5))
        up=ch.upper()
        if up in ANCHORS:
            signature_pass7(up,tp,clean=clean)
        else:
            ns["display"](up,tp,clean=clean)
        return
    if ch in ANCHORS:
        signature_pass7(ch,p,clean=clean)
    else:
        ns["display"](ch,p,clean=clean)

def build_pass7(path,family,weight,kind):
    old=ns["display"]
    ns["display"]=display_pass7
    try:
        ns["build"](path,family,weight,kind)
    finally:
        ns["display"]=old

if __name__=="__main__":
    OUT=os.path.join(os.path.dirname(__file__),"dist","pass7")
    os.makedirs(OUT,exist_ok=True)
    build_pass7(os.path.join(OUT,"ESCIE.ttf"),"ESCIE",800,"escie")
    build_pass7(os.path.join(OUT,"ESCIE-SIGNAL.ttf"),"ESCIE SIGNAL",600,"signal")
    build_pass7(os.path.join(OUT,"ESCIE-SCRIPT.ttf"),"ESCIE SCRIPT",400,"script")
    print("Generated Pass-7 prototype family in",OUT)
