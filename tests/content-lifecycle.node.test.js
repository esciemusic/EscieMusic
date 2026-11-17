const test=require("node:test");
const assert=require("node:assert/strict");
function record(id,type,extra={}){ return {id,type,title:id,description:"synthetic content lifecycle fixture",visibility:"public",published:true,status:"published",release_status:"locked",approved:false,public_disclosure:true,...extra}; }
test("Content lifecycle CREATE → RELEASE → DISCOVER → TRACE → RETURN stays fail-closed",()=>{
  global.window={}; window.ESCIE_RELEASE_RUNTIME={}; window.ESCIE_RECORDS=[]; window.ESCIE_ABOUT=null;
  window.ESCIE_PROJECTS=[]; window.ESCIE_MUSIC=[]; window.ESCIE_POETRY=[]; window.ESCIE_DRAWINGS=[]; window.ESCIE_PAINTINGS=[]; window.ESCIE_WRITING=[]; window.ESCIE_VISUAL_ART=[]; window.ESCIE_OTHER_ART=[];
  window.ESCIE_PEOPLE=[]; window.ESCIE_LOCATIONS=[]; window.ESCIE_MOMENTS=[]; window.ESCIE_OBJECTS=[]; window.ESCIE_FRAGMENTS=[]; window.ESCIE_BODIES=[]; window.ESCIE_PATHS=[]; window.ESCIE_INVESTIGATION=[]; window.ESCIE_PROOF=[]; window.ESCIE_ARCHIVE=[]; window.ESCIE_SIGNALS=[]; window.ESCIE_CLOTHING=[]; window.ESCIE_GAMES=[]; window.ESCIE_RELATIONSHIPS=[];
  window.normalizeEscieRecord=(r,type)=>Object.assign({type},r);
  window.ESCIE_RELATIONSHIP={validate:()=>({valid:true}),canDisclose:()=>true,toPublicView:r=>r,getCategory:()=> "context"};
  const publish=require("../data/public-publishing.js"); delete require.cache[require.resolve("../data/registry.js")]; require("../data/registry.js");
  const place=record("lifecycle-place","location",{release_status:"released",approved:true});
  const art=record("lifecycle-art","visual",{release_status:"locked",approved:false,media:[{type:"image",url:"https://example.test/art.jpg"}],public_sections:["art","world","web"]});
  window.ESCIE_LOCATIONS.push(place); window.ESCIE_VISUAL_ART.push(art);
  window.ESCIE_RELATIONSHIPS.push({id:"lifecycle-rel",from:"lifecycle-art",type:"located_at",to:"lifecycle-place",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true});
  assert.ok(window.ESCIE_RECORD_REGISTRY.get("lifecycle-art")); assert.equal(window.ESCIE_RECORD_REGISTRY.relationshipAudit().ok,true);
  assert.equal(window.ESCIE_RECORD_REGISTRY.publicRecord("lifecycle-art"),null); assert.equal(publish.canEnter(art,"art"),false); assert.equal(window.ESCIE_RECORD_REGISTRY.publicRelationships({record:"lifecycle-art"}).length,0); assert.equal(window.ESCIE_RECORD_REGISTRY.manifestFor("lifecycle-art").released,false);
  art.approved=true; art.release_status="released"; art.status="published";
  const released=window.ESCIE_RECORD_REGISTRY.publicRecord("lifecycle-art"); assert.ok(released); assert.equal(publish.approved(released),true); assert.equal(publish.canEnter(released,"art"),true); assert.equal(window.ESCIE_RECORD_REGISTRY.manifestFor("lifecycle-art").released,true);
  const manifest=window.ESCIE_RECORD_REGISTRY.manifestFor("lifecycle-art"); assert.equal(manifest.sections.web,true); assert.ok(window.ESCIE_RECORD_REGISTRY.publicRelationships({record:"lifecycle-art"}).some(r=>r.to==="lifecycle-place")); assert.ok(window.ESCIE_RECORD_REGISTRY.contextFor("lifecycle-art").record);
  const again=window.ESCIE_RECORD_REGISTRY.publicRecord("lifecycle-art"); assert.equal(again.id,released.id); assert.equal(window.ESCIE_RECORD_REGISTRY.duplicates().length,0);
  const blocked=[record("blocked-private","object",{visibility:"private",release_status:"released",approved:true}),record("blocked-withheld","object",{visibility:"withheld",release_status:"released",approved:true}),record("blocked-locked","object",{visibility:"public",release_status:"locked",approved:true})];
  window.ESCIE_OBJECTS.push(...blocked); for(const item of blocked){assert.equal(window.ESCIE_RECORD_REGISTRY.publicRecord(item.id),null,item.id); assert.equal(publish.approved(item),false,item.id);}
});