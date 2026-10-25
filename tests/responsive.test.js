/*
 * ESCIE TESTS — RESPONSIVE
 *
 * Contract checks for viewport classification.
 */

(function () {
  const R = typeof window !== "undefined" ? window.ESCIE_UI_RESPONSIVE : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!R) return { skipped: true, reason: "ESCIE_UI_RESPONSIVE unavailable" };

    assert(R.classify(700) === "mobile", "700px should classify as mobile");
    assert(R.classify(701) === "desktop", "701px should classify as desktop");
    assert(R.classify(1200) === "desktop", "desktop width should classify as desktop");
    assert(R.classify(375) === "mobile", "phone width should classify as mobile");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_RESPONSIVE = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
