/* ESCIE NOW — PRESENT-TENSE EDITORIAL REGISTRY
 *
 * NOW is the living foreground of the public site.
 * Entries are curated by presence, not by a fixed expiration timer.
 *
 * An entry remains here for exactly as long as it belongs to the moment:
 * an hour, a day, six weeks, or longer.
 *
 * IMPORTANT:
 * - This registry never makes unreleased/private material public.
 * - record_id must resolve through the public record registry.
 * - Removing an entry from NOW does not remove the underlying work.
 * - Empty is valid: NOW should never invent activity to look alive.
 */

const ESCIE_NOW = {
  version: "1.0.0",
  entries: []
};

if (typeof window !== "undefined") {
  window.ESCIE_NOW = ESCIE_NOW;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_NOW;
}
