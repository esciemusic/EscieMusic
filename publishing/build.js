/*
 * ESCIE PUBLISHING — BUILD
 *
 * Build transforms approved system data into a public-facing build plan.
 * It does not decide what should become canon.
 */

function isPublicRecord(record = {}) {
  if (!record) return false;

  const registry =
    typeof window !== "undefined" ? window.ESCIE_RECORD_REGISTRY : null;

  if (registry && typeof registry.releaseVisible === "function" &&
      !registry.releaseVisible(record)) {
    return false;
  }

  const published =
    record.published === true ||
    record.status === "published";

  if (!published) return false;

  const visibility = String(record.visibility || "").toLowerCase();

  if (["private", "withheld", "limited"].includes(visibility)) {
    return false;
  }

  return true;
}

function buildPublicRecords(records = []) {
  if (!Array.isArray(records)) return [];

  const seenIds = new Set();

  return records
    .filter(isPublicRecord)
    .filter((record) => {
      const id = record && record.id;
      if (!id || seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    })
    .map((record) => ({
      id: record.id || null,
      type: record.type || null,
      title: record.title || "",
      data: { ...record }
    }));
}

function createBuildPlan(input = {}) {
  const records = Array.isArray(input.records) ? input.records : [];
  const seenIds = new Set();

  records.forEach((record) => {
    if (!isPublicRecord(record)) return;

    const id = record && record.id;
    if (!id) return;

    if (seenIds.has(id)) {
      throw new Error("Duplicate public record id: " + id);
    }

    seenIds.add(id);
  });

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
