/*
 * ESCIE TESTS — BRAIN
 *
 * Ensures the Brain can observe and propose without silently becoming canon.
 */

(function () {
  const B = typeof window !== "undefined" ? window.ESCIE_BRAIN : null;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    if (!B) return { skipped: true, reason: "ESCIE_BRAIN unavailable" };

    const before = B.proposals ? B.proposals.length : 0;
    const proposal = B.propose({
      type: "possible_connection",
      records: ["a", "b"],
      reason: "test candidate"
    });

    assert(proposal, "brain should return a proposal");
    assert((B.proposals || []).length === before + 1, "proposal should be retained");
    assert(proposal.canonical !== true, "brain proposal must not become canon");

    return { passed: true };
  }

  if (typeof window !== "undefined") window.ESCIE_TEST_BRAIN = { run };
  if (typeof module !== "undefined" && module.exports) module.exports = { run };
})();
