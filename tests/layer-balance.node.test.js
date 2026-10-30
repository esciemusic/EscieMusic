const balance=require("../data/layer-balance.js");
const contract=require("../data/universe-contract.js");
const manifest=require("../data/file-manifest.js");
function assert(v,m){if(!v)throw new Error(m);}
assert(balance.validate().ok,"Layer balance must validate");
assert(manifest.contracts.includes("layer-balance"),"layer balance must be registered");
assert(contract.validate().ok,"Universe contract must validate");
assert(balance.layers.central.owns.includes("correlation"),"Central owns correlation");
assert(balance.layers.public.owns.includes("music"),"Public owns music");
assert(balance.layers.game.owns.includes("missions"),"Game owns missions");
assert(!balance.layers.game.owns.includes("canonical-truth-authoring"),"Game cannot author canon");
assert(!balance.layers.public.owns.includes("private-operator-control"),"Public cannot own private control");
console.log("ESCIE layer balance OK");
