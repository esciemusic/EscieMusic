"""ESCIE Pass 9 — clean silhouette / anti-noise prototype.
Prototype-only. Production fonts remain untouched.
"""
import math
import os
import runpy
from fontTools.pens.transformPen import TransformPen

BASE = os.path.join(os.path.dirname(__file__), "build-fonts-pass8-authored.py")
ns = runpy.run_path(BASE)

poly = ns["poly"]
rect = ns["rect"]
BASE_DISPLAY = ns["display"]
ANCHORS = set("ACEGIMORST")

def signature_pass9(ch, p, clean=False):
    shapes = {
        "A": [(105,45),(180,700),(300,700),(510,45),(420,45),(360,235),(245,235),(195,45)],
        "C": [(485,620),(425,690),(205,690),(120,600),(120,140),(205,50),(425,50),(485,120),(405,170),(360,125),(225,125),(200,155),(200,585),(225,615),(360,615),(405,570)],
        "E": [(105,45),(105,695),(500,695),(500,610),(200,610),(200,410),(430,410),(430,325),(200,325),(200,130),(500,130),(500,45)],
        "G": [(485,620),(425,690),(205,690),(120,600),(120,140),(205,50),(425,50),(485,120),(405,170),(360,125),(225,125),(200,155),(200,585),(225,615),(355,615),(355,420),(300,420),(300,335),(500,335),(500,620)],
        "M": [(90,45),(145,695),(220,695),(305,340),(390,695),(465,695),(530,45),(445,45),(405,525),(335,245),(275,245),(205,525),(175,45)],
        "R": [(105,45),(105,695),(300,695),(430,610),(430,440),(300,355),(195,355),(195,45),(300,355),(515,45),(430,45),(300,300),(195,300)],
        "S": [(455,625),(390,695),(190,695),(110,620),(110,455),(185,380),(375,360),(395,325),(395,165),(360,125),(215,125),(185,155),(185,245),(110,245),(110,120),(190,45),(395,45),(470,120),(470,285),(395,365),(205,385),(185,420),(185,575),(220,615),(365,615),(395,585),(395,500),(470,500),(470,620)],
    }
    if ch == "I":
        rect(p,125,615,350,80)
        rect(p,260,45,80,570)
        rect(p,125,45,350,80)
        return
    if ch == "T":
        rect(p,85,615,430,80)
        rect(p,260,45,80,570)
        return
    if ch == "O":
        outer = [(310+205*math.cos(2*math.pi*i/48),370+325*math.sin(2*math.pi*i/48)) for i in range(48)]
        inner = [(310+123*math.cos(2*math.pi*i/48),370+243*math.sin(2*math.pi*i/48)) for i in range(48)]
        poly(p, outer)
        poly(p, inner, True)
        return
    poly(p, shapes[ch])

def display_pass9(ch, p, clean=False):
    if ch.islower() and ch.upper().isalpha():
        tp = TransformPen(p, (0.82,0,0,0.68,0,5))
        up = ch.upper()
        if up in ANCHORS:
            signature_pass9(up, tp, clean=clean)
        else:
            BASE_DISPLAY(up, tp, clean=clean)
        return
    if ch in ANCHORS:
        signature_pass9(ch, p, clean=clean)
    else:
        BASE_DISPLAY(ch, p, clean=clean)

def build_pass9(path, family, weight, kind):
    old = ns["display"]
    ns["display"] = display_pass9
    try:
        ns["build"](path, family, weight, kind)
    finally:
        ns["display"] = old

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "dist", "pass9")
    os.makedirs(out, exist_ok=True)
    build_pass9(os.path.join(out, "ESCIE.ttf"), "ESCIE", 800, "escie")
    build_pass9(os.path.join(out, "ESCIE-SIGNAL.ttf"), "ESCIE SIGNAL", 600, "signal")
    build_pass9(os.path.join(out, "ESCIE-SCRIPT.ttf"), "ESCIE SCRIPT", 400, "script")
    print("Generated Pass 9 in", out)
