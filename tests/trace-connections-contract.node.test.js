const test=require("node:test");
const assert=require("node:assert/strict");

function makeRecord(id,type){
  return {
    id,
    type,
    title:id,
    description:"synthetic public World thing",
    visibility:"public",
    published:true,
    status:"published",
    release_status:"released"
  };
}

test("Canonical Connections are the only public source for Trace",()=>{
  global.window={};
  window.ESCIE_RELEASE_RUNTIME={};
  window.ESCIE_PEOPLE=[makeRecord("person-a","person")];
  window.ESCIE_LOCATIONS=[makeRecord("place-a","location")];
  window.ESCIE_MOMENTS=[makeRecord("moment-a","moment")];
  window.ESCIE_OBJECTS=[makeRecord("object-a","object")];
  window.ESCIE_MUSIC=[];
  window.ESCIE_POETRY=[];
  window.ESCIE_DRAWINGS=[];
  window.ESCIE_PAINTINGS=[];
  window.ESCIE_WRITING=[];
  window.ESCIE_VISUAL_ART=[makeRecord("art-a","visual")];
  window.ESCIE_OTHER_ART=[];
  window.ESCIE_FRAGMENTS=[];
  window.ESCIE_BODIES=[];
  window.ESCIE_PROOF=[];
  window.ESCIE_ARCHIVE=[];
  window.ESCIE_PROJECTS=[];
  window.ESCIE_INVESTIGATION=[];
  window.ESCIE_NODES=[];
  window.ESCIE_RELATIONSHIPS=[
    {
      id:"rel-person-place",
      source_id:"person-a",
      target_id:"place-a",
      relationship_type:"LOCATED_AT",
      direction:"DIRECTED",
      status:"ACTIVE",
      visibility:"PUBLIC",
      release_status:"RELEASED",
      certainty:"CONFIRMED"
    },
    {
      id:"rel-place-moment",
      source_id:"place-a",
      target_id:"moment-a",
      relationship_type:"OCCURRED_AT",
      direction:"DIRECTED",
      status:"ACTIVE",
      visibility:"PUBLIC",
      release_status:"RELEASED",
      certainty:"CONFIRMED"
    },
    {
      id:"rel-private",
      source_id:"moment-a",
      target_id:"object-a",
      relationship_type:"REFERENCES",
      direction:"DIRECTED",
      status:"ACTIVE",
      visibility:"PRIVATE",
      release_status:"LOCKED"
    }
  ];

  delete require.cache[require.resolve("../data/web-contract.js")];
  require("../data/web-contract.js");
  delete require.cache[require.resolve("../data/registry.js")];
  require("../data/registry.js");

  const registry=window.ESCIE_RECORD_REGISTRY;
  const edges=registry.publicRelationships();
  assert.equal(edges.length,2);
  assert.deepEqual(edges.map(r=>[r.from,r.type,r.to]),[
    ["person-a","LOCATED_AT","place-a"],
    ["place-a","OCCURRED_AT","moment-a"]
  ]);
  assert.equal(registry.publicRelationships({record:"person-a"}).length,1);
  assert.equal(registry.publicRelationships({record:"object-a"}).length,0);
  assert.equal(registry.publicRelationships({type:"REFERENCES"}).length,0);
});
