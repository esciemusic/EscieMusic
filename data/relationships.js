/*
 * ESCIE RELATIONSHIP REGISTRY
 *
 * This file contains established relationship records.
 *
 * IMPORTANT:
 * - Correlation is not canon.
 * - A suggested connection is not a relationship.
 * - An interpretation is not a fact.
 * - Absence of a relationship is meaningful.
 *
 * The relationship contract itself lives in ../relationship.js.
 * This registry is intentionally empty until relationships are
 * explicitly established through ESCIE's editorial authority.
 */

const ESCIE_RELATIONSHIPS = [];

if (typeof window !== "undefined") {
  window.ESCIE_RELATIONSHIPS = ESCIE_RELATIONSHIPS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_RELATIONSHIPS;
}
