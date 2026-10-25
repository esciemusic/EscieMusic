/*
 * ESCIE INGESTION — NORMALIZE
 *
 * Normalization converts incoming material into predictable structure.
 * It should clean format, not change meaning.
 *
 * Media is first-class input here, but normalization does not decide
 * publication, canon, truth, or disclosure.
 */

function normalizeInput(input = {}) {
  const metadata =
    input.metadata && typeof input.metadata === "object"
      ? { ...input.metadata }
      : {};

  const rawMedia =
    Array.isArray(input.media)
      ? input.media
      : Array.isArray(metadata.media)
        ? metadata.media
        : [];

  const media =
    typeof window !== "undefined" &&
    window.ESCIE_MEDIA &&
    typeof window.ESCIE_MEDIA.normalizeAll === "function"
      ? window.ESCIE_MEDIA.normalizeAll(rawMedia)
      : rawMedia;

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
    metadata,
    media,
    normalizedAt: new Date().toISOString()
  };
}

if (typeof window !== "undefined") {
  window.ESCIE_NORMALIZE = normalizeInput;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = normalizeInput;
}
