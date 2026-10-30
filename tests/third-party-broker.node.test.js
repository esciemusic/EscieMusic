const fs=require("fs");
const path=require("path");
const manifest=require("../data/file-manifest.js");
const contract=require("../data/service-contract.js");
function assert(v,m){if(!v)throw new Error(m);}
const broker=fs.readFileSync(path.join(__dirname,"../central-connect/third-party-broker.js"),"utf8");
const desk=fs.readFileSync(path.join(__dirname,"../central-connect/command-desk.js"),"utf8");
assert(contract.validate().ok,"service contract must validate");
assert(manifest.contracts.includes("central-connect/third-party-broker.js"),"broker must be registered");
assert(manifest.contracts.includes("central-connect/command-desk.js"),"command desk must be registered");
assert(broker.includes("requires_human_approval:true"),"broker handoffs must require human approval");
assert(broker.includes("EXTERNAL_READY"),"broker must support external-ready services");
assert(broker.includes("EXTERNAL_EVALUATION"),"broker must support evaluation-only services");
assert(broker.includes("central-private"),"private uploads must use Central private storage");
assert(desk.includes("ESCIE_THIRD_PARTY_BROKER"),"command desk must use service broker");
assert(desk.includes("APPROVAL_REQUEST")||desk.includes("requires_human_approval"),"command desk must preserve human gate semantics");
console.log("ESCIE third-party broker contract OK");
