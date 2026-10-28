const fs = require("fs");
const state = require("../core/state.js");
const permissions = require("../core/permissions.js");
const events = require("../core/events.js");
const sources = require("../core/sources.js");
const history = require("../core/history.js");
const control = require("../control/control.js");
const proposals = require("../control/proposals.js");

global.window = { ESCIE_EVENTS: events };
const decisions = require("../control/decisions.js");
const disclosure = require("../security/disclosure.js");
const sanitize = require("../security/sanitize.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(state.API.validate(state).valid, "initial runtime state should be valid");
assert(state.API.setStatus("ready") === true, "valid state status should be accepted");
assert(state.API.setStatus("invalid") === false, "invalid state status must be rejected");
state.transmissionLevel = 9;
assert(!state.API.validate(state).valid, "invalid transmission level must fail state validation");
state.reset();
assert(state.status === "initializing" && state.transmissionLevel === 0, "state reset should restore safe defaults");

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
  event: history.EVENTS.CREATED,
  recordId: "record-test",
  actor: "test"
});
assert(historyEntry && historyEntry.entry && historyEntry.entry.id === "history-test" && historyEntry.valid === true, "history entry should be retained");

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


const relationship = require("../relationship.js");
const invalidRelationship = relationship.create({
  id: "system-invalid-relationship",
  type: "collaborated_with",
  from: "person-a",
  to: "person-b",
  visibility: "private",
  public_disclosure: true
});
assert(invalidRelationship.valid === false, "relationship disclosure invariant should hold in Node");


const audit = require("../brain/audit.js");
const relationshipRecords = [
  { id: "escie" },
  ...require("../data/projects.js"),
  ...require("../data/music.js"),
  ...require("../data/locations.js")
];
const relationships = require("../data/relationships.js");
const relationshipAPI = require("../relationship.js");
const endpointAudit = audit.auditRelationships(
  relationships,
  relationshipRecords,
  relationshipAPI
);
assert(endpointAudit.ok === true, "current relationship endpoints should resolve");
assert(endpointAudit.counts.orphaned === 0, "current relationships must have no orphaned endpoints");
assert(endpointAudit.counts.duplicateIds === 0, "current relationships must have unique ids");
assert(endpointAudit.counts.duplicateConnections === 0, "current relationships must have unique connections");

const orphanAudit = audit.auditRelationships(
  [{ id: "orphan", from: "missing-a", type: "contains", to: "missing-b" }],
  [{ id: "known" }],
  relationshipAPI
);
assert(orphanAudit.ok === false, "orphaned relationship endpoints must fail audit");
assert(orphanAudit.orphaned.length === 2, "both missing endpoints must be reported");

const duplicateAudit = audit.auditRelationships(
  [
    { id: "duplicate", from: "a", type: "contains", to: "b" },
    { id: "duplicate", from: "a", type: "contains", to: "b" }
  ],
  [{ id: "a" }, { id: "b" }],
  relationshipAPI
);
assert(duplicateAudit.duplicateIds.length === 1, "duplicate relationship ids must be reported");
assert(duplicateAudit.duplicateConnections.length === 1, "duplicate connections must be reported");


const provenance = require("../core/provenance.js");
const referenceAudit = require("../brain/reference-audit.js");

const registeredSource = sources.createSource({
  id: "provenance-source",
  type: "documentation",
  name: "Provenance Test Source"
});
assert(sources.validateSource(registeredSource).valid, "valid source should pass source validation");

const recordProvenance = provenance.create({
  sourceIds: ["provenance-source"],
  origin: "documentation",
  transformation: "selected",
  certainty: "verified",
  chain: [
    {
      sourceId: "provenance-source",
      action: "selected",
      actor: "test"
    }
  ]
});
assert(recordProvenance.sourceIds.length === 1, "record provenance should retain source ids");
assert(provenance.validate(recordProvenance, [registeredSource]).valid, "known provenance source should validate");

