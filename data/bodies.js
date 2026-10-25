/*
 * ESCIE BODY REGISTRY
 *
 * Bodies are intentional groupings of existing material:
 * projects, collections, releases, archives, or other coherent bodies
 * of work.
 *
 * IMPORTANT:
 * - A body organizes records; it does not manufacture them.
 * - Inclusion in a body does not automatically establish chronology,
 *   authorship, meaning, or a relationship between its records.
 * - Bodies may contain different record types when the editorial structure
 *   requires it.
 * - A body can be provisional without making its contents provisional.
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
