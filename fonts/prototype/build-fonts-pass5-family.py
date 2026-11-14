"""ESCIE typography Pass 5 — family refinement.

Prototype-only generator. Pass 5 keeps the Pass 4 signature construction for ESCIE,
adds a controlled operational variant for SIGNAL, and fixes lowercase/accent
construction so the prototype family can actually be judged as a usable type family.

No external font outlines are imported.
"""

import math
import os
import runpy
from fontTools.pens.transformPen import TransformPen

BASE = os.path.join(os.path.dirname(__file__), "build-fonts-pass4-signature.py")
ns = runpy.run_path(BASE)

poly = ns["poly"]
rect = ns["rect"]
wedge = ns["wedge"]
stroke = ns["stroke"]
arc = ns["arc"]
ring = ns["ring"]

ANCHORS = {"A", "C", "E", "G", "M", "O", "R", "S", "T"}


def signature_pass5(ch, p, clean=False):
    """Pass-5 identity anchors with a cleaner operational SIGNAL state."""
    if ch == "A":
        poly(p, [(115, 40), (190, 700), (310, 700), (505, 40),
                 (425, 40), (365, 255), (250, 255), (190, 40)])
        wedge(p, 235, 305, 145, 58, 18 if not clean else 24)
        return
    if ch == "C":
        arc(p, 320, 380, 215 if not clean else 220, 325,
            math.radians(48), math.radians(312), 92 if not clean else 86)
        wedge(p, 105, 625, 125, 62, 28 if not clean else 32)
        wedge(p, 105, 38, 155, 62, 36 if not clean else 30, False)
        return
    if ch == "E":
        rect(p, 105, 45, 88, 650, .01)
        wedge(p, 155, 625, 350, 70, 34)
        wedge(p, 155, 335, 235 if not clean else 265, 58, 24)
        wedge(p, 155, 40, 350, 70, 34, False)
        return
    if ch == "G":
        arc(p, 320, 380, 215, 325, math.radians(48),
            math.radians(318), 92 if not clean else 84)
        wedge(p, 330, 345, 205, 62, 20 if not clean else 26)
        rect(p, 435, 345, 78, 250, -.02)
        return
    if ch == "M":
        stroke(p, [(88, 45), (145, 700), (305, 285 if not clean else 315),
                   (465, 700), (530, 45)], 86 if not clean else 82)
        return
    if ch == "O":
        ring(p, 315, 380, 195 if not clean else 205, 325,
             88 if not clean else 82)
        return
    if ch == "R":
        rect(p, 105, 45, 88, 650, .01)
        arc(p, 180, 520, 245, 180, -math.pi/2, math.pi/2,
            92 if not clean else 86)
        stroke(p, [(205, 370), (505, 45)], 82 if not clean else 76)
        return
    if ch == "S":
        upper = 92 if not clean else 86
        lower = 92 if not clean else 86
        arc(p, 325, 545, 225, 145, math.radians(210),
            math.radians(22), upper)
        arc(p, 300, 205, 210, 155, math.radians(28),
            math.radians(215), lower)
        return
    if ch == "T":
        wedge(p, 85, 625, 465, 75, 38 if not clean else 34)
        rect(p, 270, 45, 82, 620, .015)
        return
    ns["display"](ch, p, clean=clean)


def display_pass5(ch, p, clean=False):
    # Lowercase is a deliberate x-height version of the uppercase family.
    # This keeps SIGNAL usable in navigation/metadata and fixes accent bases.
    if ch.islower() and ch.upper() in ANCHORS.union(set("BDFHIJKLNPQUVWXYZ")):
        up = ch.upper()
        tp = TransformPen(p, (0.82, 0, 0, 0.68, 0, 5))
        if up in ANCHORS:
            signature_pass5(up, tp, clean=clean)
        else:
            ns["display"](up, tp, clean=clean)
        return
    if ch in ANCHORS:
        signature_pass5(ch, p, clean=clean)
    else:
        ns["display"](ch, p, clean=clean)


def build_pass5(path, family, weight, kind):
    old = ns["display"]
    ns["display"] = display_pass5
    try:
        ns["build"](path, family, weight, kind)
    finally:
        ns["display"] = old


if __name__ == "__main__":
    os.makedirs("dist/pass5", exist_ok=True)
    build_pass5("dist/pass5/ESCIE.ttf", "ESCIE", 800, "escie")
    build_pass5("dist/pass5/ESCIE-SIGNAL.ttf", "ESCIE SIGNAL", 600, "signal")
    build_pass5("dist/pass5/ESCIE-SCRIPT.ttf", "ESCIE SCRIPT", 400, "script")
    print("Generated Pass-5 prototype family in dist/pass5/")
