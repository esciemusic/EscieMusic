/*
 * ESCIE INGESTION — NORMALIZE
 *
 * Normalization converts incoming material into predictable structure.
 * It should clean format, not change meaning.
 */

function normalizeInput(input = {}) {
  return {
    id: input.id || null,
    sourceId: input.sourceId || null,
    type: input.type || "unknown",
    title: typeof input.title === "string" ? input.title.trim() : null,
    description:
      typeof input.description === "string"
        ? input.description.trim()
        : null,
    payload: input.payload ?? null,
    metadata: input.metadata && typeof input.metadata === "object"
      ? { ...input.metadata }
      : {},
    normalizedAt: new Date().toISOString()
  };
}

if (typeof window !== "undefined") {
  window.ESCIE_NORMALIZE = normalizeInput;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = normalizeInput;
}
