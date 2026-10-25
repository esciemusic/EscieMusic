/*
 * ESCIE TESTS — RELATIONSHIP
 *
 * Contract checks for relationship boundaries.
 */

(function () {
  const R = typeof window !== "undefined" ? window.ESCIE_RELATIONSHIP : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!R) return { skipped: true, reason: "ESCIE_RELATIONSHIP unavailable" };

    const relationship = R.create({
      id: "test-relationship",
      type: "collaborated_with",
      from: "person-a",
      to: "person-b",
      status: "active",
      canonical: "provisional"
    });

    assert(relationship.id === "test-relationship", "relationship id should be preserved");
    assert(R.isType(relationship, "collaborated_with"), "relationship type should validate");
    assert(R.isCanonical(relationship) === false, "provisional relationship is not canonical");
    assert(R.isPublic(relationship) === true, "default public relationship should be public");

    const withheld = R.create({
      id: "withheld-relationship",
      type: "collaborated_with",
      from: "person-a",
      to: "person-b",
      status: "withheld",
      visibility: "withheld"
    });

    assert(R.isPublic(withheld) === false, "withheld relationship must not be public");
    assert(R.isCanonical(withheld) === false, "withheld relationship must not be canonical");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_RELATIONSHIP = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
