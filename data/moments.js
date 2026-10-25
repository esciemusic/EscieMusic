/*
 * ESCIE MOMENT REGISTRY
 *
 * Moments represent occurrences, periods, or points in time that ESCIE
 * intentionally preserves as records.
 *
 * IMPORTANT:
 * - A moment may be known, remembered, documented, reconstructed, or unresolved.
 * - A timestamp is not automatically proof of what happened.
 * - Chronological proximity is not causation.
 * - Conflicting accounts must remain visible rather than being silently resolved.
 *
 * The universal record contract lives in ../record.js.
 * This registry is intentionally empty until ESCIE establishes its records.
 */

const ESCIE_MOMENTS = [];

if (typeof window !== "undefined") {
  window.ESCIE_MOMENTS = ESCIE_MOMENTS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_MOMENTS;
}
