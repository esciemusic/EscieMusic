"""ESCIE Pass 8 specimen gate.

Builds Pass 8 only, renders desktop + 390px phone specimens, and checks
required French/English glyph coverage. Production fonts are untouched.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import importlib.util
import string
import sys

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist" / "pass8"
DIST.mkdir(parents=True, exist_ok=True)

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

builder = load("pass8", ROOT / "build-fonts-pass8-authored.py")
builder.build_pass8(str(DIST / "ESCIE.ttf"), "ESCIE", 800, "escie")
builder.build_pass8(str(DIST / "ESCIE-SIGNAL.ttf"), "ESCIE SIGNAL", 600, "signal")
builder.build_pass8(str(DIST / "ESCIE-SCRIPT.ttf"), "ESCIE SCRIPT", 400, "script")

REQUIRED = (
    string.ascii_uppercase + string.ascii_lowercase + string.digits +
    ".,!?'-/:;()&—–€“”’" +
    "éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ"
)

fonts = {
    "ESCIE": DIST / "ESCIE.ttf",
    "SIGNAL": DIST / "ESCIE-SIGNAL.ttf",
    "SCRIPT": DIST / "ESCIE-SCRIPT.ttf",
}

def cmap_chars(path):
    from fontTools.ttLib import TTFont
    font = TTFont(path)
    chars = set()
    for table in font["cmap"].tables:
        chars.update(chr(c) for c in table.cmap)
    return chars

coverage = {}
for name, path in fonts.items():
    chars = cmap_chars(path)
    coverage[name] = [c for c in REQUIRED if c not in chars]

def render(width, height, filename, scale):
    image = Image.new("RGB", (width, height), (13, 13, 16))
    draw = ImageDraw.Draw(image)
    margin = 36 if width <= 500 else 72
    signal = ImageFont.truetype(str(fonts["SIGNAL"]), max(12, int(17 * scale)))
    meta = ImageFont.truetype(str(fonts["SIGNAL"]), max(9, int(12 * scale)))
    faces = [
        ("ESCIE", max(38, int(78 * scale)), "ESCIE"),
        ("ESCIE", max(24, int(31 * scale)), "A GOOD PERSON. I'M JUST NOT NICE."),
        ("ESCIE", max(24, int(31 * scale)), "THE FATHER / THE MAN / THE MONSTER."),
        ("SIGNAL", max(27, int(52 * scale)), "CASE FILE / PROOF / MONTRÉAL / QUÉBEC"),
        ("SCRIPT", max(28, int(47 * scale)), "The art speaks for itself."),
    ]
    draw.text((margin, margin), "ESCIE / PASS 8 LETTERFORM SPECIMEN", font=signal, fill=(238,238,238))
    y = margin + int(48 * scale)
    max_width = width - margin * 2
    for name, size, text in faces:
        draw.text((margin, y), name, font=meta, fill=(150,150,160))
        y += int(22 * scale)
        font = ImageFont.truetype(str(fonts[name]), size)
        words = text.split()
        line = ""
        for word in words:
            candidate = word if not line else line + " " + word
            if draw.textbbox((0,0), candidate, font=font)[2] <= max_width:
                line = candidate
            else:
                draw.text((margin, y), line, font=font, fill=(238,238,238))
                y += int(size * 1.25)
                line = word
        if line:
            draw.text((margin, y), line, font=font, fill=(238,238,238))
            y += int(size * 1.25)
        y += int(18 * scale)
    draw.text((margin, min(y, height - margin - 30)),
              "French: Montréal, Québec — ÉCOUTE / DÉTAIL / FRAGMENTS",
              font=meta, fill=(190,190,195))
    image.save(ROOT / filename)

render(1440, 900, "specimen-pass8-desktop.png", 1.0)
render(390, 844, "specimen-pass8-phone.png", 0.46)

report = ROOT / "PASS8-SPECIMEN-REPORT.md"
lines = [
    "# ESCIE Pass 8 Specimen Report", "",
    "Prototype-only. Production typography remains unchanged.", "",
    "## Glyph coverage",
]
for name, missing in coverage.items():
    lines.append(f"- {name}: " + ("PASS" if not missing else "FAIL — missing: " + " ".join(sorted(set(missing)))))
lines += [
    "", "## Render targets",
    "- specimen-pass8-desktop.png — 1440×900",
    "- specimen-pass8-phone.png — 390×844",
    "", "## Review gate",
    "Identity must feel authored, tall, narrow, Gothic/medieval, restrained, and readable.",
    "Reject generic stock Gothic, techno/pixel, distressed/glitch, decorative horror, or weak phone readability.",
    "This report does not authorize production promotion.",
]
report.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(report.read_text())
if any(coverage.values()):
    sys.exit(1)
