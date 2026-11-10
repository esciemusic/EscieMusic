from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
FONT_DIR = ROOT / "release-candidate"
OUT = ROOT / "release-candidate-specimens"
OUT.mkdir(parents=True, exist_ok=True)

samples = [
    ("ESCIE", FONT_DIR / "ESCIE.ttf", 92),
    ("ESCIE SIGNAL", FONT_DIR / "ESCIE-SIGNAL.ttf", 58),
    ("ESCIE SCRIPT", FONT_DIR / "ESCIE-SCRIPT.ttf", 64),
]
lines = [
    "ESCIE — THE FATHER / THE MAN / THE MONSTER",
    "REALITY WITH THE SIGNAL DISTORTED.",
    "Montréal, Québec, Canada.",
    "The art does not create the universe. The universe creates the art.",
    "É È Ê Ë À Â Ä Î Ï Ô Ö Ù Û Ü Ç  —  €",
]

def render(name, path, size, width, height, filename):
    img = Image.new("RGB", (width, height), "black")
    draw = ImageDraw.Draw(img)
    y = 48
    for label in [name]:
        font = ImageFont.truetype(str(path), size)
        draw.text((48, y), label, font=font, fill="white")
        y += size + 34
    body_font = ImageFont.truetype(str(path), max(28, size // 2))
    for line in lines:
        draw.text((48, y), line, font=body_font, fill="white")
        y += max(28, size // 2) + 24
    img.save(OUT / filename)

for name, path, size in samples:
    render(name, path, size, 1440, 900, f"{name.lower().replace(' ','-')}-desktop.png")
    render(name, path, max(34, size // 2), 390, 844, f"{name.lower().replace(' ','-')}-phone.png")

print("Production font specimen render: PASS")
for p in sorted(OUT.glob("*.png")):
    print(p)
