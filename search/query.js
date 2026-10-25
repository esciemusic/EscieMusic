/*
 * ESCIE SEARCH — QUERY
 *
 * Queries operate against the derived search index.
 * Search results are references to records, not new records.
 */

function searchESCIE(query = "", index = []) {
  const needle = String(query).trim().toLowerCase();

  if (!needle || !Array.isArray(index)) {
    return [];
  }

  const terms = needle.split(/\s+/).filter(Boolean);

  return index
    .map((entry) => {
      const score = terms.reduce(
        (total, term) => total + (entry.text.includes(term) ? 1 : 0),
        0
      );

      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => ({
      id: result.entry.id,
      type: result.entry.type,
      title: result.entry.title,
      score: result.score
    }));
}

if (typeof window !== "undefined") {
  window.ESCIE_SEARCH = searchESCIE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = searchESCIE;
}
