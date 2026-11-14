"""ESCIE typography Pass 4 — signature glyph refinement.

This is a prototype generator. It reuses the existing self-authored construction
only as infrastructure, then replaces the identity-anchor glyphs with deliberate
letterform constructions before building the three prototype binaries.

No external font outlines are imported.
"""

import math
import os
import runpy

BASE = os.path.join(os.path.dirname(__file__), "build-fonts-pass2.py")
ns = runpy.run_path(BASE)

poly = ns["poly"]
rect = ns["rect"]
wedge = ns["wedge"]
stroke = ns["stroke"]
arc = ns["arc"]
ring = ns["ring"]
build = ns["build"]


def signature(ch, p):
    """Build the identity anchors on the Pass-4 architectural grid."""
    # Shared dimensions keep the anchors related while allowing each glyph
    # to carry its own silhouette.
    if ch == "A":
        # Compressed apex, broad shoulders, slightly lowered crossbar.
        poly(p, [(115, 40), (190, 700), (310, 700), (505, 40),
                 (425, 40), (365, 255), (250, 255), (190, 40)])
        wedge(p, 235, 305, 145, 58, 18)
        return

    if ch == "C":
        # Open vertical oval with unequal, structural terminals.
        arc(p, 320, 380, 215, 325, math.radians(48), math.radians(312), 92)
        wedge(p, 105, 625, 125, 62, 28)
        wedge(p, 105, 38, 155, 62, 36, False)
        return

    if ch == "E":
        # The middle arm is intentionally shorter and offset.
        rect(p, 105, 45, 88, 650, .01)
        wedge(p, 155, 625, 350, 70, 34)
        wedge(p, 155, 335, 235, 58, 24)
        wedge(p, 155, 40, 350, 70, 34, False)
        return

    if ch == "G":
        # Controlled opening and proprietary internal bar.
        arc(p, 320, 380, 215, 325, math.radians(48), math.radians(318), 92)
        wedge(p, 330, 345, 205, 62, 20)
        rect(p, 435, 345, 78, 250, -.02)
        return

    if ch == "M":
        # Deep central descent creates the family signature.
        stroke(p, [(88, 45), (145, 700), (305, 285), (465, 700), (530, 45)], 86)
        return

    if ch == "O":
        # Narrow vertical oval, not a generic circle.
        ring(p, 315, 380, 195, 325, 88)
        return

    if ch == "R":
        # Strong bowl-to-leg transition.
        rect(p, 105, 45, 88, 650, .01)
        arc(p, 180, 520, 245, 180, -math.pi/2, math.pi/2, 92)
        stroke(p, [(205, 370), (505, 45)], 82)
        return

    if ch == "S":
        # Unequal upper/lower tension.
        arc(p, 325, 545, 225, 145, math.radians(210), math.radians(22), 92)
        arc(p, 300, 205, 210, 155, math.radians(28), math.radians(215), 92)
        return

    if ch == "T":
        # Heavy top, narrow authoritative stem.
        wedge(p, 85, 625, 465, 75, 38)
        rect(p, 270, 45, 82, 620, .015)
        return

    # Non-anchor glyphs retain the existing authored prototype construction.
    ns["display"](ch, p, clean=False)


def display_pass4(ch, p, clean=False):
    if ch in {"A", "C", "E", "G", "M", "O", "R", "S", "T"}:
        signature(ch, p)
    else:
        ns["display"](ch, p, clean=clean)


def build_pass4(path, family, weight, kind):
    # Temporarily provide the Pass-4 display constructor to the existing
    # self-authored builder.
    old = ns["display"]
    ns["display"] = display_pass4
    try:
        ns["build"](path, family, weight, kind)
    finally:
        ns["display"] = old


if __name__ == "__main__":
    os.makedirs("dist/pass4", exist_ok=True)
    build_pass4("dist/pass4/ESCIE.ttf", "ESCIE", 800, "escie")
    build_pass4("dist/pass4/ESCIE-SIGNAL.ttf", "ESCIE SIGNAL", 600, "signal")
    build_pass4("dist/pass4/ESCIE-SCRIPT.ttf", "ESCIE SCRIPT", 400, "script")
    print("Generated Pass-4 prototype family in dist/pass4/")
