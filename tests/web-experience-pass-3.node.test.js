const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const lang=fs.readFileSync(path.join(root,"language.js"),"utf8");
const participation=fs.readFileSync(path.join(root,"data","glass-eye-participation.js"),"utf8");

test("Experience Pass 3 keeps the Glass Eye journey complete",()=>{
  [
    "SEE · HEAR · FOLLOW · MISS · RETURN",
    "YOU LOOKED",
    "YOU LISTENED",
    "YOU FOLLOWED",
    "YOU ARE BACK. YOUR PATH IS STILL HERE.",
    "LEAVE SOMETHING BEHIND.",
    "WE REVIEW",
    "RECEIVED. HELD FOR REVIEW — NOT CANON."
  ].forEach(marker=>assert.ok(app.includes(marker),marker));
});

test("Experience Pass 3 keeps Glass Eye participation bounded and anonymous-capable",()=>{
  assert.match(app,/name.*alias/i);
  assert.match(app,/anonymous/i);
  assert.match(app,/location.*context/i);
  assert.match(participation,/slice\(0,5000\)/);
  assert.match(participation,/slice\(0,80\)/);
  assert.match(participation,/10\*1024\*1024/);
  assert.doesNotMatch(participation,/service_role/i);
});

test("Experience Pass 3 keeps the shared language system active for all supported languages",()=>{
  ["en","fr","es"].forEach(code=>assert.match(lang,new RegExp("\\b"+code+"\\s*:\\s*\\{")));
  ["OPEN INDEX","ENTER THE WORLD","GLASS EYE","LEAVE SOMETHING BEHIND.","RECEIVED. HELD FOR REVIEW — NOT CANON."].forEach(phrase=>assert.ok(lang.includes(phrase),phrase));
  assert.match(app,/language:changed/);
  assert.match(app,/data-language/);
});

test("Experience Pass 3 keeps viewer memory local and non-canonical",()=>{
  assert.match(app,/localStorage\.setItem\(["']escie_/);
  assert.match(app,/LOCAL \/ PRIVATE \/ NON-CANONICAL/);
  assert.match(app,/not canon/i);
});
