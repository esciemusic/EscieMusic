const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("public/Central boundary",()=>{assert.match(read("ARCHITECTURE.md"),/Central operations/);assert.doesNotMatch(read("index.html"),/EscieCentral|github\.com\/esciemusic\/EscieCentral/i);});
test("public has no server credentials",()=>{const bad=/(SUPABASE_(SERVICE_ROLE_KEY|SECRET_KEY)|service_role|BEGIN (RSA|OPENSSH) PRIVATE KEY)/i;assert.doesNotMatch(read("index.html"),bad);});
console.log("PUBLIC BOUNDARY PASS");