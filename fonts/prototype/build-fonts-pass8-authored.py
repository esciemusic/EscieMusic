"""ESCIE typography Pass 8 — authored letterform refinement.

Prototype-only. Builds on Pass 7 and moves the identity from "constructed"
to "authored": asymmetry is placed in terminals, joins, counters, and rhythm,
not as damage or texture. Production typography remains untouched.
"""

import math
import os
import runpy
from fontTools.pens.transformPen import TransformPen

BASE = os.path.join(os.path.dirname(__file__), "build-fonts-pass7-gothic.py")
ns = runpy.run_path(BASE)

poly = ns["poly"]
rect = ns["rect"]
wedge = ns["wedge"]
stroke = ns["stroke"]
arc = ns["arc"]
ring = ns["ring"]

ANCHORS = {"A","C","E","G","I","M","O","R","S","T"}
BASE_DISPLAY = ns["display"]

def signature_pass8(ch, p, clean=False):
    weight = 80 if clean else 86

    if ch == "A":
        # Slightly offset shoulders and a deliberately low, structural crossbar.
        poly(p, [(118,42),(183,700),(301,700),(505,42),(420,42),
                 (368,238),(246,232),(198,42)])
        poly(p, [(225,214),(382,214),(371,267),(235,267)])
        return

    if ch == "C":
        # Unequal terminals create authorship without distressed edges.
        arc(p,318,378,218,326,math.radians(49),math.radians(309),weight)
        wedge(p,102,624,126,62,31,True)
        wedge(p,108,42,154,60,27,False)
        return

    if ch == "E":
        rect(p,104,44,88,652,.01)
        wedge(p,154,625,356,70,35,True)
        wedge(p,154,337,238,51,26,True)
        wedge(p,154,40,352,69,34,False)
        return

    if ch == "G":
        arc(p,318,378,219,326,math.radians(49),math.radians(316),weight)
        rect(p,357,339,151,58,.01)
        poly(p, [(440,338),(510,338),(510,590),(447,590)])
        return

    if ch == "I":
        wedge(p,146,625,354,68,34,True)
        poly(p, [(270,46),(345,46),(339,664),(267,664)])
        return

    if ch == "M":
        # Unequal inner descents keep the silhouette severe but human.
        stroke(p,[(90,44),(143,700),(299,314),(465,700),(531,44)],weight)
        return

    if ch == "O":
        ring(p,314,379,202,330,78)
        return

    if ch == "R":
        rect(p,106,44,87,652,.01)
        arc(p,181,520,246,181,-math.pi/2,math.pi/2,weight)
        stroke(p,[(205,365),(501,44)],weight*.84)
        return

    if ch == "S":
        # Two related masses with a slightly different tension at the join.
        arc(p,325,544,224,145,math.radians(211),math.radians(22),weight)
        arc(p,299,205,211,156,math.radians(29),math.radians(214),weight)
        return

    if ch == "T":
        wedge(p,82,625,470,72,35,True)
        poly(p, [(274,44),(348,44),(342,665),(270,665)])
        return

    ns["display"](ch,p,clean=clean)

def display_pass8(ch,p,clean=False):
    if ch.islower() and ch.upper().isalpha():
        tp=TransformPen(p,(0.82,0,0,0.68,0,5))
        up=ch.upper()
        if up in ANCHORS:
            signature_pass8(up,tp,clean=clean)
        else:
            BASE_DISPLAY(up,tp,clean=clean)
        return
    if ch in ANCHORS:
        signature_pass8(ch,p,clean=clean)
    else:
        ns["display"](ch,p,clean=clean)

def build_pass8(path,family,weight,kind):
    old=ns["display"]
    ns["display"]=display_pass8
    try:
        ns["build"](path,family,weight,kind)
    finally:
        ns["display"]=old

if __name__=="__main__":
    OUT=os.path.join(os.path.dirname(__file__),"dist","pass8")
    os.makedirs(OUT,exist_ok=True)
    build_pass8(os.path.join(OUT,"ESCIE.ttf"),"ESCIE",800,"escie")
    build_pass8(os.path.join(OUT,"ESCIE-SIGNAL.ttf"),"ESCIE SIGNAL",600,"signal")
    build_pass8(os.path.join(OUT,"ESCIE-SCRIPT.ttf"),"ESCIE SCRIPT",400,"script")
    print("Generated Pass-8 prototype family in",OUT)
