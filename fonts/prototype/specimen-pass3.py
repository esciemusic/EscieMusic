"""ESCIE typography specimen gate — desktop + phone.

Builds the current isolated prototype faces, renders both specimen sizes,
and fails the gate when required French/English punctuation or glyph coverage
is missing. No production typography is touched.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import importlib.util
import string
import sys

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

pass2 = load_module("pass2", ROOT / "build-fonts-pass2.py")
pass3 = load_module("pass3", ROOT / "build-script-pass3.py")
pass2.build(str(DIST / "ESCIE.ttf"), "ESCIE", 800, "escie")
pass2.build(str(DIST / "ESCIE-SIGNAL.ttf"), "ESCIE SIGNAL", 600, "signal")
pass3.build(str(DIST / "ESCIE-SCRIPT-pass3.ttf"))

REQUIRED = (
    string.ascii_uppercase + string.ascii_lowercase + string.digits +
    ".,!?'-/:;()&—–€“”’" +
    "éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ"
)

SAMPLES = [
    ("ESCIE", "ESCIE — FATHER / MAN / MONSTER"),
    ("SIGNAL", "CASE FILE / SIGNAL / PROOF / 001"),
    ("SCRIPT", "I was here. I saw it. I listened."),
    ("FRENCH", "Montréal, Québec — ÉCOUTE / DÉTAIL / FRAGMENTS"),
]

def cmap_chars(font_path):
    from fontTools.ttLib import TTFont
    font = TTFont(font_path)
    chars = set()
    for table in font["cmap"].tables:
        chars.update(chr(c) for c in table.cmap)
    return chars

fonts = {
    "ESCIE": DIST / "ESCIE.ttf",
    "SIGNAL": DIST / "ESCIE-SIGNAL.ttf",
    "SCRIPT": DIST / "ESCIE-SCRIPT-pass3.ttf",
}

coverage = {}
for name, path in fonts.items():
    chars = cmap_chars(path)
    missing = [ch for ch in REQUIRED if ch not in chars]
    coverage[name] = missing

def render(width, height, filename, scale):
    image = Image.new("RGB", (width, height), (13, 13, 16))
    draw = ImageDraw.Draw(image)
    margin = 36 if width <= 500 else 72
    title = ImageFont.truetype(str(fonts["SIGNAL"]), max(14, int(18 * scale)))
    meta = ImageFont.truetype(str(fonts["SIGNAL"]), max(10, int(13 * scale)))
    faces = [
        ("ESCIE", max(38, int(76 * scale)), "ESCIE — FATHER / MAN / MONSTER"),
        ("SIGNAL", max(30, int(54 * scale)), "CASE FILE / SIGNAL / PROOF / 001"),
        ("SCRIPT", max(30, int(48 * scale)), "I was here. I saw it. I listened."),
    ]
    draw.text((margin, margin), "ESCIE / LETTERFORM SPECIMEN", font=title, fill=(238,238,238))
    y = margin + int(54 * scale)
    for name, size, text in faces:
        role = "IDENTITY" if name == "ESCIE" else "OPERATION" if name == "SIGNAL" else "INTIMACY"
        draw.text((margin, y), name + " / " + role, font=meta, fill=(150,150,160))
        y += int(28 * scale)
        font = ImageFont.truetype(str(fonts[name]), size)
        draw.text((margin, y), text, font=font, fill=(238,238,238))
        y += int(size * 1.55)
    draw.text((margin, y), "French coverage / Montréal, Québec — ÉCOUTE / DÉTAIL / FRAGMENTS",
              font=meta, fill=(150,150,160))
    image.save(ROOT / filename)

render(1440, 900, "specimen-desktop.png", 1.0)
render(390, 844, "specimen-phone.png", 0.58)

report = ROOT / "SPECIMEN-REPORT.md"
lines = [
    "# ESCIE Typography Specimen Report",
    "",
    "Generated from the isolated prototype branch. No production typography is changed.",
    "",
    "## Coverage gate",
]
for name, missing in coverage.items():
    lines.append(f"- {name}: " + ("PASS — required glyph set present." if not missing else "FAIL — missing: " + " ".join(sorted(set(missing)))))
lines += [
    "",
    "## Visual specimens",
    "- specimen-desktop.png — 1440×900",
    "- specimen-phone.png — 390×844",
    "",
    "## Review rule",
    "The three faces must read as different states of one ESCIE family: identity / operation / intimacy.",
    "No production merge is authorized by this report alone.",
]
report.write_text("\n".join(lines) + "\n", encoding="utf-8")

missing_any = any(coverage.values())
print(report.read_text())
if missing_any:
    sys.exit(1)
