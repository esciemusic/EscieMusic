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
    assert(manifest.sections && manifest.sections.work === true, "section manifest must expose work routing");
    assert(Array.isArray(manifest.appearsIn) && manifest.appearsIn.includes("work"), "manifest must expose section appearances");

    const trackManifest = registry.manifestFor("bam-001-dallas-63");
    assert(trackManifest && trackManifest.sections.work === true, "BAM track must route to work");
    assert(trackManifest.sections.web === false, "unconnected BAM track must not appear in web");
    assert(trackManifest.search === true, "public records should be searchable by default");

    const projectTracks = registry.filter(registry.records(), { project: "bam-by-any-means" });
    assert(projectTracks.some(record => record.id === "bam-001-dallas-63"), "project facet must include BAM tracks");

    const audit = registry.referenceAudit();
    assert(audit && Array.isArray(audit.errors), "reference audit must expose errors");
    assert(audit.ok === true, "relationship reference structure must be valid");

    const sections = registry.sectionAudit();
    assert(sections && sections.ok === true, "section manifest audit must pass");

    const publicRelationships = registry.publicRelationships();
    assert(Array.isArray(publicRelationships) && publicRelationships.length === 8, "public relationship query must expose canonical disclosed connections");

    const typeList = registry.relationshipTypes();
    assert(typeList.includes("contains") && typeList.includes("created"), "relationship type facets must be derived from public connections");

    const contained = registry.relationshipsFor("bam-by-any-means", { type: "contains" });
    assert(contained.length === 6, "record-centric relationship query must filter by type");

    const counts = registry.relationshipCounts();
    assert(counts.relationships === 8 && counts.nodes === 9, "relationship counts must expose graph size");
    assert(counts.byType.contains === 6, "relationship counts must aggregate connection types");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_REGISTRY = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
