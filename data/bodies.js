/*
 * ESCIE BODY REGISTRY
 *
 * Bodies represent physical presence in the World: a body, bodily presence,
 * or a recorded representation of a body.
 *
 * IMPORTANT:
 * - A body is presence, not identity; People remain the identity layer.
 * - A body may be identified, unidentified, partial, represented, or disputed.
 * - A body does not manufacture a person, event, meaning, or relationship.
 * - Sensitive inferences about a body are never created automatically.
 *
 * This registry is intentionally empty until ESCIE establishes its records.
 */

const ESCIE_BODIES = [];

if (typeof window !== "undefined") {
  window.ESCIE_BODIES = ESCIE_BODIES;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_BODIES;
}
