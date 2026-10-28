/*
 * ESCIE PATH REGISTRY
 *
 * Paths are intentional journeys through existing records.
 * They can define sequences, perspectives, routes, or ways of moving
 * through the ESCIE archive.
 *
 * IMPORTANT:
 * - A path is a presentation/editorial structure, not a new world.
 * - Ordering records does not establish causation or chronology unless
 *   explicitly established elsewhere.
 * - A path may contain unresolved or non-canonical material without making
 *   that material canonical.
 * - Paths can be temporary, experimental, or permanent.
 *
 * This registry is intentionally empty until ESCIE establishes its paths.
 */

const ESCIE_PATHS = [];

if (typeof window !== "undefined") {
  window.ESCIE_PATHS = ESCIE_PATHS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_PATHS;
}
