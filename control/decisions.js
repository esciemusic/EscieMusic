/*
 * ESCIE CONTROL — DECISIONS
 *
 * Decisions are human/editorial authority records.
 *
 * The system may recommend, prepare, and remember. A decision records
 * what ESCIE actually chose and preserves the reasoning and outcome.
 */

const ESCIE_DECISIONS = [];

function createDecision(input = {}) {
  return {
    id: input.id || null,
    proposalId: input.proposalId || null,
    action: input.action || "DEFER",
    reason: input.reason || null,
    alternativesConsidered: Array.isArray(input.alternativesConsidered)
      ? [...input.alternativesConsidered]
      : [],
    affectedRecords: Array.isArray(input.affectedRecords)
      ? [...input.affectedRecords]
      : [],
    actor: input.actor || "ESCIE",
    timestamp: input.timestamp || new Date().toISOString(),
    outcome: input.outcome || null,
    reviewAt: input.reviewAt || null,
    sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
    historyEntryId: input.historyEntryId || null
  };
}

function recordDecision(input = {}) {
  const decision = createDecision(input);
  ESCIE_DECISIONS.push(decision);

  const history =
    typeof window !== "undefined" ? window.ESCIE_HISTORY_API : null;

  if (history && typeof history.append === "function") {
    const result = history.append({
      id: input.historyEntryId || ("history-decision-" + decision.id),
      event: "decision_recorded",
      recordId: decision.affectedRecords[0] || null,
      actor: decision.actor,
      next: decision.outcome,
      reason: decision.reason,
      sourceIds: decision.sourceIds,
      metadata: {
        decisionId: decision.id,
        proposalId: decision.proposalId,
        action: decision.action
      }
    });

    if (result && result.valid !== false && result.entry) {
      decision.historyEntryId = result.entry.id;
    }
  }

  return decision;
}

if (typeof window !== "undefined") {
  window.ESCIE_DECISIONS = ESCIE_DECISIONS;
  window.ESCIE_DECISION_API = {
    create: createDecision,
    record: recordDecision
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_DECISIONS,
    createDecision,
    recordDecision
  };
}
