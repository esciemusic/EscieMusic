/*
 * ESCIE BRAIN — RECORD REFERENCE AUDIT
 *
 * Deterministic inspection only. Missing references are reported, never
 * silently created, repaired, merged, or canonized.
 */

function auditRecordReferences(records, fields) {
  const list = Array.isArray(records) ? records : [];
  const rules = Array.isArray(fields) ? fields : [];
  const ids = new Set(list.map((record) => record && record.id).filter(Boolean));
  const missing = [];

  rules.forEach((field) => {
    list.forEach((record, index) => {
      if (!record || record[field] == null) return;
      const values = Array.isArray(record[field]) ? record[field] : [record[field]];

      values.forEach((value, valueIndex) => {
        if (typeof value !== "string" || !value.trim()) return;
        if (!ids.has(value)) {
          missing.push({
            recordId: record.id || null,
            field,
            index,
            valueIndex,
            reference: value
          });
        }
      });
    });
  });

  return {
    ok: missing.length === 0,
    counts: {
      records: list.length,
      knownRecords: ids.size,
      missing: missing.length
    },
    missing
  };
}

function auditProvenanceSources(records = [], sources = []) {
  const list = Array.isArray(records) ? records : [];
  const registry = Array.isArray(sources) ? sources : [];
  const sourceIds = new Set(
    registry.map((source) => source && source.id).filter(Boolean)
  );
  const missing = [];
  const malformed = [];

  list.forEach((record, index) => {
    if (!record || !record.provenance) return;

    const ids = Array.isArray(record.provenance.sourceIds)
      ? record.provenance.sourceIds
      : null;

    if (!ids) {
      malformed.push({
        recordId: record.id || record.identity?.id || null,
        index,
        reason: "provenance.sourceIds must be an array"
      });
      return;
    }

    ids.forEach((sourceId, valueIndex) => {
      if (typeof sourceId !== "string" || !sourceId.trim()) {
        malformed.push({
          recordId: record.id || record.identity?.id || null,
          index,
          valueIndex,
          reason: "sourceId must be a non-empty string"
        });
        return;
      }

      if (!sourceIds.has(sourceId)) {
        missing.push({
          recordId: record.id || record.identity?.id || null,
          index,
          valueIndex,
          sourceId
        });
      }
    });
  });

  return {
    ok: missing.length === 0 && malformed.length === 0,
    counts: {
      records: list.length,
      sources: registry.length,
      missing: missing.length,
      malformed: malformed.length
    },
    missing,
    malformed
  };
}

const ESCIE_REFERENCE_AUDIT = {
  auditRecordReferences,
  auditProvenanceSources
};

if (typeof window !== "undefined") {
  window.ESCIE_REFERENCE_AUDIT = ESCIE_REFERENCE_AUDIT;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_REFERENCE_AUDIT;
}
