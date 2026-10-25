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

    const lockedFixture = {id:"__locked_release_fixture__",type:"music",title:"LOCKED FIXTURE",project:"bam-by-any-means",number:"999",status:"development",published:true,visibility:"public",release_status:"locked"};

    const nodes = registry.publicNodes();
    assert(Array.isArray(nodes) && nodes.length === 7, "canonical public node set must contain seven nodes");
    assert(nodes[0].id === "node-now" && nodes[6].id === "node-escie", "public nodes must preserve canonical order");
    assert(registry.nodesForRecord("bam-001-dallas-63").some(node => node.id === "node-work"), "released transmission must resolve back to its public work node");
    assert(registry.nodesForRecord(lockedFixture.id).length === 0, "locked release must resolve to no public nodes");
    const workNode = registry.nodeFor("node-work");
    assert(workNode && workNode.section === "work", "node lookup must resolve the work node");
    assert(workNode.records.includes("bam-001-dallas-63"), "work node must expose released transmission records");
    assert(!workNode.records.includes(lockedFixture.id), "work node must hide locked release records");

    const manifest = registry.manifestFor("bam-by-any-means");
    assert(manifest && manifest.work === true, "project manifest must route to work");
    assert(manifest.sections && manifest.sections.work === true, "section manifest must expose work routing");
    assert(Array.isArray(manifest.appearsIn) && manifest.appearsIn.includes("work"), "manifest must expose section appearances");

    const trackManifest = registry.manifestFor("bam-001-dallas-63");
    assert(trackManifest && trackManifest.sections.work === true, "BAM track must route to work");
    assert(trackManifest.sections.web === true, "connected BAM track must appear in web");
    assert(trackManifest.search === true, "public records should be searchable by default");

    const projectTracks = registry.filter(registry.records(), { project: "bam-by-any-means" });
    assert(projectTracks.some(record => record.id === "bam-001-dallas-63"), "project facet must include BAM tracks");

    const audit = registry.referenceAudit();
    assert(audit && Array.isArray(audit.errors), "reference audit must expose errors");
    assert(audit.ok === true, "relationship reference structure must be valid");

    const sections = registry.sectionAudit();
    assert(sections && sections.ok === true, "section manifest audit must pass");

    const publicRelationships = registry.publicRelationships();
    assert(Array.isArray(publicRelationships) && publicRelationships.length >= 3, "public relationship query must expose canonical disclosed connections");

    const typeList = registry.relationshipTypes();
    assert(typeList.includes("contains") && typeList.includes("created"), "relationship type facets must be derived from public connections");

    const contained = registry.relationshipsFor("bam-by-any-means", { type: "contains" });
    assert(contained.length === projectTracks.filter(record => record && registry.releaseVisible(record)).length, "record-centric relationship query must expose all released project transmissions");

    const bamProject = registry.get("bam-by-any-means");
    const firstTrack = registry.get("bam-001-dallas-63");
    assert(registry.releaseVisible(bamProject) === true, "BAM project must unlock when a released track exists");
    assert(registry.releaseVisible(firstTrack) === true, "released BAM track must be visible");
    assert(registry.releaseVisible(lockedFixture) === false, "locked releases must remain hidden");
    assert(registry.publicRecord("bam-001-dallas-63") && registry.publicRecord("bam-001-dallas-63").id === "bam-001-dallas-63", "publicRecord must return released public records");
    assert(registry.publicRecord(lockedFixture.id) === null, "publicRecord must fail closed for locked records");
    assert(registry.releaseVisible(Object.assign({}, lockedFixture, { release_status:"unknown" })) === false, "invalid release states must fail closed");
    const lockedManifest = registry.manifestFor(lockedFixture.id);
    assert(lockedManifest === null, "unknown internal records must not acquire a public manifest");

    const counts = registry.relationshipCounts();
    assert(counts.relationships >= 3 && counts.nodes >= 4, "relationship counts must expose the public graph");
    assert(counts.byType.contains === contained.length, "relationship counts must aggregate all released containment connections");

    const publicRecords = registry.allPublicRecords();
    assert(Array.isArray(publicRecords), "canonical public record collection must return an array");
    assert(!publicRecords.some(record => record && record.release_status === "locked"), "public record collection must never expose locked releases");
    assert(publicRecords.some(record => record && record.id === "bam-001-dallas-63"), "released BAM transmission must enter canonical public records");
    assert(!publicRecords.some(record => record && record.release_status === "locked"), "locked releases must stay out of canonical public records");

    assert(!registry.publicRelationships().some(rel => rel && rel.to === lockedFixture.id), "locked releases must not enter the public relationship graph");
    const releaseAudit = registry.releaseAudit();
    assert(releaseAudit && releaseAudit.ok === true, "progressive release configuration must pass audit");
    assert(registry.nodesForRecord(lockedFixture.id).length === 0, "locked release must not resolve to public nodes");
    assert(registry.contextFor(lockedFixture.id).record === null, "locked release must not be returned by public context");
    const contractLocked = registry.contractAudit();
    assert(contractLocked.ok === true, "canonical release metadata must satisfy the record contract");

    const projectContext = registry.contextFor("bam-by-any-means");
    assert(projectContext.children.length === projectTracks.filter(record => record && registry.releaseVisible(record)).length, "project context must contain only released transmissions");

    const searchIndex = typeof window !== "undefined" ? window.ESCIE_SEARCH_INDEX : null;
    if (searchIndex) {
      searchIndex.clear();
      searchIndex.build([firstTrack, lockedFixture]);
      assert(searchIndex.entries.some(entry => entry.id === firstTrack.id), "released BAM track must enter search index");
      assert(!searchIndex.entries.some(entry => entry.id === lockedFixture.id), "locked release must not enter search index");
    }

    const publishBuild = typeof window !== "undefined" ? window.ESCIE_PUBLISH_BUILD : null;
    if (publishBuild) {
      const publicBuild = publishBuild.buildPublicRecords([firstTrack, lockedFixture]);
      assert(publicBuild.some(record => record.id === firstTrack.id), "released BAM track must enter public build");
      assert(!publicBuild.some(record => record.id === lockedFixture.id), "locked release must stay out of public build");
    }

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_REGISTRY = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
