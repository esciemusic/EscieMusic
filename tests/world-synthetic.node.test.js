const test=require("node:test");
const assert=require("node:assert/strict");

function makeRecord(id,type,extra={}){
  return {
    id,
    type,
    title:id,
    description:"synthetic integration record",
    visibility:"public",
    published:true,
    status:"published",
    release_status:"released",
    ...extra
  };
}

test("Synthetic World integrates all core and deeper record perspectives through THE WEB",()=>{
  global.window={};

  window.ESCIE_RELEASE_RUNTIME={};
  window.ESCIE_RECORDS=[];

  const recordContract=require("../data/record-contract.js");
  const relationshipContract=require("../relationship.js");
  const objectRegistry=require("../data/objects.js");

  window.normalizeEscieRecord=recordContract.normalizeEscieRecord;
  window.ESCIE_RELATIONSHIP=relationshipContract;

  window.ESCIE_PEOPLE=[makeRecord("person-a","person")];
  window.ESCIE_LOCATIONS=[makeRecord("place-a","location")];
  window.ESCIE_MOMENTS=[makeRecord("moment-a","moment")];
  window.ESCIE_OBJECTS=objectRegistry;
  window.ESCIE_MUSIC=[];
  window.ESCIE_POETRY=[];
  window.ESCIE_DRAWINGS=[];
  window.ESCIE_PAINTINGS=[];
  window.ESCIE_WRITING=[];
  window.ESCIE_VISUAL_ART=[makeRecord("art-a","visual")];
  window.ESCIE_OTHER_ART=[];
  window.ESCIE_FRAGMENTS=[makeRecord("fragment-a","fragment")];
  window.ESCIE_BODIES=[makeRecord("body-a","body")];
  window.ESCIE_PATHS=[makeRecord("path-a","path")];
  window.ESCIE_PROOF=[makeRecord("proof-a","proof")];
  window.ESCIE_ARCHIVE=[makeRecord("archive-a","archive")];

  window.ESCIE_OBJECTS.push(makeRecord("object-a","object"));

  window.ESCIE_RELATIONSHIPS=[
    {id:"rel-person-place",from:"person-a",type:"located_at",to:"place-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-moment-place",from:"moment-a",type:"occurred_at",to:"place-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-moment-object",from:"moment-a",type:"includes",to:"object-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-art-object",from:"art-a",type:"references",to:"object-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-fragment-moment",from:"fragment-a",type:"contextualizes",to:"moment-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-proof-moment",from:"proof-a",type:"supports",to:"moment-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-body-person",from:"body-a",type:"subject_of",to:"person-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-archive-art",from:"archive-a",type:"includes",to:"art-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-path-art",from:"path-a",type:"includes",to:"art-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true}
  ];

  delete require.cache[require.resolve("../data/registry.js")];
  require("../data/registry.js");

  const registry=window.ESCIE_RECORD_REGISTRY;
  const expected=["person-a","place-a","moment-a","object-a","art-a","fragment-a","body-a","path-a","proof-a","archive-a"];
  const records=registry.records();

  for(const id of expected) assert.ok(registry.get(id),`missing synthetic record: ${id}`);

  assert.equal(registry.duplicates().length,0);
  assert.equal(registry.relationshipAudit().ok,true);

  const publicEdges=registry.publicRelationships();
  assert.equal(publicEdges.length,9);

  for(const id of expected){
    assert.ok(registry.publicRecord(id),`record should be public: ${id}`);
  }

  const objectConnections=registry.relationshipsFor("object-a");
  assert.equal(objectConnections.length,2);
  assert.ok(objectConnections.some(r=>r.from==="moment-a"&&r.to==="object-a"));
  assert.ok(objectConnections.some(r=>r.from==="art-a"&&r.to==="object-a"));

  // Locked/private material must fail closed even when relationships are otherwise valid.
  const locked=makeRecord("locked-a","object",{release_status:"locked"});
  const privateRecord=makeRecord("private-a","person",{visibility:"private"});
  window.ESCIE_OBJECTS.push(locked);
  window.ESCIE_PEOPLE.push(privateRecord);
  window.ESCIE_RELATIONSHIPS.push(
    {id:"rel-locked-object",from:"art-a",type:"references",to:"locked-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
    {id:"rel-private-person",from:"private-a",type:"friend_of",to:"person-a",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true}
  );

  assert.equal(registry.publicRecord("locked-a"),null);
  assert.equal(registry.publicRecord("private-a"),null);
  assert.equal(registry.relationshipsFor("art-a").some(r=>r.to==="locked-a"),false);
  assert.equal(registry.relationshipsFor("person-a").some(r=>r.from==="private-a"),false);
});
