/*
 * ESCIE PUBLISHING — BUILD
 *
 * Build transforms approved system data into a public-facing build plan.
 * It does not decide what should become canon.
 */

function isPublicRecord(record = {}) {
  if (!record) return false;

  if (record.published === false) return false;

  const visibility = String(record.visibility || "").toLowerCase();

  if (["private", "withheld", "limited"].includes(visibility)) {
    return visibility === "limited" && record.published === true;
  }

  return true;
}

function buildPublicRecords(records = []) {
  if (!Array.isArray(records)) return [];

  return records
    .filter(isPublicRecord)
    .map((record) => ({
      id: record.id || null,
      type: record.type || null,
      title: record.title || "",
      data: { ...record }
    }));
}

function createBuildPlan(input = {}) {
  const records = Array.isArray(input.records) ? input.records : [];

  return {
    createdAt: new Date().toISOString(),
    environment: input.environment || "production",
    records: buildPublicRecords(records),
    routes: Array.isArray(input.routes) ? [...input.routes] : [],
    assets: Array.isArray(input.assets) ? [...input.assets] : []
  };
}

const ESCIE_PUBLISH_BUILD = {
  isPublicRecord,
  buildPublicRecords,
  createBuildPlan
};

if (typeof window !== "undefined") {
  window.ESCIE_PUBLISH_BUILD = ESCIE_PUBLISH_BUILD;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_PUBLISH_BUILD;
}
