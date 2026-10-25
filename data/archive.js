/*
 * ESCIE ARCHIVE REGISTRY
 *
 * The archive is a cross-cutting view of preserved ESCIE material.
 * It is not a separate ontology type; it exposes records according to
 * archival state, disclosure, provenance, and editorial selection.
 *
 * IMPORTANT:
 * - Archive presence does not make material public.
 * - Archived does not mean forgotten, deleted, or false.
 * - Preservation and interpretation remain separate.
 * - The archive may contain records from multiple ESCIE types.
 */

const ESCIE_ARCHIVE = [];

if (typeof window !== "undefined") {
  window.ESCIE_ARCHIVE = ESCIE_ARCHIVE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_ARCHIVE;
}
