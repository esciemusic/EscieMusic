/**
 * ESCIE CENTRAL — LOCAL AGENT DISPATCHER
 * Specialist workers communicate through the Central envelope bus.
 * This is deterministic orchestration; external AI providers are optional
 * and never receive canonical-write authority.
 */
(()=>{const R=window.ESCIE_AGENT_RUNTIME,P=window.ESCIE_AGENT_PROTOCOL;if(!R||!P)return;
const processed=new Set();
function workerSummary(role){if(role===P.roles.ARCHIVE)return "Preserve sources, provenance, versions and evidence; flag missing support.";if(role===P.roles.RELATIONSHIPS)return "Inspect people, places, moments and recurring terms for candidate connections; nothing becomes canonical automatically.";if(role===P.roles.DISTRIBUTION)return "Prepare destination options, timing and approval requirements; publishing remains gated.";if(role===P.roles.GUARDIAN)return "Check permissions, security boundaries, conflicts and irreversible actions; escalate risk.";return "Organize the requested work into a structured task without deciding artistic meaning."}
function handle(e){if(!e||processed.has(e.id)||e.type!=="HANDOFF")return;processed.add(e.id);const summary=workerSummary(e.to);const result=R.emit(e.to,P.roles.ORCHESTRATOR,"RESULT",{text:String(e.payload?.text||""),summary,worker:e.to,requiresHumanApproval:true},e.conversation_id,e.id);result.meta=result.meta||{};result.meta.worker="local-deterministic";result.meta.requiresHumanApproval=true;R.emit(P.roles.ORCHESTRATOR,e.to,"RESULT",{summary,replyTo:result.id,requiresHumanApproval:true},e.conversation_id,result.id)}
window.addEventListener("escie:agent-envelope",e=>handle(e.detail));
window.ESCIE_AGENT_DISPATCHER=Object.freeze({version:"1.0",workers:Object.freeze([P.roles.CREATIVE,P.roles.RELATIONSHIPS,P.roles.ARCHIVE,P.roles.DISTRIBUTION,P.roles.GUARDIAN]),status:()=>({processed:processed.size})});
})();