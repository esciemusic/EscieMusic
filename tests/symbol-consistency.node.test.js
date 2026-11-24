const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const registry = fs.readFileSync(path.join(root, "data", "symbols.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const svg = fs.readFileSync(path.join(root, "assets", "escie-symbols.svg"), "utf8");
const aesthetic = fs.readFileSync(path.join(root, "aesthetic.css"), "utf8");

const canonical = [
  "art","music","words","visual","project","people","place","moment","object",
  "fragment","proof","body","archives","case-files","connection","trace","web",
  "aperture","escie","montreal-mark"
];

canonical.forEach(glyph => {
  assert(svg.includes('id="' + glyph + '"'), "missing canonical SVG glyph: " + glyph);
});

[
  "symbol-art","symbol-music","symbol-words","symbol-visual","symbol-project",
  "symbol-people","symbol-place","symbol-moment","symbol-object","symbol-fragment",
  "symbol-proof","symbol-body","symbol-archives","symbol-case-files",
  "symbol-connection","symbol-trace","symbol-web","symbol-aperture","symbol-escie"
].forEach(id => {
  assert(registry.includes('id:"' + id + '"'), "missing canonical registry entry: " + id);
});

assert.match(app,/Record identity uses the same canonical type marks as World/);
assert.match(app,/music:\s*"symbol-music"/);
assert.match(app,/writing:\s*"symbol-words"/);
assert.match(app,/visual:\s*"symbol-visual"/);
assert.match(app,/person:\s*"symbol-people"/);
assert.match(app,/place:\s*"symbol-place"/);
assert.match(app,/moment:\s*"symbol-moment"/);
assert.match(app,/object:\s*"symbol-object"/);
assert.match(app,/fragment:\s*"symbol-fragment"/);
assert.match(app,/proof:\s*"symbol-proof"/);
assert.match(app,/archive:\s*"symbol-archives"/);
assert.match(app,/investigation:\s*"symbol-case-files"/);

["montreal-mark","now","world","web","archives","case-files","aperture","escie"].forEach(glyph => assert.match(index,new RegExp("escie-symbols\\.svg#"+glyph)));

assert.match(aesthetic,/\.section-drop-meaning/);
assert.match(aesthetic,/\.symbol-montreal-mark/);
assert.match(aesthetic,/\.symbol-music/);
assert.match(aesthetic,/\.symbol-case-files/);
assert.match(aesthetic,/\.symbol-aperture/);

console.log("ESCIE symbol consistency: PASS");
