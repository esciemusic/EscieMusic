const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)].map((match) => match[1]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(scripts.length > 0, "index.html should load JavaScript modules");
assert(!html.includes("\\\\n"), "index.html must not contain malformed literal newline escapes");
assert(/<section id="world"[^>]*>/.test(html), "THE WORLD section must remain part of the public doorway");
const games = fs.readFileSync("data/games.js", "utf8");
assert(games.includes('status:"EXTERNAL_PLATFORM_EVALUATION"'), "playable game hosting must remain externally evaluated");
assert(games.includes("public_link:null"), "playable game must remain unlinked until an external host is chosen");
const merch=fs.readFileSync("data/merch.js","utf8");
assert(!merch.includes("bam-tee-blue")&&!merch.includes("bam-poster")&&!merch.includes("BAM / BY ANY MEANS TEE"),"unreleased BAM merchandise must not be exposed in public merch metadata");
assert(html.includes("SEE · HEAR · FOLLOW · MISS · RETURN"),"Glass Eye must retain the confirmed audience-eye descriptor");

const counts = new Map();
scripts.forEach((src) => counts.set(src, (counts.get(src) || 0) + 1));

const duplicates = [...counts.entries()]
  .filter(([, count]) => count > 1)
  .map(([src]) => src);

assert(duplicates.length === 0, "index.html contains duplicate script loads: " + duplicates.join(", "));

[
  "record.js",
  "relationship.js",
  "app.js"
].forEach((required) => {
  assert(scripts.includes(required), "index.html is missing required script: " + required);
});

const appIndex = scripts.indexOf("app.js");
assert(scripts.indexOf("record.js") < appIndex, "record contract must load before app.js");
assert(scripts.indexOf("relationship.js") < appIndex, "relationship contract must load before app.js");

console.log("ESCIE site script-load contracts OK");
