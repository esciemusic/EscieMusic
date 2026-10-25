/*
 * ESCIE TESTS — REGISTRY
 *
 * Contract checks for normalized record routing, facets and references.
 */

(function () {
  "use strict";

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    const registry = typeof window !== "undefined" ? window.ESCIE_RECORD_REGISTRY : null;
    if (!registry) return { skipped: true, reason: "record registry unavailable" };

    const manifest = registry.manifestFor("bam-by-any-means");
    assert(manifest && manifest.work === true, "project manifest must route to work");

    const projectTracks = registry.filter(registry.records(), { project: "bam-by-any-means" });
    assert(projectTracks.some(record => record.id === "bam-001-dallas-63"), "project facet must include BAM tracks");

    const audit = registry.referenceAudit();
    assert(audit && Array.isArray(audit.errors), "reference audit must expose errors");
    assert(audit.ok === true, "relationship reference structure must be valid");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_REGISTRY = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
