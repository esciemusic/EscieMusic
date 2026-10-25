/*
 * ESCIE INVESTIGATION REGISTRY
 *
 * Investigations are editorial structures for questions being examined.
 * They gather records, evidence, contradictions, context, and unresolved
 * questions without pretending that an investigation has already reached
 * a conclusion.
 *
 * IMPORTANT:
 * - An investigation is not proof.
 * - A question is not an accusation.
 * - Evidence can support, contradict, contextualize, or remain unresolved.
 * - AI and audience systems may surface candidates, but cannot silently
 *   establish investigative conclusions or canon.
 *
 * This registry is intentionally empty until ESCIE establishes its records.
 */

const ESCIE_INVESTIGATION = [];

if (typeof window !== "undefined") {
  window.ESCIE_INVESTIGATION = ESCIE_INVESTIGATION;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_INVESTIGATION;
}
