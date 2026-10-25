/*
 * ESCIE TESTS — PUBLISHING
 *
 * Contract checks for public build safety.
 */

(function () {
  const B = typeof window !== "undefined" ? window.ESCIE_PUBLISH_BUILD : null;
  const V = typeof window !== "undefined" ? window.ESCIE_PUBLISH_VALIDATE : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!B || !V) {
      return { skipped: true, reason: "publishing contracts unavailable" };
    }

    const publicRecords = B.buildPublicRecords([
      { id: "public-a", type: "art", title: "Public A", published: true, visibility: "public" },
      { id: "private-a", type: "art", title: "Private A", published: true, visibility: "private" },
      { id: "draft-a", type: "art", title: "Draft A", published: false, visibility: "public" }
    ]);

    assert(publicRecords.length === 1, "only public published records should enter the build");
    assert(publicRecords[0].id === "public-a", "public record should be preserved");

    const locked = B.buildPublicRecords([
      { id: "locked-a", type: "music", title: "Locked", published: true, visibility: "public", release_status: "locked" }
    ]);
    assert(locked.length === 0, "locked releases must never enter the public build");

    const invalidLockedBuild = V.validateBuild({
      records: [{
        id: "locked-a",
        data: { id: "locked-a", type: "music", title: "Locked", published: true, visibility: "public", release_status: "locked" }
      }]
    });
    assert(!invalidLockedBuild.valid, "publication validation must reject locked releases");

    const duplicateBuild = B.createBuildPlan({
      records: [
        { id: "duplicate-a", type: "art", title: "One", published: true },
        { id: "duplicate-a", type: "art", title: "Two", published: true }
      ]
    });

    const validation = V.validateBuild(duplicateBuild);
    assert(!validation.valid, "duplicate public ids must fail validation");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_PUBLISHING = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
