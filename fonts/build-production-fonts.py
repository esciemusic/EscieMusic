from pathlib import Path
import importlib.util
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
PROTO = ROOT / "prototype"
OUT = ROOT / "release-candidate"
OUT.mkdir(parents=True, exist_ok=True)

def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def build_from(module_path, builder, filename):
    mod = load(module_path, filename.replace(".ttf", ""))
    target = OUT / filename
    if module_path.name == "build-fonts-pass2.py":
        if filename == "ESCIE.ttf":
            mod.build(str(target), "ESCIE", 800, "escie")
        else:
            mod.build(str(target), "ESCIE SIGNAL", 600, "signal")
    else:
        mod.build(str(target))
    return target

def set_release_metadata(path, family, subfamily, ps_name):
    font = TTFont(path)
    names = font["name"]
    replacements = {
        1: family,
        2: subfamily,
        4: f"{family} {subfamily}".strip(),
        6: ps_name,
        3: f"{ps_name}; ESCIE; 1.0",
    }
    for record in names.names:
        if record.nameID in replacements:
            value = replacements[record.nameID]
            try:
                record.string = value.encode(record.getEncoding())
            except UnicodeEncodeError:
                record.string = value.encode("utf-16-be")
                record.platformID = 3
                record.platEncID = 1
    font.save(path)

escie = build_from(PROTO / "build-fonts-pass2.py", "build", "ESCIE.ttf")
signal = build_from(PROTO / "build-fonts-pass2.py", "build_signal", "ESCIE-SIGNAL.ttf")
script = build_from(PROTO / "build-script-pass3.py", "build", "ESCIE-SCRIPT.ttf")

set_release_metadata(escie, "ESCIE", "Regular", "ESCIE-Regular")
set_release_metadata(signal, "ESCIE SIGNAL", "Regular", "ESCIESIGNAL-Regular")
set_release_metadata(script, "ESCIE SCRIPT", "Regular", "ESCIESCRIPT-Regular")

print("Built release candidates:")
for path in sorted(OUT.glob("*.ttf")):
    print(path)
