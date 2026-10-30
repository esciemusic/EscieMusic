/**
 * ESCIE CENTRAL — LOCAL AGENT DISPATCHER
 * Central is the single voice. This layer turns one operator request into a
 * visible, deterministic work plan and specialist handoffs. It never writes canon.
 */
(()=>{const R=window.ESCIE_AGENT_RUNTIME,P=window.ESCIE_AGENT_PROTOCOL;if(!R||!P)return;
const processed=new Set();
const rules=[
  {role:P.roles.ARCHIVE,words:/archive|evidence|proof|source|provenance|version|history|citation/},
  {role:P.roles.DISTRIBUTION,words:/release|publish|post|instagram|tiktok|youtube|schedule|distribution|merch|store/},
  {role:P.roles.RELATIONSHIPS,words:/relationship|connect|correlat|pattern|contradict|missing|people|place|moment|link|trace/},
  {role:P.roles.GUARDIAN,words:/audit|security|permission|conflict|guard|risk|delete|overwrite|canonical|approve|change/},
  {role:P.roles.CREATIVE,words:/song|music|lyrics|art|story|write|design|cover|visual|creative|idea/}
];
function rolesFor(text){const m=String(text||"").toLowerCase(),out=[];rules.forEach(r=>{if(r.words.test(m)&&!out.includes(r.role))out.push(r.role)});if(!out.length)out.push(P.roles.CREATIVE);if(/approve|publish|delete|overwrite|canonical|change|update|create/.test(m)&&!out.includes(P.roles.GUARDIAN))out.push(P.roles.GUARDIAN);return out.slice(0,4)}
function workerSummary(role){const x={};x[P.roles.ARCHIVE]="Preserve sources, provenance, versions and evidence; identify what is missing.";x[P.roles.RELATIONSHIPS]="Trace people, places, moments, works and patterns; distinguish links from assumptions.";x[P.roles.DISTRIBUTION]="Prepare packaging, metadata, schedules and destination actions; publishing stays gated.";x[P.roles.GUARDIAN]="Check permissions, conflicts, irreversible actions and canon boundaries; escalate anything requiring human judgment.";x[P.roles.CREATIVE]="Organize creative intent into usable work items without deciding artistic meaning for ESCIE.";return x[role]||x[P.roles.CREATIVE]}
function emitResult(e,role){const result=R.emit(role,P.roles.ORCHESTRATOR,"RESULT",{text:String(e.payload?.text||""),summary:workerSummary(role),worker:role,requiresHumanApproval:true,plan_step:e.payload?.plan_step||null},e.conversation_id,e.id);result.meta=result.meta||{};result.meta.worker="local-deterministic";result.meta.requiresHumanApproval=true;return result}
function handle(e){if(!e||processed.has(e.id)||e.type!=="HANDOFF")return;processed.add(e.id);emitResult(e,e.to)}
window.addEventListener("escie:agent-envelope",e=>handle(e.detail));
window.ESCIE_AGENT_DISPATCHER=Object.freeze({version:"2.1",workers:Object.freeze([P.roles.CREATIVE,P.roles.RELATIONSHIPS,P.roles.ARCHIVE,P.roles.DISTRIBUTION,P.roles.GUARDIAN]),rolesFor,workerSummary,dispatchPlan({conversationId,text,from=P.roles.ORCHESTRATOR}){const roles=rolesFor(text),task=R.emit(from,from,"TASK",{text,source:"operator",plan_size:roles.length,approval_required:true},conversationId),handoffs=roles.map((role,index)=>R.emit(from,role,"HANDOFF",{text,source:"operator",routing:"deterministic-v2",plan_step:index+1,plan_total:roles.length,summary:workerSummary(role),approval_required:true},conversationId,task.id)),approval=R.emit(from,from,"APPROVAL_REQUEST",{text,roles,reason:"Central prepared a plan. Review specialist findings before any canonical or external action.",requiresHumanApproval:true},conversationId,task.id);return {task,handoffs,approval,roles}} ,status:()=>({processed:processed.size})});
})();
