const fs=require("fs");
const path=require("path");
const ROOT=path.join(__dirname,"..");
function read(p){return fs.readFileSync(path.join(ROOT,p),"utf8");}
function assert(v,m){if(!v)throw new Error(m);}
const index=read("index.html");
const world=read("world/index.html");
const central=read("central-connect/app.html");
assert(index.includes('signal/countdown.js'),"public site must load countdown state");
assert(index.includes('signal/countdown-ui.js'),"public site must load countdown UI");
assert(/<script\s+src="data\/universe-contract\.js"[^>]*><\/script>/.test(index),"public site must load universe contract");
assert(/<script\s+src="data\/layer-balance\.js"[^>]*><\/script>/.test(index),"public site must load layer balance");
assert(/<script\s+src="\.\.\/core\/performance\.js"[^>]*><\/script>/.test(world),"world must load performance runtime");
assert(/<script\s+src="\.\.\/data\/universe-contract\.js"[^>]*><\/script>/.test(world),"world must load universe contract");
assert(/<script\s+src="\.\.\/data\/universe-contract\.js"[^>]*><\/script>/.test(central),"central must load universe contract");
assert(!index.includes("Reality Filter"),"public site must not reintroduce Reality Filter");
assert(!world.includes("Reality Filter"),"world must not reintroduce Reality Filter");
console.log("ESCIE surface architecture contract OK");
