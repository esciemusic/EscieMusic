/*
 * ESCIE TESTS — SIGNAL
 *
 * Contract checks for signal levels and transmission boundaries.
 */

(function () {
  const S = typeof window !== "undefined" ? window.ESCIE_SIGNAL : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!S) return { skipped: true, reason: "ESCIE_SIGNAL unavailable" };

    const validLevels = ["QUIET", "DISTURBANCE", "FRAGMENT", "TRANSMISSION", "EVENT"];

    validLevels.forEach(function (level) {
      assert(S.isValidLevel(level), "signal level should be valid: " + level);
    });

    assert(!S.isValidLevel("CANON"), "canon must not be a signal level");

    const signal = S.create({
      level: "TRANSMISSION",
      sourceId: "test-source",
      recordIds: ["test-record"]
    });

    assert(signal.level === "TRANSMISSION", "signal level should be preserved");
    assert(signal.sourceId === "test-source", "signal source should be preserved");
    assert(signal.recordIds.includes("test-record"), "signal record reference should be preserved");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_SIGNAL = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
