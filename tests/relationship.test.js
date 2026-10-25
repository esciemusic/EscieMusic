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

    const invalidDisclosure = R.create({
      id: "invalid-disclosure",
      type: "collaborated_with",
      from: "person-a",
      to: "person-b",
      visibility: "private",
      public_disclosure: true
    });
    assert(invalidDisclosure.valid === false, "non-public relationships cannot declare public disclosure");

    const invalidCanonical = R.create({
      id: "invalid-canonical",
      type: "collaborated_with",
      from: "person-a",
      to: "person-b",
      canonical_status: "canonical",
      status: "proposed"
    });
    assert(invalidCanonical.valid === false, "canonical relationships must be active");

    const invalidCanonicalVisibility = R.create({
      id: "invalid-canonical-visibility",
      type: "collaborated_with",
      from: "person-a",
      to: "person-b",
      canonical_status: "canonical",
      status: "active",
      visibility: "limited"
    });
    assert(invalidCanonicalVisibility.valid === false, "canonical relationships must be public");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_RELATIONSHIP = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
