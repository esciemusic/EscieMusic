/*
 * ESCIE CORE — HEALTH
 *
 * Deterministic runtime health checks. Health describes system condition;
 * it never creates canon or changes persistent content.
 */

const ESCIE_HEALTH = {
  check(required = []) {
    const checks = [];
    const list = Array.isArray(required) ? required : [];

    list.forEach((name) => {
      const available =
        typeof window !== "undefined" &&
        window[name] !== undefined &&
        window[name] !== null;

      checks.push({
        name,
        status: available ? "ok" : "missing"
      });
    });

    const failed = checks.filter((entry) => entry.status !== "ok");

    return {
      ok: failed.length === 0,
      checkedAt: new Date().toISOString(),
      checks,
      failed
    };
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_HEALTH = ESCIE_HEALTH;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_HEALTH;
}
