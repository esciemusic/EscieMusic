/*
 * ESCIE INGESTION — DEDUPLICATE
 *
 * Deduplication identifies likely duplicate material.
 * It must never silently delete or merge canonical records.
 */

function findDuplicates(items = [], key = "id") {
  if (!Array.isArray(items)) {
    return [];
  }

  const seen = new Map();
  const duplicates = [];

  for (const item of items) {
    const value = item && item[key];

    if (value == null) {
      continue;
    }

    if (seen.has(value)) {
      duplicates.push({
        key,
        value,
        firstIndex: seen.get(value),
        duplicateIndex: items.indexOf(item)
      });
      continue;
    }

    seen.set(value, items.indexOf(item));
  }

  return duplicates;
}

if (typeof window !== "undefined") {
  window.ESCIE_DEDUPLICATE = findDuplicates;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = findDuplicates;
}
