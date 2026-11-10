from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent / "release-candidate"
required = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?'-/:;()&—–€“”’éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ")

for path in sorted(ROOT.glob("*.ttf")):
    font = TTFont(path)
    cmap = {}
    for table in font["cmap"].tables:
        cmap.update(table.cmap)
    missing = sorted(ch for ch in required if ord(ch) not in cmap)
    assert not missing, f"{path.name}: missing glyphs {missing}"
    assert font["head"].unitsPerEm == 1000, f"{path.name}: unexpected unitsPerEm"
    assert font["hhea"].ascent == 900 and font["hhea"].descent == -200, f"{path.name}: metrics mismatch"
    assert "name" in font, f"{path.name}: missing name table"
    print(f"PASS {path.name}: glyphs={len(cmap)} size={path.stat().st_size}")

files = sorted(ROOT.glob("*.ttf"))
assert [p.name for p in files] == ["ESCIE-SCRIPT.ttf", "ESCIE-SIGNAL.ttf", "ESCIE.ttf"]
print("ESCIE production candidate validation: PASS")
