/*
 * ESCIE BRAIN — AUDIT
 *
 * The audit layer checks system behavior and analysis quality.
 *
 * It identifies conditions that deserve attention; it does not silently
 * change canon or rewrite records.
 */

const ESCIE_AUDIT = [];

function createAuditEntry(input = {}) {
  return {
    id: input.id || null,
    type: input.type || "system",
    severity: input.severity || "info",
    status: input.status || "open",
    subject: input.subject || null,
    message: input.message || null,
    recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : [],
    sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
    createdAt: input.createdAt || new Date().toISOString(),
    resolvedAt: input.resolvedAt || null,
    resolution: input.resolution || null
  };
}

function addAuditEntry(input = {}) {
  const entry = createAuditEntry(input);
  ESCIE_AUDIT.push(entry);
  return entry;
}

function auditRelationships(relationships = [], records = [], relationshipAPI = null) {
  const api = relationshipAPI ||
    (typeof window !== "undefined" ? window.ESCIE_RELATIONSHIP : null);

  const list = Array.isArray(relationships) ? relationships : [];
  const recordList = Array.isArray(records) ? records : [];
  const knownIds = new Set(
    recordList
      .map((record) => record && record.id)
      .filter(Boolean)
  );

  const errors = [];
  const orphaned = [];
  const duplicateIds = [];
  const duplicateConnections = [];
  const seenIds = new Map();
  const seenConnections = new Map();

  list.forEach((relationship, index) => {
    if (!relationship || typeof relationship !== "object") {
      errors.push({ index, message: "Relationship must be an object." });
      return;
    }

    if (api && typeof api.validate === "function") {
      const validation = api.validate(relationship);
      if (!validation.valid) {
        errors.push({
          index,
          id: relationship.id || null,
          message: "Invalid relationship.",
          details: validation.errors
        });
      }
    }

    if (relationship.id) {
      if (seenIds.has(relationship.id)) {
        duplicateIds.push({
          id: relationship.id,
          firstIndex: seenIds.get(relationship.id),
          duplicateIndex: index
        });
      } else {
        seenIds.set(relationship.id, index);
      }
    }

    if (relationship.from && !knownIds.has(relationship.from)) {
      orphaned.push({
        relationshipId: relationship.id || null,
        endpoint: "from",
        recordId: relationship.from,
        index
      });
    }

    if (relationship.to && !knownIds.has(relationship.to)) {
      orphaned.push({
        relationshipId: relationship.id || null,
        endpoint: "to",
        recordId: relationship.to,
        index
      });
    }

    if (
      relationship.from &&
      relationship.type &&
      relationship.to
    ) {
      const key = [
        relationship.from,
        relationship.type,
        relationship.to
      ].join("|");

      if (seenConnections.has(key)) {
        duplicateConnections.push({
          key,
          firstIndex: seenConnections.get(key),
          duplicateIndex: index
        });
      } else {
        seenConnections.set(key, index);
      }
    }
  });

  return {
    ok:
      errors.length === 0 &&
      orphaned.length === 0 &&
      duplicateIds.length === 0 &&
      duplicateConnections.length === 0,
    counts: {
      relationships: list.length,
      knownRecords: knownIds.size,
      errors: errors.length,
      orphaned: orphaned.length,
      duplicateIds: duplicateIds.length,
      duplicateConnections: duplicateConnections.length
    },
    errors,
    orphaned,
    duplicateIds,
    duplicateConnections
  };
}

function resolveAuditEntry(id, resolution = null) {
  const entry = ESCIE_AUDIT.find((item) => item.id === id);

  if (!entry) {
    return null;
  }

  entry.status = "resolved";
  entry.resolvedAt = new Date().toISOString();
  entry.resolution = resolution;

  return entry;
}

if (typeof window !== "undefined") {
  window.ESCIE_AUDIT = ESCIE_AUDIT;
  window.ESCIE_AUDIT_API = {
    create: createAuditEntry,
    add: addAuditEntry,
    resolve: resolveAuditEntry
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_AUDIT,
    createAuditEntry,
    addAuditEntry,
    resolveAuditEntry,
    auditRelationships
  };
}
