const fs=require("fs");
const path="world-engine.js";
const src=fs.readFileSync(path,"utf8");
const vm=require("vm");
try{new vm.Script(src,{filename:path});}catch(e){throw new Error("world-engine must remain valid JavaScript: "+e.message)}
function assert(c,m){if(!c)throw new Error(m)}
assert(!/\\nfunction/.test(src),"world-engine contains an escaped newline regression");
assert(/function pathContext\(\)/.test(src),"world-engine missing pathContext");
assert(/function investigationSummary\(\)/.test(src),"world-engine missing investigationSummary");
assert(/YOUR INVESTIGATION/.test(src),"Glass Eye investigation context missing");
assert(/NEXT SIGNALS/.test(src),"Glass Eye discovery surface missing");
assert(!/\beval\s*\(|new Function\s*\(/.test(src),"dynamic code execution is forbidden");
assert(/const raf=typeof requestAnimationFrame==="function"\?requestAnimationFrame:fn=>setTimeout\(fn,0\)/.test(src),"world-engine needs a requestAnimationFrame fallback");
assert(/caf\(searchFrame\);searchFrame=raf\(\(\)=>\{render\(\)/.test(src),"search rendering must use the compatibility scheduler");
assert(/world-detail.*focus\(\)/.test(src),"node navigation must restore keyboard focus");
console.log("ESCIE world-engine contracts OK");
