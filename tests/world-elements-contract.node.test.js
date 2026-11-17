const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("World elements have canonical structural coverage",()=>{
  const engine=read("world-engine.js");
  const registry=read("data/registry.js");
  const record=read("record.js");
  const bodies=read("data/bodies.js");
  for(const lens of ["people","places","moments","objects","fragments","bodies","proof","path","trace","trails"]){
    assert.match(engine,new RegExp('\\"'+lens+'\\"|\\['+"'"+lens+"'"));
  }
  for(const source of ["ESCIE_PEOPLE","ESCIE_LOCATIONS","ESCIE_MOMENTS","ESCIE_OBJECTS","ESCIE_FRAGMENTS","ESCIE_BODIES","ESCIE_PROOF","ESCIE_PATHS"]){
    assert.match(registry,new RegExp(source));
  }
  assert.match(record,/OBJECT:\s*"object"/);
  assert.match(bodies,/physical presence in the World/);
  assert.match(bodies,/People remain the identity layer/);
});

test("World layers remain distinct",()=>{
  const engine=read("world-engine.js");
  assert.match(engine,/function traceView\(\)/);
  assert.match(engine,/function trails\(rows\)/);
  assert.match(engine,/function graphView\(rows\)/);
  assert.match(engine,/function discovery\(rows\)/);
});
