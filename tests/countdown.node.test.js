const fs=require("fs");
const path=require("path");
const countdown=require("../signal/countdown.js");
const ui=fs.readFileSync(path.join(__dirname,"../signal/countdown-ui.js"),"utf8");
function assert(v,m){if(!v)throw new Error(m);}
assert(countdown.version==="2.0.0","countdown contract version");
assert(countdown.start.getTime()<countdown.target.getTime(),"countdown start must precede target");
assert(countdown.active(new Date("2026-10-30T23:59:59-04:00"))===false,"countdown must remain dormant before Oct 31");
assert(countdown.active(new Date("2026-10-31T00:00:00-04:00"))===true,"countdown must activate Oct 31");
assert(countdown.expired(new Date("2026-11-22T00:00:00-05:00"))===true,"countdown must end at target");
assert(ui.includes("root.ESCIE_COUNTDOWN"),"UI must consume canonical countdown state");
console.log("ESCIE countdown contract OK");
