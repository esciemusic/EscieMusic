/*
 * ESCIE CORE SOURCES
 *
 * A source describes where information came from.
 * Source metadata supports provenance, auditing, ingestion, and disclosure.
 *
 * A source is not proof by itself.
 */

const ESCIE_SOURCES = [];

function createSource(input = {}) {
  return {
    id: input.id || null,
    type: input.type || "unknown",
    name: input.name || null,
    url: input.url || null,
    provider: input.provider || null,
    discoveredAt: input.discoveredAt || null,
    accessedAt: input.accessedAt || null,
    reliability: input.reliability || "unknown",
    disclosure: input.disclosure || "unknown",
    metadata: input.metadata || {}
  };
}

if (typeof window !== "undefined") {
  window.ESCIE_SOURCES = ESCIE_SOURCES;
  window.ESCIE_SOURCE = {
    create: createSource
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_SOURCES,
    createSource
  };
}