const missingProvenance = provenance.validate(
  provenance.create({ sourceIds: ["missing-source"] }),
  [registeredSource]
);
assert(missingProvenance.valid === false, "missing provenance source must fail validation");

const provenanceRecord = {
  id: "provenance-record",
  provenance: recordProvenance
};
const provenanceAudit = referenceAudit.auditProvenanceSources(
  [provenanceRecord],
  [registeredSource]
);
assert(provenanceAudit.ok === true, "known provenance sources should pass audit");

const orphanProvenanceAudit = referenceAudit.auditProvenanceSources(
  [{ id: "orphan-provenance", provenance: { sourceIds: ["missing-source"] } }],
  [registeredSource]
);
assert(orphanProvenanceAudit.ok === false, "orphan provenance source must fail audit");
assert(orphanProvenanceAudit.missing.length === 1, "missing provenance source must be reported");

console.log("ESCIE provenance contracts OK");

const gameRuntime=fs.readFileSync("data/games.js","utf8");
assert(gameRuntime.includes('"game_episode"'),"game registry must support game episodes");
assert(gameRuntime.includes('"game_scene"'),"game registry must support game scenes");
assert(gameRuntime.includes('"game_event"'),"game registry must support game events");
assert(gameRuntime.includes('"game_interaction"'),"game registry must support game interactions");
assert(gameRuntime.includes('"game_clue"'),"game registry must support game clues");
assert(gameRuntime.includes('"game_discovery"'),"game registry must support game discoveries");
assert(gameRuntime.includes('"player_path"'),"game registry must support player paths");
assert(gameRuntime.includes('"player_state"'),"game registry must support player state");
assert(gameRuntime.includes('"game_ending"'),"game registry must support game endings");
assert(gameRuntime.includes("conditions"),"game records must support unlock/interaction conditions");
assert(gameRuntime.includes("discoveries"),"game records must support discoveries");
assert(gameRuntime.includes("root=typeof window"),"game registry must be Node/browser compatible");
assert(gameRuntime.includes("ESCIE_GAME_REGISTRY"),"game registry API must be exposed");
assert(gameRuntime.includes('"OBSERVED"'),"player memory must record observations");
assert(gameRuntime.includes('"CONNECTED"'),"player memory must record connections");
assert(gameRuntime.includes('"MISSED"'),"player memory must preserve missed discoveries");
assert(gameRuntime.includes('"UNKNOWN"'),"player memory must preserve unknown state");
assert(gameRuntime.includes("canonical_write:false"),"player state must never become canonical by default");
assert(gameRuntime.includes("function applyPlayerEvent"),"game registry must expose player event application");
assert(gameRuntime.includes("function playerMemory"),"game registry must expose player memory projection");

assert(fs.readFileSync("data/registry.js","utf8").includes('["game",()=>collection("ESCIE_GAMES")]'),"canonical registry must ingest game records");
assert(fs.readFileSync("index.html","utf8").includes('<script src="data/games.js"></script>'),"public runtime must load the game registry");



const chronologicalAudit = require("../brain/audit.js").auditHistorySequence([
  { id: "h1", timestamp: "2026-01-02T00:00:00Z" },
  { id: "h2", timestamp: "2026-01-03T00:00:00Z" }
]);
assert(chronologicalAudit.ok === true, "chronological history should pass audit");

const reversedAudit = require("../brain/audit.js").auditHistorySequence([
  { id: "h1", timestamp: "2026-01-03T00:00:00Z" },
  { id: "h2", timestamp: "2026-01-02T00:00:00Z" }
]);
assert(reversedAudit.ok === false, "reversed history should be reported");



const centralConnect=fs.readFileSync("central-connect/app.html","utf8");
assert(!centralConnect.includes('e.innerHTML="<div><strong>"+p+"'),"Central connector provider detail must not interpolate provider data into HTML");
assert(!centralConnect.includes('n.innerHTML="<strong>OAuth readiness'),"Central OAuth readiness must not interpolate HTML");

