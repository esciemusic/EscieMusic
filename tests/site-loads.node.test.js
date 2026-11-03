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
assert(html.includes('data/glass-eye-participation.js'),"Glass Eye participation bridge must load");
assert(fs.readFileSync("data/locations.js","utf8").includes('id:"montreal"'),"World must retain Montréal as the geographic anchor");
assert(fs.readFileSync("data/merch.js","utf8").includes("HEART ON MY SLEEVE"),"merch layer must use HEART ON MY SLEEVE");
const nestedSource = html.slice(html.indexOf("function initNestedDropdowns"), html.indexOf("if(document.readyState"));
assert(nestedSource.includes('root.matches(selector)'), "nested dropdown enhancer must handle dynamically inserted root nodes");
assert(nestedSource.includes('querySelector(":scope > h3")'), "nested dropdown titles must only use direct card headings");
assert(nestedSource.includes('Array.from(group.children).filter'), "nested dropdown sibling closing must stay scoped to direct siblings");
assert(nestedSource.includes('nested-drop-index" aria-hidden="true">▸'), "nested dropdowns must use one directional node marker plus one open-state control");



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

assert(fs.readFileSync("data/universe-contract.js","utf8").includes('version:"1.2.1"'),"universe contract should be current");
const universeContract=fs.readFileSync("data/universe-contract.js","utf8");
assert(!universeContract.includes("realityFilter"),"legacy Reality Filter contract must be removed entirely");
assert(universeContract.includes("HEART ON MY SLEEVE"),"universe contract must use the current wardrobe identity");
assert(fs.readFileSync("data/glass-eye-participation.js","utf8").includes("approvedEndpoint"),"Glass Eye must use the moderated approved-media endpoint");
assert(fs.readFileSync("data/glass-eye-participation.js","utf8").includes("ONLY PHOTO, VIDEO OR AUDIO FILES ARE ACCEPTED"),"Glass Eye media input must enforce supported media types");
assert(fs.readFileSync("app.js","utf8").includes("data-web-record-type"),"THE WEB record-type filter must be wired");
assert(fs.readFileSync("app.js","utf8").includes("safeExternalURL"),"external storefront URLs must be protocol-validated");

console.log("ESCIE site script-load contracts OK");
