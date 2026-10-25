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
    resolveAuditEntry
  };
}
