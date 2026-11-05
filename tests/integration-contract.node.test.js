const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");

test("public/Central integration boundary remains explicit",()=>{
  const contract=fs.readFileSync("INTEGRATION_CONTRACT.md","utf8");
  assert.match(contract,/CENTRAL → PUBLIC/);
  assert.match(contract,/approved, release-eligible, public-safe outputs/);
  assert.match(contract,/No automatic ingestion/);
  assert.match(contract,/BRAIN → CANON/);
  assert.match(contract,/External Platform → CANON|EXTERNAL PLATFORM → CANON/);
  assert.match(contract,/Unreleased BAM\/Dallas '63/);
  assert.match(contract,/game remains a separate full-screen experience/);
});

test("public source contains no Central secret key material",()=>{
  const files=["index.html","app.js","central-connect/app.html"];
  for(const file of files){
    const source=fs.readFileSync(file,"utf8").toLowerCase();
    assert.doesNotMatch(source,/service_role/);
    assert.doesNotMatch(source,/supabase_service_role/);
  }
});
