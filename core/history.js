/*
 * ESCIE CORE HISTORY
 *
 * Append-only change history. History explains how a record changed;
 * provenance explains where information came from.
 *
 * History is not evidence, meaning, or canon.
 */

const ESCIE_HISTORY = [];

const HISTORY_EVENTS = Object.freeze({
  CREATED: "created",
  UPDATED: "updated",
  ARCHIVED: "archived",
  RESTORED: "restored",
  DISCLOSED: "disclosed",
  WITHHELD: "withheld",
  RELATIONSHIP_ADDED: "relationship_added",
  RELATIONSHIP_CHANGED: "relationship_changed",
  DECISION: "decision",
  CORRECTION: "correction",
  REVIEW: "review",
  UNKNOWN: "unknown"
});

function createHistoryEntry(input = {}) {
  return {
    id: input.id || null,
    timestamp: input.timestamp || new Date().toISOString(),
    event: input.event || HISTORY_EVENTS.UNKNOWN,
    recordId: input.recordId || null,
    actor: input.actor || "system",
    previous: input.previous ?? null,
    next: input.next ?? null,
    reason: input.reason || null,
    sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
    decisionId: input.decisionId || null,
    metadata: input.metadata || {}
  };
}

function validateHistoryEntry(entry = {}, sourceRegistry = [], existingHistory = []) {
  const errors = [];
  const knownSources = new Set(
    (Array.isArray(sourceRegistry) ? sourceRegistry : [])
      .map((source) => source && source.id)
      .filter(Boolean)
  );
  const existingIds = new Set(
    (Array.isArray(existingHistory) ? existingHistory : [])
      .map((item) => item && item.id)
      .filter(Boolean)
  );

  if (!entry || typeof entry !== "object") errors.push("History entry must be an object.");
  if (!entry.id || typeof entry.id !== "string") errors.push("History entry must have a string id.");
  if (entry.id && existingIds.has(entry.id)) errors.push("Duplicate history entry id.");
  if (!entry.recordId || typeof entry.recordId !== "string") errors.push("History entry must have a recordId.");
  if (!entry.timestamp || Number.isNaN(Date.parse(entry.timestamp))) errors.push("History entry must have a valid timestamp.");
  if (!Object.values(HISTORY_EVENTS).includes(entry.event)) errors.push("Invalid history event.");
  if (!Array.isArray(entry.sourceIds)) errors.push("History sourceIds must be an array.");

  if (Array.isArray(entry.sourceIds)) {
    entry.sourceIds.forEach((sourceId) => {
      if (typeof sourceId !== "string" || !sourceId.trim()) {
        errors.push("History sourceIds must contain non-empty strings.");
      } else if (knownSources.size > 0 && !knownSources.has(sourceId)) {
        errors.push("History references an unknown source id: " + sourceId);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function appendHistory(input = {}, options = {}) {
  const entry = createHistoryEntry(input);
  const validation = validateHistoryEntry(
    entry,
    options.sources || [],
    ESCIE_HISTORY
  );

  if (!validation.valid) {
    return { entry, valid: false, errors: validation.errors };
  }

  ESCIE_HISTORY.push(entry);
  return { entry, valid: true, errors: [] };
}

function getHistory(recordId) {
  if (!recordId) return [];
  return ESCIE_HISTORY.filter((entry) => entry.recordId === recordId);
}

function latestHistory(recordId) {
  const entries = getHistory(recordId);
  return entries.length ? entries[entries.length - 1] : null;
}

const ESCIE_HISTORY_API = {
  EVENTS: HISTORY_EVENTS,
  create: createHistoryEntry,
  validate: validateHistoryEntry,
  append: appendHistory,
  get: getHistory,
  latest: latestHistory
};

if (typeof window !== "undefined") {
  window.ESCIE_HISTORY = ESCIE_HISTORY;
  window.ESCIE_HISTORY_API = ESCIE_HISTORY_API;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_HISTORY,
    ...ESCIE_HISTORY_API,
    createHistoryEntry,
    validateHistoryEntry,
    appendHistory,
    getHistory,
    latestHistory
  };
}
