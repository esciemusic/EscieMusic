/*
 * ESCIE TESTS — NAVIGATION
 *
 * Contract checks for public navigation structure.
 */

(function () {
  const N = typeof window !== "undefined" ? window.ESCIE_NAVIGATION : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!N) return { skipped: true, reason: "ESCIE_NAVIGATION unavailable" };

    const required = [
      "ENTRY",
      "NOW",
      "ART",
      "THE WEB",
      "THE ARCHIVES",
      "INVESTIGATION",
      "ESCIE",
      "THE GLASS EYE"
    ];

    required.forEach(function (label) {
      assert(N.some(item => item.label === label), "missing navigation item: " + label);
    });

    assert(N.filter(item => item.primary === true).length > 0, "primary navigation should exist");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_NAVIGATION = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
