/*
 * ESCIE CORE HISTORY
 *
 * Append-only record of meaningful state changes. History explains how a
 * record reached its current state; it does not rewrite the past.
 */

const ESCIE_HISTORY = [];

const HISTORY_EVENTS = Object.freeze({
  CREATED: "created",
  UPDATED: "updated",
  DECISION_RECORDED: "decision_recorded",
  DISCLOSURE_CHANGED: "disclosure_changed",
  RELATIONSHIP_CHANGED: "relationship_changed",
  INGESTED: "ingested",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  RESTORED: "restored",
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
    metadata: input.metadata && typeof input.metadata === "object"
      ? { ...input.metadata }
      : {}
  };
}

function validateHistoryEntry(entry = {}, sourceRegistry = []) {
  const errors = [];
  const value = entry || {};
  const sources = Array.isArray(sourceRegistry) ? sourceRegistry : [];
  const sourceIds = new Set(sources.map((source) => source && source.id).filter(Boolean));

  if (!value.id || typeof value.id !== "string") {
    errors.push("History entry must have a string id.");
  }

  if (!value.timestamp || Number.isNaN(Date.parse(value.timestamp))) {
    errors.push("History entry must have a valid timestamp.");
  }

  if (!Object.values(HISTORY_EVENTS).includes(value.event)) {
    errors.push("Invalid history event.");
  }

  if (!value.actor || typeof value.actor !== "string") {
    errors.push("History entry must have a string actor.");
  }

  if (!Array.isArray(value.sourceIds)) {
    errors.push("History sourceIds must be an array.");
  } else if (sourceIds.size > 0) {
    value.sourceIds.forEach((sourceId) => {
      if (typeof sourceId !== "string" || !sourceIds.has(sourceId)) {
        errors.push("History entry references an unknown source.");
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function appendHistory(input = {}, sourceRegistry = []) {
  const entry = createHistoryEntry(input);
  const validation = validateHistoryEntry(entry, sourceRegistry);

  if (!validation.valid) {
    return { entry, valid: false, errors: validation.errors };
  }

  if (ESCIE_HISTORY.some((item) => item.id === entry.id)) {
    return { entry, valid: false, errors: ["Duplicate history id."] };
  }

  ESCIE_HISTORY.push(Object.freeze(entry));

  if (typeof window !== "undefined" && window.ESCIE_EVENTS) {
    window.ESCIE_EVENTS.emit("history:appended", { entry });
  }

  return { entry, valid: true, errors: [] };
}

const ESCIE_HISTORY_API = {
  EVENTS: HISTORY_EVENTS,
  create: createHistoryEntry,
  validate: validateHistoryEntry,
  append: appendHistory
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
    appendHistory
  };
}
