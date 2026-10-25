/*
 * ESCIE PUBLISHING — VALIDATE
 *
 * Validation is the final structural/publication safety check.
 * It does not determine artistic meaning or autobiographical truth.
 */

const REQUIRED_PUBLIC_FIELDS = Object.freeze(["id", "type"]);

function validatePublicRecord(record = {}) {
  const errors = [];

  for (const field of REQUIRED_PUBLIC_FIELDS) {
    if (!record[field]) {
      errors.push(`Missing required public field: ${field}`);
    }
  }

  const published = record.published === true || record.status === "published";

  if (!published) {
    errors.push("Record is not marked for publication.");
  }

  const visibility = String(record.visibility || "").toLowerCase();

  if (["private", "withheld", "limited"].includes(visibility)) {
    errors.push(`Record visibility is ${visibility}.`);
  }

  if (record.public_disclosure === false) {
    errors.push("Record does not permit public disclosure.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateBuild(build = {}) {
  const errors = [];
  const records = Array.isArray(build.records) ? build.records : [];
  const seenIds = new Set();

  records.forEach((record) => {
    const data = record.data || record;

    if (data && data.published === false) {
      return;
    }

    const result = validatePublicRecord(data);

    if (!result.valid) {
      errors.push({
        recordId: record.id || record.data?.id || null,
        errors: result.errors
      });
    }

    const id = data && data.id;
    if (id) {
      if (seenIds.has(id)) {
        errors.push({
          recordId: id,
          errors: ["Duplicate public record id."]
        });
      }
      seenIds.add(id);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

const ESCIE_PUBLISH_VALIDATE = {
  validatePublicRecord,
  validateBuild
};

if (typeof window !== "undefined") {
  window.ESCIE_PUBLISH_VALIDATE = ESCIE_PUBLISH_VALIDATE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_PUBLISH_VALIDATE;
}
