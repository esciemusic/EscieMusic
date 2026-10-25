const permissions = require("../core/permissions.js");
const events = require("../core/events.js");
const sources = require("../core/sources.js");
const history = require("../core/history.js");
const control = require("../control/control.js");
const proposals = require("../control/proposals.js");
const decisions = require("../control/decisions.js");
const disclosure = require("../security/disclosure.js");
const sanitize = require("../security/sanitize.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(permissions.can("read", "public") === true, "public records should be readable");
assert(permissions.can("write", "public") === false, "public visibility must not grant write access");
assert(permissions.can("read", "private") === true, "private records should remain internally readable");
assert(permissions.can("read", "withheld") === false, "withheld records must not be readable");

const publicRecord = { id: "public-a", visibility: "public", title: "Public A" };
const privateRecord = { id: "private-a", visibility: "private", title: "Private A" };
assert(disclosure.canDisclose(publicRecord, "public") === true, "public disclosure should be allowed");
assert(disclosure.canDisclose(privateRecord, "public") === false, "private disclosure must be blocked");
assert(disclosure.publicView(privateRecord) === null, "private records must not receive public views");

assert(sanitize.escapeHTML("<script>") === "&lt;script&gt;", "HTML must be escaped");
assert(sanitize.sanitizeAttribute('a"b') === "a&quot;b", "attribute text must be escaped");

const source = sources.createSource({
  id: "source-test",
  type: "documentation",
  name: "Test Source"
});
assert(source.id === "source-test", "source id should be preserved");

const historyEntry = history.appendHistory({
  id: "history-test",
  event: "test",
  recordId: "record-test",
  actor: "test"
});
assert(historyEntry.id === "history-test", "history entry should be retained");

let controlAdded = false;
let controlResolved = false;
const offControlAdded = events.on("control:item-added", (detail) => {
  controlAdded = detail.item && detail.item.id === "control-test";
});
const offControlResolved = events.on("control:item-resolved", (detail) => {
  controlResolved = detail.item && detail.item.id === "control-test";
});

const controlItem = control.add({
  id: "control-test",
  category: "REVIEW",
  title: "Review test"
});
assert(control.pending().some((item) => item.id === "control-test"), "control item should be pending");
assert(controlAdded, "control addition should emit an event");
assert(typeof control.resolve === "function", "control should expose resolution");
const resolved = control.resolve("control-test", "resolved", { actor: "test" });
assert(resolved && resolved.status === "resolved", "control item should resolve");
assert(controlResolved, "control resolution should emit an event");
assert(!control.pending().some((item) => item.id === "control-test"), "resolved item should leave pending control");
offControlAdded();
offControlResolved();

const proposal = proposals.addProposal({
  id: "proposal-test",
  title: "Test proposal"
});
assert(proposal.status === "pending", "proposal should remain pending");

const decision = decisions.recordDecision({
  id: "decision-test",
  proposalId: proposal.id,
  action: "DEFER"
});
assert(decision.action === "DEFER", "decision action should be retained");

let received = false;
const off = events.on("system:test", (detail) => {
  received = detail.ok === true;
});
events.emit("system:test", { ok: true });
off();
assert(received, "event subscribers should receive structured events");

console.log("ESCIE system contracts OK");
