/*
 * ESCIE TESTS — RECORD
 *
 * Contract checks for the universal record layer.
 */

(function () {
  const R = typeof window !== "undefined" ? window.ESCIE_RECORD : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!R) return { skipped: true, reason: "ESCIE_RECORD unavailable" };

    const record = R.create({
      id: "test-art",
      type: R.TYPES.ART,
      title: "Test Art",
      visibility: R.VISIBILITY.PUBLIC,
      public_disclosure: true
    });

    assert(record.identity.id === "test-art", "record id should be preserved");
    assert(R.isType(record, R.TYPES.ART), "record type should validate");
    assert(R.getTitle(record) === "Test Art", "record title should be readable");
    assert(R.isPublic(record), "public record should be public");
    assert(R.validate(record).valid, "created record should satisfy its contract");

    const privateRecord = R.create({
      id: "private-art",
      type: R.TYPES.ART,
      title: "Private Art",
      visibility: R.VISIBILITY.PRIVATE,
      public_disclosure: false
    });

    assert(!R.isPublic(privateRecord), "private record must not be public");

    const withheldRecord = R.create({
      id: "withheld-art",
      type: R.TYPES.ART,
      title: "Withheld Art",
      visibility: R.VISIBILITY.WITHHELD,
      public_disclosure: false
    });

    assert(!R.isPublic(withheldRecord), "withheld record must not be public");

    const limitedRecord = R.create({
      id: "limited-art",
      type: R.TYPES.ART,
      title: "Limited Art",
      visibility: R.VISIBILITY.LIMITED,
      public_disclosure: false
    });

    assert(!R.isPublic(limitedRecord), "limited record must not be public");

    const invalidRecord = R.create({
      id: "invalid-art",
      type: "not-a-record-type",
      title: "Invalid Art",
      visibility: R.VISIBILITY.PUBLIC,
      public_disclosure: true
    });

    assert(!R.validate(invalidRecord).valid, "invalid record type must fail validation");

    const contradictoryRecord = R.create({
      id: "contradictory-art",
      type: R.TYPES.ART,
      title: "Contradictory Art",
      visibility: R.VISIBILITY.PRIVATE,
      public_disclosure: true
    });

    assert(!R.validate(contradictoryRecord).valid, "private record cannot declare public disclosure");

    const normalized = R.normalize({
      id: "legacy-art",
      type: R.TYPES.ART,
      title: "Legacy Art"
    });

    assert(normalized.identity.id === "legacy-art", "normalize should preserve legacy id");
    assert(R.getTitle(normalized) === "Legacy Art", "normalize should preserve title");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_RECORD = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
