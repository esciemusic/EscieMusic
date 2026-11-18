const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("World elements use the canonical five primary types and four deeper types",()=>{
  const engine=read("world-engine.js");
  const registry=read("data/registry.js");
  const contract=read("data/web-contract.js");
  for(const lens of ["people","places","moments","objects","art","fragments","proof","bodies","archives","trace"]){
    assert.match(engine,new RegExp('"'+lens+'"'));
  }
  assert.doesNotMatch(engine,/ESCIE_PATHS/);
  assert.doesNotMatch(engine,/\["path","PATH"/);
  assert.doesNotMatch(engine,/\["trails","TRAILS"/);
  assert.match(contract,/WORLD_TYPES=\["PERSON","PLACE","MOMENT","OBJECT","ART"\]/);
  assert.match(contract,/DEEP_TYPES=\["FRAGMENT","PROOF","BODY","ARCHIVE"\]/);
  assert.match(registry,/function publicRelationships\(filters\)/);
});

test("World layers remain distinct",()=>{
  const engine=read("world-engine.js");
  assert.match(engine,/function traceView\(\)/);
  assert.doesNotMatch(engine,/function trails\(rows\)/);
  assert.doesNotMatch(engine,/function graphView\(rows\)/);
  assert.match(engine,/function discovery\(rows\)/);
});

test("Trace is a visitor path, not a second network interface",()=>{
  const engine=read("world-engine.js");
  assert.match(engine,/WHERE THIS CAN LEAD/);
  assert.match(engine,/YOUR TRACE/);
  assert.match(engine,/THE TRACE ENDS HERE/);
  assert.match(engine,/data-node=/);
  assert.doesNotMatch(engine,/RELATIONSHIP GRAPH/);
  assert.doesNotMatch(engine,/TRAILHEAD/);
  assert.doesNotMatch(engine,/ESCIE_PATHS/);
});
