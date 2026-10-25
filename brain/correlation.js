/*
 * ESCIE BRAIN — CORRELATION
 *
 * Correlation detects patterns and produces candidate connections.
 *
 * A correlation is never a relationship by itself.
 * Similar imagery, shared locations, repeated language, proximity in time,
 * or common people may be meaningful, coincidental, or unresolved.
 */

const ESCIE_CORRELATIONS = [];

function createCorrelation(input = {}) {
  return {
    id: input.id || null,
    type: input.type || "unknown",
    fromIds: Array.isArray(input.fromIds) ? [...input.fromIds] : [],
    toIds: Array.isArray(input.toIds) ? [...input.toIds] : [],
    signals: Array.isArray(input.signals) ? [...input.signals] : [],
    score: typeof input.score === "number" ? input.score : null,
    explanation: input.explanation || null,
    confidence: input.confidence || "unknown",
    status: input.status || "candidate",
    createdAt: input.createdAt || new Date().toISOString()
  };
}

function addCorrelation(input = {}) {
  const correlation = createCorrelation(input);
  ESCIE_CORRELATIONS.push(correlation);
  return correlation;
}

function findCorrelations(recordId) {
  if (!recordId) {
    return [];
  }

  return ESCIE_CORRELATIONS.filter((item) =>
    item.fromIds.includes(recordId) ||
    item.toIds.includes(recordId)
  );
}

if (typeof window !== "undefined") {
  window.ESCIE_CORRELATIONS = ESCIE_CORRELATIONS;
  window.ESCIE_CORRELATION_API = {
    create: createCorrelation,
    add: addCorrelation,
    findForRecord: findCorrelations
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_CORRELATIONS,
    createCorrelation,
    addCorrelation,
    findCorrelations
  };
}
