from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

UPM = 1000
ASCENT = 800
DESCENT = -200
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "release-candidate"
OUT.mkdir(exist_ok=True)


def path(commands):
    pen = TTGlyphPen(None)
    contour_open = False
    for command, pts in commands:
        if command == "M":
            if contour_open:
                pen.closePath()
            pen.moveTo(pts)
            contour_open = True
        elif command == "L":
            pen.lineTo(pts)
        elif command == "Q":
            pen.qCurveTo(*pts)
        elif command == "C":
            pen.curveTo(*pts)
        elif command == "Z":
            if contour_open:
                pen.closePath()
                contour_open = False
    if contour_open:
        pen.closePath()
    return pen.glyph()


def ellipse(cx, cy, rx, ry, n=24):
    import math
    pts = [
        (cx + rx * math.cos(2 * math.pi * i / n),
         cy + ry * math.sin(2 * math.pi * i / n))
        for i in range(n)
    ]
    return [("M", pts[0]), *[("L", p) for p in pts[1:]], ("Z", ())]


def glyph_commands(name):
    if name == "oju":
        return [
            ("M", (130, 500)), ("Q", ((245, 745), (500, 500))),
            ("Q", ((755, 255), (870, 500))), ("Q", ((755, 745), (500, 500))),
            ("Q", ((245, 255), (130, 500))), ("Z", ()),
            ("M", (425, 500)), ("Q", ((500, 595), (575, 500))),
            ("Q", ((500, 405), (425, 500))), ("Z", ()),
        ]
    if name == "maya-speech":
        return [
            ("M", (135, 500)), ("Q", ((205, 590), (300, 535))),
            ("Q", ((385, 485), (455, 545))), ("Q", ((555, 635), (620, 520))),
            ("Q", ((705, 370), (600, 295))), ("Q", ((510, 235), (430, 345))),
            ("Q", ((305, 450), (135, 500))), ("Z", ()),
            ("M", (155, 470)), ("Q", ((205, 425), (255, 430))),
            ("Q", ((230, 470), (205, 505))), ("Q", ((175, 505), (155, 470))),
            ("Z", ()),
        ]
    if name == "thoth":
        return [
            ("M", (185, 185)), ("L", (575, 575)), ("L", (515, 635)),
            ("L", (125, 245)), ("Z", ()),
            ("M", (545, 605)), ("L", (670, 480)), ("L", (735, 545)),
            ("L", (610, 670)), ("Z", ()),
            ("M", (330, 380)), ("L", (790, 380)),
            ("M", (355, 285)), ("L", (720, 285)),
            ("M", (405, 190)), ("L", (790, 190)),
        ]
    if name == "stargate":
        return [
            ("M", (155, 500)), ("Q", ((190, 225), (500, 145))),
            ("Q", ((810, 225), (845, 500))), ("Q", ((810, 775), (500, 855))),
            ("Q", ((190, 775), (155, 500))), ("Z", ()),
            ("M", (270, 500)), ("Q", ((300, 300), (500, 255))),
            ("Q", ((700, 300), (730, 500))), ("Q", ((700, 700), (500, 745))),
            ("Q", ((300, 700), (270, 500))), ("Z", ()),
            ("M", (455, 315)), ("Q", ((500, 290), (545, 315))),
            ("L", (545, 685)), ("Q", ((500, 710), (455, 685))), ("Z", ()),
        ]
    if name == "orion":
        return [
            ("M", (170, 735)), ("L", (500, 625)), ("L", (830, 735)),
            ("M", (500, 625)), ("L", (420, 435)), ("L", (500, 165)),
            ("L", (580, 435)), ("L", (500, 625)),
            ("M", (420, 435)), ("L", (235, 300)),
            ("M", (580, 435)), ("L", (765, 300)),
        ]
    if name == "home":
        return [
            ("M", (150, 430)), ("L", (500, 760)), ("L", (850, 430)),
            ("L", (850, 150)), ("L", (150, 150)), ("Z", ()),
            ("M", (410, 150)), ("L", (410, 390)), ("L", (590, 390)),
            ("L", (590, 150)), ("Z", ()),
        ]
    if name == "now":
        return ellipse(500, 500, 280, 280) + ellipse(500, 500, 70, 70)
    if name == "path":
        return [("M", (150, 180)), ("Q", ((350, 600), (850, 760)))]
    if name == "gravity":
        return ellipse(500, 500, 300, 300) + ellipse(500, 500, 80, 80)
    if name == "unknown":
        return ellipse(500, 500, 330, 330)
    return []


GLYPH_BY_NAME = {
    "uniE100": "oju", "uniE101": "maya-speech", "uniE102": "thoth",
    "uniE104": "stargate", "uniE105": "orion", "uniE110": "home",
    "uniE111": "now", "uniE112": "path", "uniE113": "gravity",
    "uniE114": "unknown",
}
NAMES = [".notdef", "space", *GLYPH_BY_NAME.keys()]
CMAP = {
    0xE100: "uniE100", 0xE101: "uniE101", 0xE102: "uniE102",
    0xE104: "uniE104", 0xE105: "uniE105", 0xE110: "uniE110",
    0xE111: "uniE111", 0xE112: "uniE112", 0xE113: "uniE113",
    0xE114: "uniE114",
}

glyphs = {".notdef": TTGlyphPen(None).glyph(), "space": TTGlyphPen(None).glyph()}
widths = {".notdef": 1000, "space": 400}

for codepoint, glyph_name in CMAP.items():
    glyphs[glyph_name] = path(glyph_commands(GLYPH_BY_NAME[glyph_name]))
    widths[glyph_name] = 1000

fb = FontBuilder(UPM, isTTF=True)
fb.setupGlyphOrder(NAMES)
fb.setupCharacterMap(CMAP)
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics({name: (widths.get(name, 1000), 0) for name in NAMES})
fb.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT)
fb.setupOS2(
    sTypoAscender=ASCENT,
    sTypoDescender=DESCENT,
    sTypoLineGap=0,
    usWinAscent=ASCENT,
    usWinDescent=abs(DESCENT),
)
fb.setupNameTable({
    "familyName": "ESCIE GLYPH",
    "styleName": "Regular",
    "uniqueFontIdentifier": "ESCIE GLYPH 0.1.0",
    "fullName": "ESCIE GLYPH Regular",
    "psName": "ESCIEGLYPH-Regular",
})
fb.setupPost()

ttf = OUT / "ESCIE-GLYPH.ttf"
fb.save(ttf)

try:
    fb.font.flavor = "woff2"
    fb.save(OUT / "ESCIE-GLYPH.woff2")
except Exception:
    pass

print(ttf)
