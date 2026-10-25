/*
 * ESCIE TESTS — NAVIGATION
 *
 * Contract checks for public navigation structure and INDEX behavior.
 */

(function () {
  const N = typeof window !== "undefined" ? window.ESCIE_NAVIGATION : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!N) return { skipped: true, reason: "ESCIE_NAVIGATION unavailable" };

    const required = ["NOW", "WORK", "THE WEB", "ARCHIVE", "INVESTIGATION", "GLASS EYE", "ESCIE"];
    required.forEach(function (label) {
      assert(N.some(item => item.label === label), "missing navigation item: " + label);
    });

    assert(N.filter(item => item.primary === true).length === 7, "public primary navigation should contain seven nodes");
    assert(new Set(N.map(item => item.id)).size === N.length, "navigation IDs should be unique");
    assert(new Set(N.map(item => item.target)).size === N.length, "navigation targets should be unique");
    assert(N.some(item => item.id === "now" && item.target === "#now"), "NOW route should target #now");
    assert(N.some(item => item.id === "art" && item.target === "#art"), "WORK route should target #art");
    assert(N.some(item => item.id === "web" && item.target === "#web"), "THE WEB route should target #web");
    assert(N.some(item => item.id === "archives" && item.target === "#archives"), "ARCHIVE route should target #archives");
    assert(N.some(item => item.id === "investigation" && item.target === "#investigation"), "INVESTIGATION route should target #investigation");
    assert(N.some(item => item.id === "glass-eye" && item.target === "#glass-eye"), "GLASS EYE route should target #glass-eye");
    assert(N.some(item => item.id === "escie" && item.target === "#escie"), "ESCIE route should target #escie");

    const router = typeof window !== "undefined" ? window.ESCIE_UI_ROUTER : null;
    if (router && typeof router.resolve === "function") {
      assert(router.resolve("#art") === "art", "hash route should resolve to WORK");
      assert(router.resolve("work") === "art", "legacy WORK alias should resolve to art");
      assert(router.resolve("#archives") === "archives", "hash route should resolve to ARCHIVE");
      assert(router.resolve("archive") === "archives", "legacy ARCHIVE alias should resolve to archives");
      assert(router.resolve("cases") === "investigation", "legacy CASES alias should resolve to investigation");
      assert(router.resolve("#missing") === null, "unknown route should fail closed");
    }

    const button = typeof document !== "undefined" ? document.getElementById("mobile-menu-button") : null;
    const nav = typeof document !== "undefined" ? document.getElementById("main-navigation") : null;
    assert(!!button, "INDEX trigger should exist");
    assert(!!nav, "INDEX navigation container should exist");
    assert(button.getAttribute("aria-controls") === "main-navigation", "INDEX trigger should control main navigation");
    assert(button.getAttribute("aria-expanded") === "false", "INDEX should initialize closed");
    assert(!nav.classList.contains("is-open"), "INDEX navigation should initialize closed");
    assert(nav.querySelectorAll("a").length === N.length, "rendered INDEX links should match navigation contract");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_NAVIGATION = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
