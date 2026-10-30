const fs=require("fs");
const path=require("path");
const countdown=require("../signal/countdown.js");
const ui=fs.readFileSync(path.join(__dirname,"../signal/countdown-ui.js"),"utf8");
function assert(v,m){if(!v)throw new Error(m);}
assert(countdown.configure("2026-11-22T00:00:00-05:00").getTime()>0,"countdown target must accept the release timestamp");
countdown.configure(null);
const source=ui;
assert(source.includes("2026-10-31T00:00:00-04:00"),"countdown must start Oct 31");
assert(source.includes("2026-11-22T00:00:00-05:00"),"countdown must target Nov 22");
assert(source.includes("root.ESCIE_COUNTDOWN_UI"),"countdown UI must expose its public API");
console.log("ESCIE countdown contract OK");
