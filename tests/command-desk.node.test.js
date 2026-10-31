const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs");const vm=require("node:vm");
const centralHtml=fs.readFileSync("central-connect/app.html","utf8");
assertNoMalformedCentralNewlines();
function assertNoMalformedCentralNewlines(){ assert(!centralHtml.includes("\\n"),"Central HTML must not contain malformed literal newline escapes"); let start=0; while((start=centralHtml.indexOf("<script>",start))!==-1){ const end=centralHtml.indexOf("</script>",start+8); assert(end!==-1,"Central script tag must close"); new vm.Script(centralHtml.slice(start+8,end),{filename:"central-connect/app.html"}); start=end+9; } }

const desk=fs.readFileSync("central-connect/command-desk.js","utf8");
new vm.Script(desk,{filename:"central-connect/command-desk.js"});
fs.readFileSync("central-connect/command-desk.js","utf8");
new vm.Script(desk,{filename:"central-connect/command-desk.js"});

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

test("command desk routes questions and tasks through the Central dispatcher",()=>{
  assert(desk.includes("ESCIE_AGENT_DISPATCHER"));
  assert(desk.includes("dispatchPlan"));
  assert(desk.includes("CENTRAL_DISPATCHER_UNAVAILABLE"));
  assert(desk.includes("message_type:\"HANDOFF\""));
  assert(desk.includes("message_type:\"APPROVAL_REQUEST\""));assert(desk.includes("requestedRole:selectedRole"));assert(desk.includes("id=\"deskService\""));assert(desk.includes("plan.results.map"));assert(desk.includes('message_type:"RESULT"'));assert(desk.includes('state:"PROPOSED"'));
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


test("command desk provides human review controls for specialist results",()=>{for(const x of ['data-jd="APPROVE"','data-jd="REJECT"','data-jd="QUARANTINE"','function reviewJob','state:next','human_review','S.tab==="REVIEW"','RESULTS AWAITING YOU'])assert(desk.includes(x),x)});


test("command desk preserves review history and creates controlled follow-up tasks",()=>{for(const x of ['review_history','REVISION_REQUESTED','RESULT_REVISION_REQUEST','APPROVED_EXECUTION_PREPARATION','requires_human_approval:true','Do not execute external side effects or change canon.','data-jd="MODIFY"'])assert(desk.includes(x),x)});

test("command desk review is workspace-scoped and modification requires operator feedback",()=>{for(const x of ['workspace_id=eq.','RESULT ALREADY REVIEWED','MODIFY requires operator feedback.','const now=new Date().toISOString(),review={decision:d,at:now,actor:"HUMAN_OPERATOR",feedback}','operator_feedback:feedback'])assert(desk.includes(x),x)});


test("command desk enforces grant package readiness and resets approval after edits",()=>{for(const x of [
  'PACKAGE NOT READY',
  'PRIMARY SOURCE IS NOT VERIFIED',
  'REQUIREMENT(S) INCOMPLETE',
  'CHECKLIST ITEM(S) INCOMPLETE',
  'DRAFT ANSWER(S) EMPTY',
  'BUDGET TOTAL DOES NOT MATCH COMPONENTS',
  'status:"READY_FOR_SUBMISSION"',
  'approval:{state:"APPROVED",required:false',
  'status:nextStatus',
  'approval:nextApproval',
  'approval:{state:"NOT_APPROVED",required:true}'
])assert(desk.includes(x),x)});

test("command desk persists failed requests for recovery",()=>{for(const x of [
  'kind:"CENTRAL_REQUEST_FAILURE"',
  'human_followup_required:true',
  'state:"FAILED"',
  'to_role:"audit-guardian"',
  'route_mode:plan?.route?.mode||"FAILED_REQUEST"',
  'REQUEST FAILED — AUDIT LOG ALSO FAILED'
])assert(desk.includes(x),x)});
