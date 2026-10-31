/**
 * ESCIE CENTRAL — Agent Communication Protocol
 * 
 * Central is the only user-facing agent. Specialist agents are workers.
 * No specialist writes canonical state directly.
 */
window.ESCIE_AGENT_PROTOCOL = Object.freeze({
  version: "1.2",
  messageTypes: Object.freeze(["READ","ANALYZE","SUGGEST","RESEARCH","TASK","HANDOFF","RESULT","APPROVAL_REQUEST"]),
  roles: Object.freeze({
    ORCHESTRATOR: "central-orchestrator",
    CREATIVE: "creative-work",
    RELATIONSHIPS: "brain-relationships",
    ARCHIVE: "archive-evidence",
    DISTRIBUTION: "release-distribution",
    GUARDIAN: "audit-guardian",
    LEGAL: "legal-contract",
    RIGHTS: "rights-clearance",
    FUNDING: "grants-funding",
    EDITOR: "editor-proofreading",
    ADMIN: "ip-business-admin"
  }),
  states: Object.freeze([
    "REQUESTED","ROUTED","RECEIVED","WORKING","HANDOFF",
    "WAITING","PROPOSED","APPROVAL_REQUIRED","APPROVED",
    "REJECTED","QUARANTINED","COMPLETED","FAILED"
  ]),
  createEnvelope({conversationId, parentId=null, from, to, type="TASK", payload={}, contextRefs=[]}) {
    return {
      id: (globalThis.crypto&&typeof globalThis.crypto.randomUUID==="function")?globalThis.crypto.randomUUID():("env-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)),
      conversation_id: conversationId,
      parent_id: parentId,
      from,
      to,
      type,
      state: "REQUESTED",
      payload,
      context_refs: contextRefs,
      created_at: new Date().toISOString()
    };
  },
  canWriteCanonical(role) {
    return role === "central-orchestrator" && false;
  },
  requiresHumanApproval(type) {
    return !["READ","ANALYZE","SUGGEST","RESEARCH"].includes(type);
  },
  nextState(current, event) {
    const map={REQUEST:["REQUESTED","ROUTED"],RECEIVE:["ROUTED","RECEIVED"],START:["RECEIVED","WORKING"],HANDOFF:["WORKING","HANDOFF"],PROPOSE:["WORKING","PROPOSED"],APPROVAL:["PROPOSED","APPROVAL_REQUIRED"],APPROVE:["APPROVAL_REQUIRED","APPROVED"],REJECT:["APPROVAL_REQUIRED","REJECTED"],QUARANTINE:["PROPOSED","QUARANTINED"],COMPLETE:["APPROVED","COMPLETED"],FAIL:["WORKING","FAILED"]};
    const pair=map[event]; return pair&&pair[0]===current?pair[1]:null;
  }
});
