const contract=require("../data/service-contract.js");
const manifest=require("../data/file-manifest.js");
function assert(v,m){if(!v)throw new Error(m);}
assert(contract.validate().ok,"service contract must validate");
assert(manifest.contracts.includes("service-contract"),"service contract must be registered");
for(const key of ["STORAGE","RESEARCH","IMAGE","DISTRIBUTION","GAME","AUTOMATION"]){assert(contract.services[key].authority==="CENTRAL",key+" must remain Central-controlled");}
assert(contract.rules.some(x=>x.includes("External output enters Central")),"external output must return through Central");
console.log("ESCIE service contract OK");
