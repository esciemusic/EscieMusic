const perf=require("../core/performance.js");
const manifest=require("../data/file-manifest.js");
function assert(v,m){if(!v)throw new Error(m);}
assert(perf.validate().ok,"Performance budget must validate");
assert(manifest.contracts.includes("core/performance.js"),"performance runtime must be registered");
assert(perf.budgets.GAME_FRAME_MS<=16.7,"game frame budget must target 60fps");
assert(perf.budgets.GAME_ENVIRONMENT_MS>=50,"environment work must be throttled below frame frequency");
console.log("ESCIE performance contract OK");
