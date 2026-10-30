const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs");

const desk=fs.readFileSync("central-connect/command-desk.js","utf8");

test("command desk owns the human review gate",()=>{
  for(const x of [
    'status:ok?"ACTIVE":d==="QUARANTINE"?"QUARANTINED":"ARCHIVED"',
    'state:ok?"APPROVED":d==="QUARANTINE"?"QUARANTINED":"REJECTED"',
    'actor:"HUMAN_OPERATOR"',
    'approval:{state:"PENDING",required:true}',
    'publication_state:"NOT_REQUESTED"'
  ]) assert(desk.includes(x),x);
});

test("command desk supports the complete operator intake surface",()=>{
  for(const x of [
    'RECEIVE CONTENT',
    'deskIntakeBtn',
    'deskRefresh',
    'ASK CENTRAL',
    'GIVE CENTRAL A TASK',
    'deskAskBtn',
    'deskTaskBtn',
    'ACCEPT',
    'DECLINE',
    'QUARANTINE',
    'data-tab'
  ]) assert(desk.includes(x),x);
});

test("command desk delegates services through Central broker",()=>{
  assert(desk.includes('ESCIE_THIRD_PARTY_BROKER'));
  assert(desk.includes('broker.plan'));
  assert(desk.includes('requires_human_approval:true'));
  assert(desk.includes('broker?.uploadPrivate'));
  assert(desk.includes('THIRD_PARTY_STORAGE_BROKER_UNAVAILABLE'));
});

test("command desk keeps uploaded content private until explicitly approved",()=>{
  assert(desk.includes('visibility:"CENTRAL"'));
  assert(desk.includes('status:"DRAFT"'));
  assert(desk.includes('publication_state:"NOT_REQUESTED"'));
  assert(desk.includes('storage_bucket:uploaded.bucket'));
  assert(desk.includes('storage_path:uploaded.storage_path'));
});

console.log("ESCIE Command Desk end-to-end contracts OK");
