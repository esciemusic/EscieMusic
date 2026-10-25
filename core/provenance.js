/*
 * ESCIE CORE PROVENANCE
 *
 * Provenance answers: where did this information/material come from,
 * and what happened to it before it reached the current record?
 *
 * Provenance is not evidence, meaning, or canon.
 */

function createProvenance(input = {}) {
  return {
    sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
    origin: input.origin || "unknown",
    transformation: input.transformation || "none",
    certainty: input.certainty || "unknown",
    chain: Array.isArray(input.chain)
      ? input.chain.map((step) => ({
          sourceId: step && step.sourceId ? step.sourceId : null,
          action: step && step.action ? step.action : "unknown",
          timestamp: step && step.timestamp ? step.timestamp : null,
          actor: step && step.actor ? step.actor : "system"
        }))
      : []
  };
}

function validateProvenance(provenance = {}, sourceRegistry = []) {
  const value = provenance || {};
  const sources = Array.isArray(sourceRegistry) ? sourceRegistry : [];
  const knownIds = new Set(
    sources.map((source) => source && source.id).filter(Boolean)
  );
  const errors = [];
  const missingSourceIds = [];

  if (!Array.isArray(value.sourceIds)) {
    errors.push("Provenance sourceIds must be an array.");
  } else {
    value.sourceIds.forEach((sourceId, index) => {
      if (typeof sourceId !== "string" || !sourceId.trim()) {
        errors.push("Provenance sourceIds must contain non-empty strings.");
        return;
      }
      if (knownIds.size > 0 && !knownIds.has(sourceId)) {
        missingSourceIds.push({ sourceId, index });
      }
    });
  }

  if (!Array.isArray(value.chain)) {
    errors.push("Provenance chain must be an array.");
  }

  return {
    valid: errors.length === 0 && missingSourceIds.length === 0,
    errors,
    missingSourceIds
  };
}

function attachSource(provenance = {}, sourceId) {
  const next = createProvenance(provenance);

  if (typeof sourceId !== "string" || !sourceId.trim()) {
    return next;
  }

  if (!next.sourceIds.includes(sourceId)) {
    next.sourceIds.push(sourceId);
  }

  return next;
}

const ESCIE_PROVENANCE = {
  create: createProvenance,
  validate: validateProvenance,
  attachSource
};

if (typeof window !== "undefined") {
  window.ESCIE_PROVENANCE = ESCIE_PROVENANCE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_PROVENANCE;
}
