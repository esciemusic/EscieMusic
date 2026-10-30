const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)].map((match) => match[1]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(scripts.length > 0, "index.html should load JavaScript modules");
assert(!html.includes("\\\\n"), "index.html must not contain malformed literal newline escapes");
assert(/<section id="world"[^>]*hidden[^>]*aria-hidden="true"/.test(html), "future game section must remain hidden until externally hosted");

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
