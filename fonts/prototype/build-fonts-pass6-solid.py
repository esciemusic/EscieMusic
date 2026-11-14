"""ESCIE typography Pass 6 — solid silhouette cleanup.

Prototype-only. Rebuilds the nine signature anchors with cleaner silhouettes
and fewer overlapping primitives. Production typography remains untouched.
"""

import math
import os
import runpy

BASE = os.path.join(os.path.dirname(__file__), "build-fonts-pass5-family.py")
ns = runpy.run_path(BASE)

poly = ns["poly"]
rect = ns["rect"]
wedge = ns["wedge"]
stroke = ns["stroke"]
arc = ns["arc"]
ring = ns["ring"]
build = ns["build"]

ANCHORS = {"A","C","E","G","M","O","R","S","T"}

def signature_pass6(ch, p, clean=False):
    weight = 82 if clean else 88

    if ch == "A":
        # Outer silhouette + deliberate counter. No crossed polygons.
        poly(p, [(105,40),(190,700),(275,700),(310,520),(350,520),
                 (390,700),(505,40),(420,40),(365,250),(250,250),(190,40)])
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

    if ch == "M":
        stroke(p,[(92,45),(145,700),(305,275),(465,700),(528,45)],weight)
        return

    if ch == "O":
        ring(p,315,380,195 if not clean else 205,325,86 if not clean else 80)
        return

    if ch == "R":
        rect(p,105,45,88,650,.01)
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
        rect(p,275,45,74,620,.01)
        return

    ns["display"](ch,p,clean=clean)

def display_pass6(ch,p,clean=False):
    if ch in ANCHORS:
        signature_pass6(ch,p,clean=clean)
    else:
        ns["display"](ch,p,clean=clean)

def build_pass6(path,family,weight,kind):
    old=ns["display"]
    ns["display"]=display_pass6
    try:
        ns["build"](path,family,weight,kind)
    finally:
        ns["display"]=old

if __name__=="__main__":
    os.makedirs("dist/pass6",exist_ok=True)
    build_pass6("dist/pass6/ESCIE.ttf","ESCIE",800,"escie")
    build_pass6("dist/pass6/ESCIE-SIGNAL.ttf","ESCIE SIGNAL",600,"signal")
    build_pass6("dist/pass6/ESCIE-SCRIPT.ttf","ESCIE SCRIPT",400,"script")
    print("Generated Pass-6 prototype family in dist/pass6/")
