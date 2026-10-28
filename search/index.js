/*
 * ESCIE SEARCH — INDEX
 *
 * Search indexes are derived data. They help people find existing ESCIE
 * records but never become the canonical source of those records.
 */

const ESCIE_SEARCH_INDEX = {
  entries: [],

  clear() {
    this.entries.length = 0;
  },

  add(record = {}) {
    if (!record || !record.id) return null;

    const registry =
      typeof window !== "undefined" ? window.ESCIE_RECORD_REGISTRY : null;

    if (registry && typeof registry.releaseVisible === "function") {
      if (!registry.releaseVisible(record)) return null;
    } else if (record.release_status && record.release_status !== "released") {
      return null;
    } else if (record.type === "project" && record.release_mode === "progressive") {
      return null;
    }

    const published =
      record.published === true ||
      record.status === "published";
    const visibility = String(record.visibility || "").toLowerCase();

    if (!published || ["private", "withheld", "limited"].includes(visibility)) {
      return null;
    }

    const entry = {
      id: record.id,
      type: record.type || null,
      title: typeof record.title === "string" ? record.title : "",
      text: [
        record.title,
        record.description,
        ...(Array.isArray(record.tags) ? record.tags : []),
        ...(Array.isArray(record.people) ? record.people : []),
        ...(Array.isArray(record.locations) ? record.locations : []),
        record.role,
        record.type
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    };

    this.entries.push(entry);
    return entry;
  },

  build(records = []) {
    this.clear();

    const registry =
      typeof window !== "undefined" ? window.ESCIE_RECORD_REGISTRY : null;
    const source =
      registry && typeof registry.allPublicRecords === "function"
        ? registry.allPublicRecords()
        : records;

    if (!Array.isArray(source)) return this.entries;

    source.forEach((record) => this.add(record));
    return this.entries;
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_SEARCH_INDEX = ESCIE_SEARCH_INDEX;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SEARCH_INDEX;
}
