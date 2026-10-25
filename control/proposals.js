/*
 * ESCIE CONTROL — PROPOSALS
 *
 * Proposals describe possible actions prepared by the system.
 * A proposal is not a decision and cannot silently become one.
 */

const ESCIE_PROPOSALS = [];

function createProposal(input = {}) {
  return {
    id: input.id || null,
    title: input.title || "Untitled proposal",
    action: input.action || null,
    reason: input.reason || null,
    evidence: Array.isArray(input.evidence) ? [...input.evidence] : [],
    affectedRecords: Array.isArray(input.affectedRecords)
      ? [...input.affectedRecords]
      : [],
    alternatives: Array.isArray(input.alternatives)
      ? [...input.alternatives]
      : [],
    risk: input.risk || "unknown",
    reversibility: input.reversibility || "unknown",
    confidence: input.confidence || "unknown",
    status: input.status || "pending",
    createdAt: input.createdAt || new Date().toISOString()
  };
}

function addProposal(input = {}) {
  const proposal = createProposal(input);
  ESCIE_PROPOSALS.push(proposal);
  return proposal;
}

if (typeof window !== "undefined") {
  window.ESCIE_PROPOSALS = ESCIE_PROPOSALS;
  window.ESCIE_PROPOSAL_API = {
    create: createProposal,
    add: addProposal
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_PROPOSALS,
    createProposal,
    addProposal
  };
}
