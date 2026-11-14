const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

function loadPublishing(){
  const source=fs.readFileSync("data/public-publishing.js","utf8");
  const context={window:{ESCIE_RECORD_REGISTRY:{allPublicRecords:()=>[],manifestFor:()=>null}}};
  vm.runInNewContext(source,context);
  return context.window.ESCIE_PUBLIC_PUBLISHING;
}

test("public/Central integration boundary remains explicit",()=>{
  const contract=fs.readFileSync("INTEGRATION_CONTRACT.md","utf8");
  assert.match(contract,/CENTRAL → PUBLIC/);
  assert.match(contract,/approved, release-eligible, public-safe outputs/);
  assert.match(contract,/no automatic ingestion/);
  assert.match(contract,/BRAIN → CANON/);
  assert.match(contract,/EXTERNAL PLATFORM → CANON/);
  assert.match(contract,/Unreleased BAM\/Dallas '63/);
  assert.match(contract,/game remains a separate full-screen experience/);
});

test("public source contains no Central secret key material",()=>{
  const files=["index.html","app.js"];
  for(const file of files){
    const source=fs.readFileSync(file,"utf8").toLowerCase();
    assert.doesNotMatch(source,/service_role/);
    assert.doesNotMatch(source,/supabase_service_role/);
  }
});

test("public projection boundary rejects unsafe Central states",()=>{
  const gate=loadPublishing();
  const base={id:"x",status:"published",published:true,visibility:"public",release_status:"released",public_disclosure:true};
  assert.equal(gate.canEnter({...base,public_sections:["art"]},"art"),false);
  assert.equal(gate.canEnter({...base,approved:true,public_sections:["art"]},"art"),true);
  assert.equal(gate.canEnter({...base,approved:true,canonical_write:true,public_sections:["art"]},"art"),false);
  assert.equal(gate.canEnter({...base,approved:true,locked:true,public_sections:["art"]},"art"),false);
  assert.equal(gate.canEnter({...base,approved:true,central_secret:true,public_sections:["art"]},"art"),false);
  assert.equal(gate.canEnter({...base,approved:true,public_source:"central",public_sections:["art"]},"art"),false);
  assert.equal(gate.canEnter({...base,approved:true,public_sections:["art"]},"web"),false);
});

test("public boundary is projection-only and never grants canonical write",()=>{
  const gate=loadPublishing();
  const audit=gate.boundaryAudit({id:"x",canonical_write:false});
  assert.equal(audit.ok,true);
  assert.deepEqual(gate.boundaryAudit({id:"x",canonical_write:true}).ok,false);
});
