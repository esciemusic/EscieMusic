const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("public/Central boundary",()=>{
 assert.match(read("ARCHITECTURE.md"),/EscieCentral/);
 assert.doesNotMatch(read("index.html"),/EscieCentral|github\.com\/esciemusic\/EscieCentral/i);
 assert.doesNotMatch(read("data\/file-manifest.js"),/central-connect\/|central\//i);
 assert.equal(fs.existsSync(path.join(root,"central-connect")),false,"public repo must not ship the legacy Central surface");
 assert.equal(fs.existsSync(path.join(root,"central")),false,"public repo must not ship the legacy Central surface");
});
test("public has no server credentials",()=>{const bad=/(SUPABASE_(SERVICE_ROLE_KEY|SECRET_KEY)|service_role|BEGIN (RSA|OPENSSH) PRIVATE KEY)/i;assert.doesNotMatch(read("index.html"),bad);});
console.log("PUBLIC BOUNDARY PASS");
