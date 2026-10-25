/*
 * ESCIE CORE HISTORY
 *
 * History records meaningful state changes without rewriting the past.
 *
 * Historical entries are append-oriented. New information may change
 * current interpretation or reopen analysis, but should not silently
 * overwrite what was previously known.
 */

const ESCIE_HISTORY = [];

function createHistoryEntry(input = {}) {
  return {
    id: input.id || null,
    timestamp: input.timestamp || new Date().toISOString(),
    event: input.event || "unknown",
    recordId: input.recordId || null,
    actor: input.actor || "system",
    previous: input.previous ?? null,
    next: input.next ?? null,
    reason: input.reason || null,
    sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
    metadata: input.metadata || {}
  };
}

function appendHistory(input = {}) {
  const entry = createHistoryEntry(input);
  ESCIE_HISTORY.push(entry);
  return entry;
}

if (typeof window !== "undefined") {
  window.ESCIE_HISTORY = ESCIE_HISTORY;
  window.ESCIE_HISTORY_API = {
    create: createHistoryEntry,
    append: appendHistory
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_HISTORY,
    createHistoryEntry,
    appendHistory
  };
}
