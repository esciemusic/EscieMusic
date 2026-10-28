const fs=require("fs"),assert=require("assert"),vm=require("vm");
const files=["central-connect/app.html","central-connect/operator.js","central-connect/agent-protocol.js","central-connect/agent-runtime.js"];
for(const f of files){assert(fs.existsSync(f),f+" missing");const s=fs.readFileSync(f,"utf8");assert(!s.includes("operator-ui.js"),f+" references removed duplicate UI");if(f.endsWith(".js"))new vm.Script(s,{filename:f});}
const html=fs.readFileSync("central-connect/app.html","utf8");
for(const id of ["mainNav","tasks","suggestions","insights","agents","destinations"])assert(html.includes('id="'+id+'"')||html.includes('data-target="'+id+'"'),"missing "+id);
for(const src of ["agent-protocol.js","agent-runtime.js","operator.js"])assert(html.includes('src="./'+src+'"'),"missing script "+src);
const protocol=fs.readFileSync("central-connect/agent-protocol.js","utf8");assert(protocol.includes('version: "1.1"'));assert(protocol.includes("APPROVAL_REQUIRED"));
const operator=fs.readFileSync("central-connect/operator.js","utf8");assert(operator.includes("try{const raw=localStorage.getItem(KEY)"),"operator storage parsing not hardened");
console.log("CENTRAL AUDIT PASS — syntax, navigation, runtime wiring, duplicate UI removal, storage hardening");