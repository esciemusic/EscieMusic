const permissions = require("../core/permissions.js");
const events = require("../core/events.js");
const sources = require("../core/sources.js");
const history = require("../core/history.js");
const proposals = require("../control/proposals.js");
const decisions = require("../control/decisions.js");
const disclosure = require("../security/disclosure.js");
const sanitize = require("../security/sanitize.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(permissions.can("read", "public"), "public records should be readable");
assert(!permissions.can("write", "public"), "public records must not be writable through permissions");
assert(permissions.can("write", "private"), "private records should permit controlled writes");
assert(!permissions.can("read", "withheld"), "withheld records must not be readable");

assert(disclosure.canDisclose({ visibility: "public" }, "public"), "public disclosure should be allowed");
assert(!disclosure.canDisclose({ visibility: "private" }, "public"), "private disclosure must be blocked");
assert(!disclosure.canDisclose({ visibility: "withheld" }, "public"), "withheld disclosure must be blocked");

assert(
  sanitize.escapeHTML('<script>alert("x")</script>') === "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  "HTML escaping contract failed"
);

const source = sources.createSource({ id: "source-test", type: "document", reliability: "credible" });
assert(source.id === "source-test", "source identity should be preserved");
assert(source.reliability === "credible", "source metadata should be preserved");

const beforeHistoryLength = history.ESCIE_HISTORY.length;
const historyEntry = history.appendHistory({
  id: "history-test",
  event: "test",
  recordId: "record-test",
  actor: "test"
});
assert(history.ESCIE_HISTORY.length === beforeHistoryLength + 1, "history must append");
assert(historyEntry.id === "history-test", "history entry identity should be preserved");

const proposal = proposals.createProposal({
  id: "proposal-test",
  title: "Test proposal",
  action: "review"
});
assert(proposal.status === "pending", "proposal should begin pending");
assert(proposal.action === "review", "proposal action should be preserved");

const decision = decisions.createDecision({
  id: "decision-test",
  proposalId: "proposal-test",
  action: "DEFER"
});
assert(decision.action === "DEFER", "decision action should be preserved");
assert(decision.proposalId === "proposal-test", "decision must retain proposal linkage");

let received = false;
const off = events.on("test:event", (detail) => {
  received = detail.value === 42;
});
events.emit("test:event", { value: 42 });
off();
assert(received, "event subscription/emission contract failed");

console.log("ESCIE core/security contracts OK");
