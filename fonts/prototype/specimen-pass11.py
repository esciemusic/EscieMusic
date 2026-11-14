"""ESCIE Pass 11 specimen gate — prototype only."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from fontTools.ttLib import TTFont
import importlib.util,string

ROOT=Path(__file__).resolve().parent
DIST=ROOT/"dist"/"pass11"; DIST.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location("pass11",ROOT/"build-fonts-pass11-human-gothic.py")
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
for family,weight,kind in [("ESCIE",800,"escie"),("ESCIE SIGNAL",600,"signal"),("ESCIE SCRIPT",400,"script")]:
    mod.build_pass11(str(DIST/f"{family.replace(' ','-')}.ttf"),family,weight,kind)
required=string.ascii_uppercase+string.ascii_lowercase+string.digits+"éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ"
coverage={}
for name,path in {"ESCIE":DIST/"ESCIE.ttf","SIGNAL":DIST/"ESCIE-SIGNAL.ttf","SCRIPT":DIST/"ESCIE-SCRIPT.ttf"}.items():
    f=TTFont(path); chars=set()
    for t in f["cmap"].tables: chars.update(chr(c) for c in t.cmap)
    coverage[name]=sorted(set(required)-chars)
report=ROOT/"PASS11-SPECIMEN-REPORT.md"
lines=["# ESCIE Pass 11 Specimen Report","","Prototype-only. Production typography remains unchanged.","","## Glyph coverage"]
for n,m in coverage.items(): lines.append(f"- {n}: "+("PASS" if not m else "FAIL — missing: "+" ".join(m)))
lines += ["","## Review targets","1440×900 desktop and 390×844 phone specimen.","","## Gate","Reject malformed joins, techno/pixel construction, generic blackletter, decorative horror, distress, or weak phone readability."]
report.write_text("\n".join(lines)+"\n",encoding="utf-8")
if any(coverage.values()): raise SystemExit(1)
print(report.read_text())
