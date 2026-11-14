"""ESCIE Pass 9 specimen gate.

Prototype-only. Builds Pass 9, checks glyph coverage, and renders desktop
and 390px phone specimens. Production typography is untouched.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
import importlib.util
import string

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist" / "pass9"
DIST.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location("pass9", ROOT / "build-fonts-pass9-clean.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

for family, weight, kind in [
    ("ESCIE", 800, "escie"),
    ("ESCIE SIGNAL", 600, "signal"),
    ("ESCIE SCRIPT", 400, "script"),
]:
    mod.build_pass9(str(DIST / f"{family.replace(' ', '-')}.ttf"), family, weight, kind)

required = (
    string.ascii_uppercase + string.ascii_lowercase + string.digits +
    ".,!?'-/:;()&—–€“”’" +
    "éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ"
)

fonts = {
    "ESCIE": DIST / "ESCIE.ttf",
    "SIGNAL": DIST / "ESCIE-SIGNAL.ttf",
    "SCRIPT": DIST / "ESCIE-SCRIPT.ttf",
}

coverage = {}
for name, path in fonts.items():
    font = TTFont(path)
    chars = set()
    for table in font["cmap"].tables:
        chars.update(chr(codepoint) for codepoint in table.cmap)
    coverage[name] = sorted(set(required) - chars)

def render(width, height, filename, scale):
    image = Image.new("RGB", (width, height), (13, 13, 16))
    draw = ImageDraw.Draw(image)
    margin = 28 if width <= 500 else 72
    signal = ImageFont.truetype(str(fonts["SIGNAL"]), max(10, int(17 * scale)))
    meta = ImageFont.truetype(str(fonts["SIGNAL"]), max(8, int(12 * scale)))
    rows = [
        ("ESCIE", max(38, int(78 * scale)), "ESCIE"),
        ("ESCIE", max(24, int(31 * scale)), "A GOOD PERSON. I'M JUST NOT NICE."),
        ("ESCIE", max(24, int(31 * scale)), "THE FATHER / THE MAN / THE MONSTER."),
        ("SIGNAL", max(27, int(52 * scale)), "CASE FILE / PROOF / MONTRÉAL / QUÉBEC"),
        ("SCRIPT", max(28, int(47 * scale)), "The art speaks for itself."),
    ]
    draw.text((margin, margin), "ESCIE / PASS 9 LETTERFORM SPECIMEN", font=signal, fill=(238,238,238))
    y = margin + int(48 * scale)
    max_width = width - margin * 2
    for family, size, text_value in rows:
        draw.text((margin, y), family, font=meta, fill=(150,150,160))
        y += int(22 * scale)
        font = ImageFont.truetype(str(fonts[family]), size)
        words = text_value.split()
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
        y += int(14 * scale)
    draw.text(
        (margin, min(y, height - margin - 24)),
        "French: Montréal, Québec — ÉCOUTE / DÉTAIL / FRAGMENTS",
        font=meta,
        fill=(190,190,195),
    )
    image.save(ROOT / filename)

render(1440, 900, "specimen-pass9-desktop.png", 1.0)
render(390, 844, "specimen-pass9-phone.png", 0.46)

report = ROOT / "PASS9-SPECIMEN-REPORT.md"
lines = ["# ESCIE Pass 9 Specimen Report", "", "Prototype-only. Production typography remains unchanged.", "", "## Glyph coverage"]
for name, missing in coverage.items():
    lines.append(f"- {name}: " + ("PASS" if not missing else "FAIL — missing: " + " ".join(missing)))
lines += [
    "",
    "## Render targets",
    "- specimen-pass9-desktop.png — 1440×900",
    "- specimen-pass9-phone.png — 390×844",
    "",
    "## Review gate",
    "Solid contours, immediate identity, restrained Gothic/medieval authority, readable phone scale, clean French accents.",
    "Reject contour noise, stock Gothic, techno/pixel, distressed/glitch, decorative horror, or weak mobile readability.",
    "This report does not authorize production promotion.",
]
report.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(report.read_text())
if any(coverage.values()):
    raise SystemExit(1)
