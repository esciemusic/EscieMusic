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
      type: "ART",
      title: "Test Art",
      visibility: "PUBLIC",
      published: true
    });

    assert(record.id === "test-art", "record id should be preserved");
    assert(R.isType(record, "ART"), "record type should validate");
    assert(R.getTitle(record) === "Test Art", "record title should be readable");
    assert(R.isPublic(record), "published public record should be public");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_RECORD = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
