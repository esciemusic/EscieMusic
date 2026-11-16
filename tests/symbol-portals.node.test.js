const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const symbolsSource = fs.readFileSync(path.join(root, "data", "symbols.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

assert(symbolsSource.includes('id:"symbol-oju"'));
assert(symbolsSource.includes('id:"symbol-maya-speech"'));
assert(symbolsSource.includes('id:"symbol-thoth"'));
assert(symbolsSource.includes('id:"symbol-vitruvian-man"'));
assert(symbolsSource.includes('id:"symbol-stargate"'));
assert(symbolsSource.includes('id:"symbol-orion"'));

[
  ["symbol-oju", "#art/visual"],
  ["symbol-maya-speech", "#art/music"],
  ["symbol-thoth", "#art/words"],
  ["symbol-vitruvian-man", "#world"],
  ["symbol-stargate", "#world"],
  ["symbol-orion", "#web"]
].forEach(([id, route]) => {
  assert(index.includes('data-symbol-id="' + id + '"'));
  assert(index.includes('data-symbol-portal="true"'));
  assert(app.includes('"' + route.replace("#","") + '"') || app.includes("'" + route + "'"));
});

assert(!index.includes('aria-label="Open Music"'));
assert(!index.includes('aria-label="Open Words"'));
assert(!index.includes('aria-label="Open Visual"'));
assert(!index.includes('aria-label="Open Glass Eye"'));
assert(app.includes("function symbolPortalRoute(symbolId)"));
assert(app.includes('symbol.status === "portal"'));
assert(app.includes('getRecordSymbols(record)'));

console.log("symbol portals: PASS");
