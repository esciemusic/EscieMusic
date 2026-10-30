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
assert(index.includes('data-universe-contract.js'),"public site must load universe contract");
assert(index.includes('data-layer-balance.js'),"public site must load layer balance");
assert(world.includes('core/performance.js'),"world must load performance runtime");
assert(world.includes('data-universe-contract.js'),"world must load universe contract");
assert(central.includes('data-universe-contract.js'),"central must load universe contract");
assert(!index.includes("Reality Filter"),"public site must not reintroduce Reality Filter");
assert(!world.includes("Reality Filter"),"world must not reintroduce Reality Filter");
console.log("ESCIE surface architecture contract OK");
