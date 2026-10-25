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

function validateHistoryEntry(entry = {}, sourceRegistry = []) {
  const errors = [];
  const sources = Array.isArray(sourceRegistry) ? sourceRegistry : [];
  const knownSourceIds = new Set(
    sources.map((source) => source && source.id).filter(Boolean)
  );

  if (!entry.id || typeof entry.id !== "string") {
    errors.push("History entry must have a string id.");
  }

  if (!entry.timestamp || Number.isNaN(Date.parse(entry.timestamp))) {
    errors.push("History entry must have a valid timestamp.");
  }

  if (!entry.event || typeof entry.event !== "string") {
    errors.push("History entry must have an event.");
  }

  if (!Array.isArray(entry.sourceIds)) {
    errors.push("History sourceIds must be an array.");
  } else if (knownSourceIds.size > 0) {
    entry.sourceIds.forEach((sourceId) => {
      if (typeof sourceId !== "string" || !knownSourceIds.has(sourceId)) {
        errors.push("History contains an unknown source id.");
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function appendHistory(input = {}, sourceRegistry = []) {
  const entry = createHistoryEntry(input);
  const validation = validateHistoryEntry(entry, sourceRegistry);

  if (!validation.valid) {
    return {
      entry,
      valid: false,
      errors: validation.errors
    };
  }

  ESCIE_HISTORY.push(entry);

  const events =
    typeof window !== "undefined" ? window.ESCIE_EVENTS : null;

  if (events && typeof events.emit === "function") {
    events.emit("history:appended", { entry });
  }

  return {
    entry,
    valid: true,
    errors: []
  };
}

if (typeof window !== "undefined") {
  window.ESCIE_HISTORY = ESCIE_HISTORY;
  window.ESCIE_HISTORY_API = {
    create: createHistoryEntry,
    validate: validateHistoryEntry,
    append: appendHistory
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_HISTORY,
    createHistoryEntry,
    validateHistoryEntry,
    appendHistory
  };
}
