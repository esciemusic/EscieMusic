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
      "WORK",
      "WEB",
      "ARCHIVE",
      "INVESTIGATION",
      "GLASS EYE",
      "ESCIE"
    ];

    required.forEach(function (label) {
      assert(N.some(item => item.label === label), "missing navigation item: " + label);
    });

    assert(N.filter(item => item.primary === true).length > 0, "primary navigation should exist");
    assert(N.some(item => item.id === "art" && item.target === "#art"), "WORK route should target #art");
    assert(N.some(item => item.id === "archives" && item.target === "#archives"), "ARCHIVE route should target #archives");
    assert(N.some(item => item.id === "investigation" && item.target === "#investigation"), "INVESTIGATION route should target #investigation");


    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_NAVIGATION = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