const centralWorldRuntime=fs.readFileSync("central-connect/central-world-engine.js","utf8");
assert(!centralWorldRuntime.includes("reality_level"),"Central World Engine must not restore reality-level classification");
assert(!centralWorldRuntime.includes("REAL / MEMORY / MYTH"),"Central World Engine must not present reality classification");
assert(!centralWorldRuntime.includes("[\"reality\",\"REALITY\"]"),"Central World Engine must not expose a reality tab");
assert(centralWorldRuntime.includes("without telling the audience what is real"),"Central World Engine must preserve audience interpretation");

const nodesRuntime=fs.readFileSync("data/nodes.js","utf8");
assert(!nodesRuntime.includes("ARTIST / AUTHOR"),"identity node must not expose artist/author framing");
assert(nodesRuntime.includes('label:"THE FATHER / THE MAN"'),"identity node must use Father / Man framing");
assert(nodesRuntime.includes('role:"CENTRAL PRESENCE"'),"identity node must use central-presence framing");
const clothingRuntime=fs.readFileSync("data/clothing.js","utf8");assert(clothingRuntime.includes("production_packet"),"clothing records need production packets");assert(clothingRuntime.includes('approval_gate:"HUMAN"'),"clothing production must remain human-gated");assert(clothingRuntime.includes('quantity_decision:"POST-SAMPLE"'),"clothing quantities must wait until after sample approval");
assert(clothingRuntime.includes("ESCIE_CLOTHING_AUDIT"),"clothing production audit contract missing");assert(clothingRuntime.includes('p.approval_gate!=="HUMAN"'),"clothing audit must enforce human approval");

const appRuntime=fs.readFileSync("app.js","utf8");
assert(!appRuntime.includes("The central consciousness / interface."),"app fallback identity must not use central-consciousness wording");
assert(appRuntime.includes('function reduceMotion()'),"app runtime needs reduced-motion detection");
assert(appRuntime.includes('behavior:reduceMotion()?"auto":"smooth"'),"app section navigation must respect reduced motion");
assert(appRuntime.includes('reduceMotion() || !("IntersectionObserver" in window)'),"app visual observer must respect reduced motion");

assert(appRuntime.includes('if (!reduceMotion()) {'),"app route transitions must be skipped when reduced motion is requested");
assert(appRuntime.includes('window.setTimeout(focusFirst, 0)'),"mobile navigation focus needs a scheduler fallback");

const playerRuntime=fs.readFileSync("ui/player.js","utf8");
assert(playerRuntime.includes("const safe = mediaAPI && typeof mediaAPI.safeURL === \"function\""),"player must have a self-contained URL safety fallback");
assert(playerRuntime.includes('[\"http:\", \"https:\"].includes(parsed.protocol)'),"player URL fallback must allow only HTTP(S)");
assert(playerRuntime.includes("lastFocusedBeforeShow"),"player must remember focus before opening");
assert(playerRuntime.includes("document.contains(restore)"),"player must restore focus only to an attached element");

const worldEngineRuntime=fs.readFileSync("world-engine.js","utf8");
assert(worldEngineRuntime.includes('esc(state.q)'),"world search query must be HTML-escaped");
assert(worldEngineRuntime.includes('esc(t)'),"world type options must be HTML-escaped");
assert(worldEngineRuntime.includes('esc(n.id)'),"world path node ids must be HTML-escaped");

const visualsRuntime=fs.readFileSync("ui/visuals.js","utf8");
assert(visualsRuntime.includes('const raf=typeof window.requestAnimationFrame==="function"?window.requestAnimationFrame.bind(window):fn=>window.setTimeout(fn,0)'),"visual pointer scheduler needs a requestAnimationFrame fallback");
assert(visualsRuntime.includes("pointerFrame=raf(applyPointer)"),"visual pointer updates must use the compatibility scheduler");
assert(visualsRuntime.includes("if(!rotatingSections.length || reducedMotion())return;"),"project visual rotation must stop when reduced motion is requested");
