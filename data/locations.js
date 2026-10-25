/*
 * ESCIE LOCATION REGISTRY
 *
 * Places are records in ESCIE's reality.
 *
 * IMPORTANT:
 * - A place can be physical, remembered, documented, depicted, or referenced.
 * - A location record does not imply that every associated event occurred there.
 * - Geographic proximity is not proof of a relationship between records.
 * - Uncertainty belongs in the record; it must not be silently resolved.
 *
 * The universal record contract lives in ../record.js.
 * This registry is intentionally empty until ESCIE establishes its records.
 */

const ESCIE_LOCATIONS = [];

if (typeof window !== "undefined") {
  window.ESCIE_LOCATIONS = ESCIE_LOCATIONS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_LOCATIONS;
}
