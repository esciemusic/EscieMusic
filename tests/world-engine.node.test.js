const fs=require("fs");
const path="world-engine.js";
const src=fs.readFileSync(path,"utf8");
function assert(c,m){if(!c)throw new Error(m)}
assert(!/\\nfunction/.test(src),"world-engine contains an escaped newline regression");
assert(/function pathContext\(\)/.test(src),"world-engine missing pathContext");
assert(/function investigationSummary\(\)/.test(src),"world-engine missing investigationSummary");
assert(/YOUR INVESTIGATION/.test(src),"Glass Eye investigation context missing");
assert(/NEXT SIGNALS/.test(src),"Glass Eye discovery surface missing");
assert(!/\\beval\\s*\\(|new Function\\s*\\(/.test(src),"dynamic code execution is forbidden");
console.log("ESCIE world-engine contracts OK");
