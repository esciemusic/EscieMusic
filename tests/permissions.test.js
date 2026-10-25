/*
 * ESCIE TESTS — PERMISSIONS
 *
 * Contract checks for visibility/action boundaries.
 */

(function () {
  const P = typeof window !== "undefined" ? window.ESCIE_PERMISSIONS : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!P) return { skipped: true, reason: "ESCIE_PERMISSIONS unavailable" };

    assert(P.can(P.actions.READ, P.levels.PUBLIC), "public records should be readable");
    assert(P.can(P.actions.READ, P.levels.LIMITED), "limited records should be readable");
    assert(P.can(P.actions.READ, P.levels.PRIVATE), "private records should be internally readable");
    assert(!P.can(P.actions.READ, P.levels.WITHHELD), "withheld records must not be readable");

    assert(P.can(P.actions.WRITE, P.levels.PRIVATE), "private records should be writable");
    assert(!P.can(P.actions.WRITE, P.levels.PUBLIC), "public records must not gain write permission from visibility alone");

    assert(P.can(P.actions.PUBLISH, P.levels.LIMITED), "limited records may be publishable when explicitly approved");
    assert(!P.can(P.actions.PUBLISH, P.levels.PRIVATE), "private records must not be publishable");
    assert(!P.can(P.actions.PUBLISH, P.levels.WITHHELD), "withheld records must not be publishable");

    assert(!P.can(P.actions.DECIDE, P.levels.PUBLIC), "visibility must not grant decision authority");
    assert(!P.can(P.actions.RELATE, P.levels.PUBLIC), "visibility must not grant relationship authority");
    assert(!P.can("unknown-action", P.levels.PUBLIC), "unknown actions must be denied");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_PERMISSIONS = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
