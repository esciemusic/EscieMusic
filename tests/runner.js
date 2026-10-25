/*
 * ESCIE TEST RUNNER
 *
 * Browser-side contract runner for the development build.
 * Tests are diagnostics only: they do not create public records,
 * publish content, or establish canon.
 */

(function () {
  "use strict";

  const TESTS = [
    ["record", "ESCIE_TEST_RECORD"],
    ["relationship", "ESCIE_TEST_RELATIONSHIP"],
    ["brain", "ESCIE_TEST_BRAIN"],
    ["navigation", "ESCIE_TEST_NAVIGATION"],
    ["responsive", "ESCIE_TEST_RESPONSIVE"],
    ["signal", "ESCIE_TEST_SIGNAL"],
    ["permissions", "ESCIE_TEST_PERMISSIONS"],
    ["publishing", "ESCIE_TEST_PUBLISHING"],
    ["navigation", "ESCIE_TEST_NAVIGATION"]
  ];

  function run() {
    const results = [];
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    TESTS.forEach(function (entry) {
      const name = entry[0];
      const key = entry[1];
      const test = typeof window !== "undefined" ? window[key] : null;

      if (!test || typeof test.run !== "function") {
        results.push({ name, status: "skipped", reason: "test unavailable" });
        skipped += 1;
        return;
      }

      try {
        const result = test.run();

        if (result && result.skipped) {
          results.push({ name, status: "skipped", reason: result.reason || null });
          skipped += 1;
          return;
        }

        results.push({ name, status: "passed" });
        passed += 1;
      } catch (error) {
        results.push({
          name,
          status: "failed",
          error: error && error.message ? error.message : String(error)
        });
        failed += 1;
      }
    });

    const summary = {
      total: TESTS.length,
      passed,
      failed,
      skipped,
      ok: failed === 0 && skipped === 0,
      results
    };

    if (typeof window !== "undefined") {
      window.ESCIE_TEST_RESULTS = summary;
    }

    return summary;
  }

  if (typeof window !== "undefined") {
    window.ESCIE_TEST_RUNNER = { run };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { run };
  }
})();
