/*
 * ESCIE BRAIN — EVIDENCE BOARD
 *
 * Evidence organizes observations and their relationship to claims.
 * It does not decide truth by itself.
 *
 * Supporting evidence, contradictions, uncertainty, and unknowns remain
 * visible so the Brain can reason without manufacturing certainty.
 */

const ESCIE_EVIDENCE = [];

function createEvidenceEntry(input = {}) {
  return {
    id: input.id || null,
    claim: input.claim || null,
    status: input.status || "unknown",
    confidence: input.confidence || "unknown",
    sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
    recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : [],
    supports: Array.isArray(input.supports) ? [...input.supports] : [],
    contradicts: Array.isArray(input.contradicts) ? [...input.contradicts] : [],
    unknowns: Array.isArray(input.unknowns) ? [...input.unknowns] : [],
    observedAt: input.observedAt || null,
    notes: input.notes || null
  };
}

function addEvidence(input = {}) {
  const entry = createEvidenceEntry(input);
  ESCIE_EVIDENCE.push(entry);
  return entry;
}

if (typeof window !== "undefined") {
  window.ESCIE_EVIDENCE = ESCIE_EVIDENCE;
  window.ESCIE_EVIDENCE_API = {
    create: createEvidenceEntry,
    add: addEvidence
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_EVIDENCE,
    createEvidenceEntry,
    addEvidence
  };
}
