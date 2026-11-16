from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

UPM = 1000
ASCENT = 800
DESCENT = -200
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "release-candidate"
OUT.mkdir(exist_ok=True)


def path(commands):
    pen = TTGlyphPen(None)
    for command, pts in commands:
        if command == "M":
            pen.moveTo(pts)
        elif command == "L":
            pen.lineTo(pts)
        elif command == "Q":
            pen.qCurveTo(*pts)
        elif command == "C":
            pen.curveTo(*pts)
        elif command == "Z":
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
            ("M", (150, 500)), ("Q", ((260, 730), (500, 500))),
            ("Q", ((740, 270), (850, 500))), ("Q", ((740, 730), (500, 500))),
            ("Q", ((260, 270), (150, 500))), ("Z", ()),
            ("M", (410, 500)), ("Q", ((500, 620), (590, 500))),
            ("Q", ((500, 380), (410, 500))), ("Z", ())
        ]
    if name == "maya-speech":
        return [
            ("M", (150, 450)), ("Q", ((250, 560), (350, 510))),
            ("Q", ((450, 460), (500, 560))), ("Q", ((610, 680), (650, 500))),
            ("Q", ((700, 320), (590, 280))), ("Q", ((500, 250), (450, 350))),
            ("Q", ((300, 430), (150, 450))), ("Z", ())
        ]
    if name == "thoth":
        return [
            ("M", (220, 180)), ("L", (600, 560)), ("L", (540, 620)),
            ("L", (160, 240)), ("Z", ()),
            ("M", (570, 590)), ("L", (680, 480)), ("L", (730, 530)),
            ("L", (620, 640)), ("Z", ()),
            ("M", (360, 360)), ("L", (760, 360)),
            ("M", (360, 270)), ("L", (680, 270)),
            ("M", (410, 180)), ("L", (760, 180))
        ]
    if name == "stargate":
        return ellipse(500, 500, 330, 390) + ellipse(500, 500, 235, 290) + ellipse(500, 500, 60, 70)
    if name == "orion":
        return [
            ("M", (180, 720)), ("L", (500, 620)), ("L", (820, 720)),
            ("M", (500, 620)), ("L", (410, 430)), ("L", (500, 170)),
            ("L", (590, 430)), ("L", (500, 620)),
            ("M", (410, 430)), ("L", (220, 300)),
            ("M", (590, 430)), ("L", (780, 300))
        ]
    if name == "home":
        return [
            ("M", (150, 430)), ("L", (500, 760)), ("L", (850, 430)),
            ("L", (850, 150)), ("L", (150, 150)), ("Z", ()),
            ("M", (410, 150)), ("L", (410, 390)), ("L", (590, 390)),
            ("L", (590, 150)), ("Z", ())
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
