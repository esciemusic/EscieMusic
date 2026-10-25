/*
 * ESCIE TESTS — SIGNAL
 *
 * Contract checks for signal levels and transmission boundaries.
 */

(function () {
  const S = typeof window !== "undefined" ? window.ESCIE_SIGNAL_ENGINE : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!S) return { skipped: true, reason: "ESCIE_SIGNAL_ENGINE unavailable" };

    [0, 1, 2, 3, 4].forEach(function (level) {
      assert(S.isValidLevel(level), "numeric signal level should be valid: " + level);
    });

    assert(!S.isValidLevel(5), "level above EVENT must be invalid");
    assert(!S.isValidLevel(-1), "negative signal level must be invalid");

    const signal = S.emit({
      level: S.levels.TRANSMISSION,
      type: "test-transmission",
      sourceId: "test-source",
      recordIds: ["test-record"]
    });

    assert(signal.level === S.levels.TRANSMISSION, "signal level should be preserved");
    assert(signal.type === "test-transmission", "signal type should be preserved");
    assert(signal.sourceId === "test-source", "signal source should be preserved");
    assert(signal.recordIds.includes("test-record"), "signal record reference should be preserved");
    assert(signal.active === true, "emitted signal should be active");

    const cleared = S.clear();

    assert(cleared.active === false, "cleared signal should be inactive");
    assert(cleared.level === S.levels.QUIET, "cleared signal should return to QUIET");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_SIGNAL = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
