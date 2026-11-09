const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const spec=fs.readFileSync(path.join(root,"GLASS_EYE_PASS_1.md"),"utf8");

test("Glass Eye Pass 1 preserves the audience-eye concept",()=>{
  assert.match(spec,/GLASS EYE is the audience eye/);
  assert.match(spec,/see;/);
  assert.match(spec,/hear;/);
  assert.match(spec,/follow;/);
  assert.match(spec,/return./);
});

test("Glass Eye keeps viewer memory non-canonical",()=>{
  assert.match(spec,/local;/);
  assert.match(spec,/private;/);
  assert.match(spec,/non-canonical;/);
  assert.match(spec,/not Central history/);
});

test("Glass Eye participation is explicitly moderated before public disclosure",()=>{
  const participation=fs.readFileSync(path.join(root,"data","glass-eye-participation.js"),"utf8");
  assert.match(participation,/source:"GLASS_EYE"/);
  assert.match(participation,/status:"PENDING_REVIEW"/);
  assert.match(participation,/public_disclosure:false/);
  assert.match(participation,/approvedEndpoint/);
  assert.match(participation,/ONLY PHOTO, VIDEO OR AUDIO FILES ARE ACCEPTED/);
});

test("Glass Eye preserves multilingual and world-return behavior",()=>{
  assert.match(spec,/EN \/ FR \/ ES/);
  assert.match(spec,/Return-to-world navigation remains direct/);
});

test("Glass Eye does not become an ARG or reality filter",()=>{
  assert.match(spec,/No reality-classification labels appear/);
  assert.match(spec,/No forced puzzle\/investigation behavior is introduced/);
  assert.match(spec,/No game or shop dependency is required/);
});
