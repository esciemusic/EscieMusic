"""Build the original ESCIE prototype family.

This source is intentionally geometric and self-authored. It does not import or
derive glyph outlines from Angel Wish, Chopin Script, or another commercial font.

Outputs:
  dist/ESCIE.ttf
  dist/ESCIE-SIGNAL.ttf
  dist/ESCIE-SCRIPT.ttf

These remain prototype faces until identity, readability, provenance, and glyph
coverage review is complete.
"""
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables._g_l_y_f import Glyph
import os, string

# The prototype uses a compact architectural grid. Final art direction will
# replace these primitives after the specimen review.
PATTERNS = {
    "A":["01110","10001","10001","11111","10001","10001","10001"],
    "B":["11110","10001","10001","11110","10001","10001","11110"],
    "C":["01111","10000","10000","10000","10000","10000","01111"],
    "D":["11110","10001","10001","10001","10001","10001","11110"],
    "E":["11111","10000","10000","11110","10000","10000","11111"],
    "F":["11111","10000","10000","11110","10000","10000","10000"],
    "G":["01111","10000","10000","10111","10001","10001","01111"],
    "H":["10001","10001","10001","11111","10001","10001","10001"],
    "I":["11111","00100","00100","00100","00100","00100","11111"],
    "J":["00111","00010","00010","00010","10010","10010","01100"],
    "K":["10001","10010","10100","11000","10100","10010","10001"],
    "L":["10000","10000","10000","10000","10000","10000","11111"],
    "M":["10001","11011","10101","10101","10001","10001","10001"],
    "N":["10001","11001","10101","10011","10001","10001","10001"],
    "O":["01110","10001","10001","10001","10001","10001","01110"],
    "P":["11110","10001","10001","11110","10000","10000","10000"],
    "Q":["01110","10001","10001","10001","10101","10010","01101"],
    "R":["11110","10001","10001","11110","10100","10010","10001"],
    "S":["01111","10000","10000","01110","00001","00001","11110"],
    "T":["11111","00100","00100","00100","00100","00100","00100"],
    "U":["10001","10001","10001","10001","10001","10001","01110"],
    "V":["10001","10001","10001","10001","10001","01010","00100"],
    "W":["10001","10001","10001","10101","10101","10101","01010"],
    "X":["10001","10001","01010","00100","01010","10001","10001"],
    "Y":["10001","10001","01010","00100","00100","00100","00100"],
    "Z":["11111","00001","00010","00100","01000","10000","11111"],
}

ACCENTS = {
    "é":("e","acute"), "è":("e","grave"), "ê":("e","circumflex"), "ë":("e","diaeresis"),
    "à":("a","grave"), "â":("a","circumflex"), "ä":("a","diaeresis"),
    "î":("i","circumflex"), "ï":("i","diaeresis"), "ô":("o","circumflex"), "ö":("o","diaeresis"),
    "ù":("u","grave"), "û":("u","circumflex"), "ü":("u","diaeresis"), "ç":("c","cedilla"),
    "É":("E","acute"), "È":("E","grave"), "Ê":("E","circumflex"), "Ë":("E","diaeresis"),
    "À":("A","grave"), "Â":("A","circumflex"), "Ä":("A","diaeresis"),
    "Î":("I","circumflex"), "Ï":("I","diaeresis"), "Ô":("O","circumflex"), "Ö":("O","diaeresis"),
    "Ù":("U","grave"), "Û":("U","circumflex"), "Ü":("U","diaeresis"), "Ç":("C","cedilla"),
}

def poly(pen, points):
    pen.moveTo(points[0])
    for point in points[1:]:
        pen.lineTo(point)
    pen.closePath()

def rect(pen, x, y, w, h, skew=0):
    d = skew * h
    poly(pen, [(x,y),(x+w,y),(x+w+d,y+h),(x+d,y+h)])

def pattern(pen, ch, stroke, skew, scale=1.0, dx=0, dy=0, damage=False):
    grid = PATTERNS[ch.upper()]
    cell = 112 * scale
    for row, values in enumerate(grid):
        for col, value in enumerate(values):
            if value == "1":
                rect(pen, dx+80*scale+col*cell, dy+60*scale+(6-row)*100*scale,
                     cell*.82, stroke*scale, skew)
    if damage and ch.upper() in "EFKMRSTZ":
        rect(pen, dx+(80+2.1*112)*scale, dy+405*scale,
             31*scale, stroke*.35*scale, skew)

