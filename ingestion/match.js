/*
 * ESCIE INGESTION — MATCH
 *
 * Matching looks for possible existing records corresponding to incoming
 * material. A match is a candidate, not an automatic merge.
 */

function matchInput(input = {}, records = []) {
  if (!input || !Array.isArray(records)) {
    return [];
  }

  const normalizedTitle =
    typeof input.title === "string"
      ? input.title.trim().toLowerCase()
      : null;

  if (!normalizedTitle) {
    return [];
  }

  return records.filter((record) => {
    const title =
      typeof record.title === "string"
        ? record.title.trim().toLowerCase()
        : null;

    return title && title === normalizedTitle;
  }).map((record) => ({
    recordId: record.id || null,
    reason: "exact-normalized-title",
    confidence: "strongly_supported"
  }));
}

if (typeof window !== "undefined") {
  window.ESCIE_MATCH = matchInput;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = matchInput;
}
