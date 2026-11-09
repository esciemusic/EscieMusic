const fs=require("fs");
const bridge=fs.readFileSync("data/unified-entities.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const contract=fs.readFileSync("INTEGRATION_CONTRACT.md","utf8");
for(const needle of ["ESCIE_UNIFIED_ENTITIES","escie-public","public projection"]) if(!bridge.toLowerCase().includes(needle.toLowerCase())) throw new Error("bridge missing "+needle);
if(!index.includes('data/unified-entities.js')) throw new Error("unified entity bridge not loaded");
for(const needle of ["one ESCIE entity","Central is the private control plane","public-safe projection"]) if(!contract.toLowerCase().includes(needle.toLowerCase())) throw new Error("contract missing "+needle);
console.log("public unified entity contract: PASS");