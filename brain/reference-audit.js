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

const ESCIE_REFERENCE_AUDIT = {
  auditRecordReferences
};

if (typeof window !== "undefined") {
  window.ESCIE_REFERENCE_AUDIT = ESCIE_REFERENCE_AUDIT;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_REFERENCE_AUDIT;
}
