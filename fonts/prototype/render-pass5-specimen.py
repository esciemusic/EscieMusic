"""Render the ESCIE Pass-5 prototype family for visual review.

Run from fonts/prototype after generating Pass 5:
  python render-pass5-specimen.py

The renderer intentionally uses only the generated prototype binaries and
renders the same content at desktop and phone-oriented widths. It does not
change production typography.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
FONT_DIR = ROOT / "dist" / "pass5"
OUT_DIR = ROOT / "dist" / "pass5-specimen"

SPECIMENS = [
    ("ESCIE", "ESCIE"),
    ("IDENTITY", "ESCIE — THE FATHER / THE MAN / THE MONSTER"),
    ("SECTIONS", "ART   THE PEOPLE   PLACES   MOMENTS   FRAGMENTS   PROOF   BODIES   PATH   THE WEB   THE ARCHIVES"),
    ("LOCATION", "Montréal, Québec, Canada."),
    ("PRINCIPLE", "THE ART DOES NOT CREATE THE UNIVERSE. THE UNIVERSE CREATES THE ART."),
    ("SIGNAL", "ENTER THE WORLD   INDEX   GLASS EYE   PROOF   ARCHIVES"),
    ("FRENCH", "ÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ   éèêëàâäîïôöùûüç"),
    ("LOWER", "signal metadata visitor trace navigation evidence"),
]

def load(path, size):
    return ImageFont.truetype(str(path), size=size)

def render(path, width, title, size):
    bg = (8, 8, 8)
    fg = (245, 245, 245)
    margin = 48 if width > 600 else 24
    line_gap = 34 if width > 600 else 22
    img = Image.new("RGB", (width, 1200 if width > 600 else 1600), bg)
    d = ImageDraw.Draw(img)
    y = margin
    d.text((margin, y), title, font=load(path, 20 if width > 600 else 15), fill=fg)
    y += 54
    for label, text in SPECIMENS:
        d.text((margin, y), label, font=load(path, 15 if width > 600 else 12), fill=fg)
        y += 30
        font_size = size
        font = load(path, font_size)
        # Wrap only for the narrow specimen; desktop keeps natural line flow.
        words = text.split(" ")
        lines, line = [], ""
        max_width = width - margin * 2
        for word in words:
            candidate = (line + " " + word).strip()
            if d.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                line = candidate
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
        for ln in lines:
            d.text((margin, y), ln, font=font, fill=fg)
            y += font_size + line_gap
        y += 28
    return img.crop((0, 0, width, min(y + margin, img.height)))

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    escie = FONT_DIR / "ESCIE.ttf"
    signal = FONT_DIR / "ESCIE-SIGNAL.ttf"
    script = FONT_DIR / "ESCIE-SCRIPT.ttf"
    if not escie.exists() or not signal.exists() or not script.exists():
        raise SystemExit("Generate Pass 5 first: python build-fonts-pass5-family.py")
    render(escie, 1440, "ESCIE — PASS 5 / DESKTOP", 58).save(OUT_DIR / "escie-desktop.png")
    render(escie, 390, "ESCIE — PASS 5 / PHONE", 30).save(OUT_DIR / "escie-phone.png")
    render(signal, 1440, "ESCIE SIGNAL — PASS 5 / DESKTOP", 34).save(OUT_DIR / "signal-desktop.png")
    render(signal, 390, "ESCIE SIGNAL — PASS 5 / PHONE", 20).save(OUT_DIR / "signal-phone.png")
    render(script, 1440, "ESCIE SCRIPT — PASS 5 / DESKTOP", 34).save(OUT_DIR / "script-desktop.png")
    render(script, 390, "ESCIE SCRIPT — PASS 5 / PHONE", 20).save(OUT_DIR / "script-phone.png")
    print(f"Wrote specimens to {OUT_DIR}")

if __name__ == "__main__":
    main()
