const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const map = JSON.parse(fs.readFileSync(path.join(root, "fonts", "glyphs", "glyph-map.json"), "utf8"));
const registry = fs.readFileSync(path.join(root, "data", "symbols.js"), "utf8");
const docs = fs.readFileSync(path.join(root, "fonts", "glyphs", "README.md"), "utf8");
const svg = fs.readFileSync(path.join(root, "assets", "escie-symbols.svg"), "utf8");

assert.strictEqual(map.family, "ESCIE GLYPH");
assert.strictEqual(map.semanticAuthority, "data/symbols.js");
assert.strictEqual(map.fallback, "assets/escie-symbols.svg");

const portalIds = ["symbol-oju","symbol-maya-speech","symbol-thoth","symbol-vitruvian-man","symbol-stargate","symbol-orion"];
const codepoints = new Set();
map.portals.forEach(item => {
  assert(portalIds.includes(item.id), "unknown portal in glyph map: " + item.id);
  if (item.codepoint) {
    assert(!codepoints.has(item.codepoint), "duplicate glyph codepoint: " + item.codepoint);
    codepoints.add(item.codepoint);
  }
  assert(["derived", "source-artwork"].includes(item.class));
});

const vitruvian = map.portals.find(item => item.id === "symbol-vitruvian-man");
assert.strictEqual(vitruvian.class, "source-artwork");
assert.strictEqual(vitruvian.codepoint, null);

["symbol-oju","symbol-maya-speech","symbol-thoth","symbol-stargate","symbol-orion"].forEach(id => {
  assert(registry.includes('id:"' + id + '"'));
});

assert(docs.includes("historical source → faithful reference → ESCIE interpretation → navigation purpose"));
assert(docs.includes("VITRUVIAN MAN is intentionally not redrawn"));
assert(docs.includes("U+E100–U+E105"));

["oju","maya-speech","thoth","vitruvian-man","stargate","orion"].forEach(id => {
  assert(svg.includes('id="' + id + '"'), "missing SVG fallback glyph: " + id);
});

console.log("ESCIE glyph system: PASS");
