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

  if (record.published === false) {
    errors.push("Record is not marked for publication.");
  }

  const visibility = String(record.visibility || "").toLowerCase();

  if (["private", "withheld"].includes(visibility)) {
    errors.push(`Record visibility is ${visibility}.`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateBuild(build = {}) {
  const errors = [];
  const records = Array.isArray(build.records) ? build.records : [];

  records.forEach((record) => {
    const result = validatePublicRecord(record.data || record);

    if (!result.valid) {
      errors.push({
        recordId: record.id || record.data?.id || null,
        errors: result.errors
      });
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
