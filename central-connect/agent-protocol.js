/**
 * ESCIE CENTRAL — Agent Communication Protocol
 * 
 * Central is the only user-facing agent. Specialist agents are workers.
 * No specialist writes canonical state directly.
 */
window.ESCIE_AGENT_PROTOCOL = Object.freeze({
  version: "1.0",
  roles: Object.freeze({
    ORCHESTRATOR: "central-orchestrator",
    CREATIVE: "creative-work",
    RELATIONSHIPS: "brain-relationships",
    ARCHIVE: "archive-evidence",
    DISTRIBUTION: "release-distribution",
    GUARDIAN: "audit-guardian"
  }),
  states: Object.freeze([
    "REQUESTED","ROUTED","RECEIVED","WORKING","HANDOFF",
    "WAITING","PROPOSED","APPROVAL_REQUIRED","APPROVED",
    "REJECTED","QUARANTINED","COMPLETED","FAILED"
  ]),
  createEnvelope({conversationId, parentId=null, from, to, type="TASK", payload={}, contextRefs=[]}) {
    return {
      id: crypto.randomUUID(),
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
  }
});