def build(path, family, weight, stroke, skew, narrow, damaged):
    base = list(string.ascii_uppercase + string.digits) + list(".,!?'-/:;()&")
    lower = list(string.ascii_lowercase)
    marks = ["acute","grave","circumflex","diaeresis","cedilla"]
    extras = list(ACCENTS) + ["—","–","€","“","”","’"]
    order = [".notdef","space"] + base + lower + marks + extras

    glyphs, metrics, cmap = {}, {}, {}
    pen = TTGlyphPen(None)
    poly(pen, [(80,0),(500,0),(500,700),(80,700)])
    glyphs[".notdef"] = pen.glyph()
    metrics[".notdef"] = (620,0)
    glyphs["space"] = Glyph()
    metrics["space"] = (300,0)

    for ch in base:
        pen = TTGlyphPen(None)
        if ch in PATTERNS:
            pattern(pen, ch, stroke, skew, narrow, 0, 0, damaged)
        else:
            for spec in {
                ".":[(260,50,100,100)], ",":[(260,55,100,85),(320,10,60,70)],
                "!":[(270,180,90,500),(270,50,90,90)],
                "?":[(220,600,180,80),(390,500,80,110),(310,300,80,180),(310,50,80,100)],
                "-":[(150,350,320,80)], "'":[(270,570,80,150)], "/":[(150,60,80,650)],
                ":":[(260,480,90,90),(260,80,90,90)], ";":[(260,480,90,90),(300,20,60,110)],
                "(":[(270,100,70,550)], ")":[(340,100,70,550)], "&":[(170,300,300,80),(270,180,90,430)]
            }.get(ch, []):
                rect(pen, *spec, skew=skew)
        glyphs[ch] = pen.glyph()
        metrics[ch] = (int(620*narrow),0)
        cmap[ord(ch)] = ch

    for ch in lower:
        pen = TTGlyphPen(None)
        pattern(pen, ch, stroke, skew, .78*narrow, 55, 25, damaged)
        glyphs[ch] = pen.glyph()
        metrics[ch] = (int(484*narrow),0)
        cmap[ord(ch)] = ch

    for mark in marks:
        pen = TTGlyphPen(None)
        if mark == "acute": rect(pen,260,760,70,140,skew)
        elif mark == "grave": rect(pen,300,760,70,140,-skew)
        elif mark == "circumflex":
            rect(pen,210,740,55,120,skew); rect(pen,325,740,55,120,-skew)
        elif mark == "diaeresis":
            rect(pen,220,760,60,60,skew); rect(pen,340,760,60,60,skew)
        else: rect(pen,300,-70,80,80,skew)
        glyphs[mark] = pen.glyph()
        metrics[mark] = (0,0)

    for ch, (base_ch, mark) in ACCENTS.items():
        pen = TTGlyphPen(None)
        scale = .78 if ch.islower() else 1
        dx = 55 if ch.islower() else 0
        dy = 25 if ch.islower() else 0
        pattern(pen, base_ch, stroke, skew, scale*narrow, dx, dy, damaged)
        glyphs[ch] = pen.glyph()
        metrics[ch] = metrics[base_ch]
        cmap[ord(ch)] = ch

    for ch in ["—","–","€","“","”","’"]:
        pen = TTGlyphPen(None)
        if ch == "—": rect(pen,100,350,450,70,skew)
        elif ch == "–": rect(pen,140,350,320,60,skew)
        elif ch == "€":
            rect(pen,180,520,300,55,skew); rect(pen,180,340,300,55,skew); rect(pen,180,160,300,55,skew)
        elif ch in "“”":
            rect(pen,220,560,60,120,skew); rect(pen,340,560,60,120,skew)
        else: rect(pen,280,570,70,130,skew)
        glyphs[ch] = pen.glyph()
        metrics[ch] = (600,0)
        cmap[ord(ch)] = ch

    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=900, descent=-200)
    fb.setupCharacterMap(cmap)
    fb.setupOS2(sTypoAscender=900, sTypoDescender=-200, usWeightClass=weight, usWidthClass=4)
    fb.setupNameTable({
        "familyName": family, "styleName": "Prototype",
        "uniqueFontIdentifier": family+" Prototype",
        "fullName": family+" Prototype",
        "psName": family.replace(" ","")+"-Prototype"
    })
    fb.setupPost()
    fb.font["post"].formatType = 3.0
    fb.setupHead()
    fb.save(path)

if __name__ == "__main__":
    os.makedirs("dist", exist_ok=True)
    build("dist/ESCIE.ttf", "ESCIE", 800, 110, .03, .88, True)
    build("dist/ESCIE-SIGNAL.ttf", "ESCIE SIGNAL", 600, 70, .01, 1, False)
    build("dist/ESCIE-SCRIPT.ttf", "ESCIE SCRIPT", 400, 45, .12, .92, True)
