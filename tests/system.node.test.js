const fs = require("fs");
const state = require("../core/state.js");
const permissions = require("../core/permissions.js");
const events = require("../core/events.js");
const sources = require("../core/sources.js");
const history = require("../core/history.js");
const control = require("../control/control.js");
const proposals = require("../control/proposals.js");
const media = require("../data/media.js");
const centralMedia = require("../central/media-intake.js");
const visuals = require("../data/visuals.js");

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

const mediaAudit = media.validate();
assert(mediaAudit.ok === true, "media library metadata must validate");
assert(media.get("photo-parc-extension-example-001").location.locationId === "DANTE_PARK", "media records must retain canonical location metadata");
assert(media.get("photo-parc-extension-example-001").game.useAsReference === true, "media records must expose world reference usage");
assert(visuals.normalizeEscieVisualAsset({mediaId:"photo-parc-extension-example-001"}) === null, "visual registry should fail safely without a browser media catalog");
console.log("ESCIE media library contracts OK");
const mediaPlan = centralMedia.toWritePlan({id:"dante-park-001",type:"photo",asset:"assets/media/dante-park-001.jpg",location:{label:"Dante Park",district:"Little Italy"},publicSections:["THE WORLD"],worldDistricts:["LITTLE_ITALY"]});
assert(mediaPlan.status === "PENDING_APPROVAL", "Central media intake must require approval");
assert(mediaPlan.destinations.some(d=>d.file === "data/media.js"), "Central media intake must route visual metadata to media registry");
assert(mediaPlan.destinations.some(d=>d.file === "data/world-city.js"), "Central media intake must route geographic world metadata to city registry");
assert(mediaPlan.record.location.label === "Dante Park", "Central media intake must preserve place metadata");
const archivePlan=centralMedia.toWritePlan({id:"archive-001",type:"photo",asset:"assets/media/archive-001.jpg",publicSections:["ARCHIVE"]});
assert(archivePlan.destinations.some(d=>d.file === "data/archive.js"), "Central media intake must route archive placements");
console.log("CENTRAL media intake contracts OK");

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

const rpgRuntime=fs.readFileSync("world/rpg-system.js","utf8");
assert(rpgRuntime.includes("const CLASSES=[\"DRIFTER\",\"RUNNER\",\"INVESTIGATOR\",\"SURVIVOR\"]"),"RPG must expose four starting classes");
assert(rpgRuntime.includes("function setClass"),"RPG must expose starting class selection");
assert(rpgRuntime.includes("CLASS LOCKED AFTER PROGRESSION"),"RPG class choice must lock after progression");
assert(rpgRuntime.includes("function gainXP"),"RPG must support XP progression");
assert(rpgRuntime.includes("function spendPoint"),"RPG must support attribute/skill progression");
assert(rpgRuntime.includes('if(!["ATTRIBUTE","SKILL"].includes(t))return {ok:false,state:s,reason:"INVALID POINT TYPE"}'),"RPG point spending must reject unknown point types");
assert(rpgRuntime.includes('||s.unspent_points>0||Object.values(s.attributes).some(v=>Number(v)>1)'),"RPG class selection must lock after character advancement, not only XP gain");
assert(rpgRuntime.includes('(key==="COMBAT"||key==="STEALTH")&&perks.includes("IRON_NERVES")'),"IRON_NERVES must affect NERVE-based combat and stealth checks");
assert(rpgRuntime.includes('if(!["hit","kill","knockout"].includes(k))return s'),"RPG combat recorder must reject unknown combat event types");
assert(rpgRuntime.includes("function check"),"RPG must expose skill checks");
assert(rpgRuntime.includes("function recordCombat"),"RPG must persist combat progression");
const worldRpgRuntime=fs.readFileSync("world/world.js","utf8");
const worldRpgHtml=fs.readFileSync("world/index.html","utf8");
assert(worldRpgRuntime.includes("data-rpg-class"),"RPG character screen must expose class selection controls");
assert(worldRpgRuntime.includes("info.bonus"),"RPG character screen must expose class specialization bonuses");
assert(fs.readFileSync("world/world.css","utf8").includes(".rpg-class-choice"),"RPG class specialization choices must be styled");
assert(worldRpgRuntime.includes("setClass?.("),"RPG class selection must route through the canonical RPG setter");
assert(worldRpgRuntime.includes("s.rpg=result.state"),"RPG class selection must persist into world state");
assert(worldRpgRuntime.includes("data-rpg-spend-type"),"RPG character screen must expose point allocation controls");
assert(worldRpgRuntime.includes("spendRPGPoint"),"RPG point allocation must route through the world persistence bridge");
assert(worldRpgHtml.includes("id=\"world-rpg\""),"world HTML must expose the RPG character panel");
assert(worldRpgHtml.includes("data-character"),"world HTML must expose the RPG character control");
console.log("ESCIE RPG progression contracts OK");
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
assert(gameRuntime.includes('unknown:[]'),"player memory must preserve unknown state");
assert(gameRuntime.includes("canonical_write:false"),"player state must never become canonical by default");
assert(gameRuntime.includes("player/game records cannot write canonical truth directly"),"game registry must enforce canonical write boundary");
assert(gameRuntime.includes("function applyPlayerEvent"),"game registry must expose player event application");
assert(gameRuntime.includes("function playerMemory"),"game registry must expose player memory projection");
assert(gameRuntime.includes("GAME_OBJECT_TYPES"),"game registry must define world object types");
assert(gameRuntime.includes("GAME_EVENT_TYPES"),"game registry must define game event types");
assert(gameRuntime.includes("function gameObject"),"game registry must expose world object creation");
assert(gameRuntime.includes("function validateGameObject"),"game registry must validate world objects");
assert(gameRuntime.includes("function canInteract"),"game registry must gate interactions");
assert(gameRuntime.includes("function applyGameEvent"),"game registry must normalize gameplay events");


assert(fs.readFileSync("data/registry.js","utf8").includes('["game",()=>collection("ESCIE_GAMES")]'),"canonical registry must ingest game records");
assert(/<script\s+src="data\/games\.js"[^>]*><\/script>/.test(fs.readFileSync("index.html","utf8")),"public runtime must load the game registry");



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


const glassMemoryRuntime=fs.readFileSync("data/glass-eye-memory.js","utf8");
assert(glassMemoryRuntime.includes("escie_glass_eye_memory_v1"),"Glass Eye memory must use a versioned local store");
assert(glassMemoryRuntime.includes("canonical_write=false"),"Glass Eye memory must never become canonical");
assert(glassMemoryRuntime.includes("CLEAR MY MEMORY"),"Glass Eye memory must provide local reset");
assert(glassMemoryRuntime.includes("LOCAL / PRIVATE / NON-CANONICAL"),"Glass Eye memory must disclose its local non-canonical status");
assert(fs.readFileSync("index.html","utf8").includes('id="glass-eye-memory"'),"public site must expose Glass Eye memory surface");
const glassAppRuntime=fs.readFileSync("app.js","utf8");
assert(glassAppRuntime.includes("LOOK. LISTEN. FOLLOW. RETURN."),"Glass Eye must retain its audience-facing core function");
assert(glassAppRuntime.includes("data-glass-eye-action"),"Glass Eye must expose audience interaction controls");
assert(glassAppRuntime.includes("YOUR SIDE OF THE SCREEN"),"Glass Eye must remain the audience side of the screen");

const gameCommerceRuntime=fs.readFileSync("data/games.js","utf8");
assert(gameCommerceRuntime.includes("game_item"),"game items must be supported");
assert(gameCommerceRuntime.includes("game_purchase"),"game purchases must be supported");
assert(gameCommerceRuntime.includes("validateItem"),"game item validation must exist");
assert(gameCommerceRuntime.includes("canonical truth directly"),"game commerce must not write canonical truth directly");
assert(gameCommerceRuntime.includes("external_purchase_url"),"game items must support external purchase routing");
assert(gameCommerceRuntime.includes("function inspectGameItem"),"game items must support in-world inspection");
assert(gameCommerceRuntime.includes("function safePurchaseURL"),"game purchase URLs must be protocol-safe");
assert(gameCommerceRuntime.includes('["http:","https:"]'),"game checkout routing must allow only HTTP(S)");
assert(gameCommerceRuntime.includes("function acquireGameItem"),"game items must support controlled acquisition");
assert(gameCommerceRuntime.includes('reason:"external checkout required"'),"real-money game items must remain external checkout");
assert(gameCommerceRuntime.includes('reason:"insufficient signal"'),"earned items must enforce affordability");



assert(gameCommerceRuntime.includes("GAME_PRICE_TYPES"),"game economy must define price types");
assert(gameCommerceRuntime.includes("REAL_MONEY"),"game economy must distinguish real-money purchases");
assert(gameCommerceRuntime.includes("EARNED"),"game economy must support earned items");
assert(gameCommerceRuntime.includes("createGameEconomy"),"game economy must have isolated player economy state");
assert(gameCommerceRuntime.includes("canAfford"),"game economy must have affordability checks");
assert(gameCommerceRuntime.includes("PURCHASE_CONFIRMED"),"game economy must support confirmed purchases");
assert(gameCommerceRuntime.includes("canonical_write=false"),"game economy must remain non-canonical");

const gameShopRuntime=fs.readFileSync("app.js","utf8");
assert(gameShopRuntime.includes("renderGameShop"),"public game item doorway must render");
assert(gameShopRuntime.includes("ENTER CHECKOUT"),"real-money game items must route to checkout");
assert(gameShopRuntime.includes("EARN IN THE SIGNAL"),"earned game items must remain in-game");
assert(gameShopRuntime.includes("FOUND / CLAIMED IN GAME"),"free game items must remain game-native");
assert(gameShopRuntime.includes("renderGameItemInspector"),"public game doorway must expose acquisition state");


const worldRuntime = fs.readFileSync("world/world.js", "utf8");
const world3dRuntime = fs.readFileSync("world/3d-reality.js", "utf8");
const simRuntime = fs.readFileSync("world/world-simulation.js", "utf8");
const worldIndex = fs.readFileSync("world/index.html", "utf8");
const style=fs.readFileSync("style.css","utf8");
const world=fs.readFileSync("world/world.css","utf8");
const npcRuntime=fs.readFileSync("world/npc-system.js","utf8");
const npcLifeRuntime=fs.readFileSync("world/npc-life-system.js","utf8");
const interiorRuntime = fs.readFileSync("world/interior-system.js", "utf8");
const dreamPlayRuntime=fs.readFileSync("world/dream-play.js","utf8");
assert(worldRuntime.includes('const parsed=JSON.parse(localStorage.getItem(KEY)||"{}");return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{}'),"world save state must reject null and array-shaped corruption");
assert(worldRuntime.includes('if(!target){say("Nothing nearby to interact with.");return false}'),"world interaction must safely handle no target");
assert(dreamPlayRuntime.includes('if(!s?.active)return null'),"dream controls must only intercept input while dream play is active");
assert(worldRuntime.includes('const SAVE_KEY="escie_world_save_v1",SAVE_VERSION=2'),"world save must use a versioned snapshot format");
assert(worldRuntime.includes("world_position={x:Number(pos.x)||0,y:Number(pos.y)||0"),"world save must persist the playable position");
assert(worldRuntime.includes("simulation_state:sim&&typeof sim==="+"\"object\""),"world save must snapshot simulation state");
assert(worldRuntime.includes("input_mode:controlScheme()"),"world save must persist the active input mode");
assert(worldRuntime.includes("snapshot.world_state"),"world load must restore the saved world state envelope");
assert(worldRuntime.includes("function restoreSaveStores"),"world load must restore auxiliary gameplay stores");
assert(worldRuntime.includes('"escie_world_simulation_v1"'),"world load must restore simulation state through the store bundle");
assert(worldRuntime.includes('setControlScheme(String(staged.input_mode||staged.world_state.input_mode).toUpperCase())'),"world load must restore input mode");
assert(worldRuntime.includes("boot.world_position"),"world boot must restore the saved playable position");
assert(worldRuntime.includes('const RESET_FLAG="escie_world_reset_pending_v1"'),"world reset must use a reset guard");
assert(worldRuntime.includes('"escie_world_simulation_v1"'),"world reset/save bundle must include simulation state");
assert(worldRuntime.includes('"escie_world_npc_v1"'),"world reset/save bundle must include NPC state");
assert(worldRuntime.includes('"escie_world_npc_life_v1"'),"world reset/save bundle must include NPC life state");
assert(worldRuntime.includes('"escie_world_equipment_v1"'),"world reset/save bundle must include equipment state");
assert(worldRuntime.includes('"escie_world_vehicles_v1"'),"world reset/save bundle must include vehicle state");
assert(worldRuntime.includes('"escie_world_law_v1"'),"world reset/save bundle must include law state");
assert(worldRuntime.includes('"escie_phone_v1"'),"world reset/save bundle must include phone state");
assert(worldRuntime.includes("if(!resetPending())saveWorldState()"),"reset must prevent visibility/pagehide from recreating a deleted save");
assert(worldRuntime.includes("const keys=[KEY,SAVE_KEY,saveSlotKey(active),...SAVE_STORE_KEYS]"),"reset must clear only active gameplay stores");
assert(!worldRuntime.includes("keys=[KEY,SAVE_KEY,saveSlotKey(active),...SAVE_STORE_KEYS,PROFILE_KEY,PREF_KEY"),"reset must not include profile or preference stores");
assert(worldRuntime.includes("syncSimulationPosition()"),"world boot must resync simulation position after loading");
assert(worldRuntime.includes("SAVE_SLOT_COUNT=3"),"world save system must expose three local save slots");
assert(worldRuntime.includes("ACTIVE_SLOT_KEY"),"world save system must persist the active slot");
assert(worldRuntime.includes("function activeSaveSlot()"),"world save system must resolve a safe active slot");
assert(worldRuntime.includes("function saveSlotKey"),"world save system must isolate slot storage");
assert(worldRuntime.includes("function saveSlotStores"),"world save system must snapshot auxiliary gameplay stores");
assert(worldRuntime.includes("function restoreSaveStores"),"world save system must restore auxiliary gameplay stores");
assert(worldRuntime.includes("function migrateLegacySave"),"world save system must migrate the legacy save into slot one");
assert(worldRuntime.includes("const snapshot={version:SAVE_VERSION,saved_at:new Date().toISOString(),slot,world_state:current"),"world save snapshots must identify their active slot");
assert(worldRuntime.includes("const stores=saveSlotStores()"),"world save snapshots must capture auxiliary gameplay state");
assert(worldRuntime.includes("function switchSaveSlot"),"world runtime must support save-slot switching");
assert(worldRuntime.includes("RESET ACTIVE SLOT"),"world system UI must expose active-slot reset semantics");
assert(worldRuntime.includes("Other save slots, profile and preferences remain."),"active-slot reset must preserve other slots, profile and preferences");
assert(worldRuntime.includes("data-slot-load=\"'+n+'\""),"world system UI must expose slot one load control");
assert(worldRuntime.includes("data-slot-load=\"'+n+'\""),"world system UI must expose slot two load control");
assert(worldRuntime.includes("data-slot-load=\"'+n+'\""),"world system UI must expose slot three load control");
assert(worldRuntime.includes("function quarantineSave"),"world save system must quarantine corrupted slots");
assert(worldRuntime.includes("function validateSaveSnapshot"),"world save system must validate save snapshots before restore");
assert(worldRuntime.includes("function initializeEmptySave"),"world save system must initialize missing slots as new games");
assert(worldRuntime.includes('entry_source:"new-game"'),"new game initialization must mark a clean entry source");
assert(worldRuntime.includes('world_room:"lane"'),"new game initialization must start in the lane");
assert(worldRuntime.includes('inventory:[],discoveries:[],world_unlocks:[],signals:0'),"new game initialization must clear progression state");
assert(worldRuntime.includes("if(!raw)return initializeEmptySave(n)"),"missing save slots must initialize instead of remaining undefined");
assert(worldRuntime.includes("function saveSlotStatus"),"world save manager must expose explicit slot status");
assert(worldRuntime.includes("function deleteSaveSlot"),"world save manager must support slot deletion");
assert(worldRuntime.includes("data-slot-load"),"world system must expose LOAD controls for save slots");
assert(worldRuntime.includes("data-slot-new"),"world system must expose NEW controls for save slots");
assert(worldRuntime.includes("data-slot-delete"),"world system must expose DELETE controls for save slots");
assert(worldRuntime.includes("SAVE / LOAD"),"world system must expose save/load management");
assert(worldRuntime.includes("JSON_PARSE_FAILED"),"world save system must classify malformed JSON");
assert(worldRuntime.includes("SLOT_MISMATCH"),"world save system must reject cross-slot snapshots");
assert(worldRuntime.includes("INVALID_POSITION"),"world save system must reject malformed saved positions");
assert(worldRuntime.includes('saveIndicator("SLOT "+n+" QUARANTINED")'),"world save system must notify when a slot is quarantined");
assert(worldRuntime.includes('function activeInputDevice(kind)'),"world runtime must track the active input device");
assert(worldRuntime.includes('activeInputDevice("KEYBOARD")'),"keyboard input must register as active");
assert(worldRuntime.includes('activeInputDevice("TOUCH")'),"touch input must register as active");
assert(worldRuntime.includes('activeInputDevice("GAMEPAD")'),"gamepad input must register as active");
assert((worldRuntime.match(/function roomSetup\(/g)||[]).length===1,"world runtime must have exactly one room initializer");
assert((worldRuntime.match(/function interactNow\(/g)||[]).length===1,"world runtime must have exactly one interaction handler");
assert((worldRuntime.match(/function investigation\(/g)||[]).length===1,"world runtime must have exactly one active investigation function");
assert((worldRuntime.match(/function investigationLegacy\(/g)||[]).length===1,"legacy investigation must be explicitly isolated");
const worldQuestData=fs.readFileSync("data/world-quests.js","utf8");
assert(worldQuestData.includes("quest-first-signal"),"world quest definitions must live in canonical file data");
assert(worldRuntime.includes("window.ESCIE_WORLD_QUESTS"),"world runtime must consume file-based quest data");
assert(worldIndex.includes("../data/world-quests.js"),"world entry must load canonical quest data before runtime");
console.log("ESCIE world runtime contracts OK");

const worldHtml=fs.readFileSync("world/index.html","utf8");
assert((worldHtml.match(/\bdata-action(?=\s|=|>)/g)||[]).length===0,"world HTML must not expose legacy 2D interact controls");

const requiredControls=["data-dir","data-control-action","data-action","data-fullscreen","data-rotate","data-device","data-preferences","data-pause","data-system","data-save","data-profile","data-life","data-life-systems","data-inventory","data-glass","data-investigation","data-market","data-phone-open","data-quests"];
assert(!worldHtml.match(/<button(?![^>]*\btype=)[^>]*>/),"world HTML buttons must declare explicit type");
assert(worldRuntime.includes("function worldEntryGate()"),"world must expose a first-entry gate");
assert(worldRuntime.includes("data-entry-continue"),"world entry must support continue");
assert(worldRuntime.includes("data-entry-new"),"world entry must support new game");
assert(worldRuntime.includes("data-entry-slots"),"world entry must expose save/load");
assert(worldRuntime.includes("data-entry-exit"),"world entry must support returning to ESCIE");
assert(worldRuntime.includes("function restoreWorldRuntime"),"world must restore saved room and position on boot");
assert(worldRuntime.includes("room=allowed.includes(String(s.world_room))"),"world boot must restore the saved room");
assert(worldRuntime.includes("syncSimulationPosition()"),"world boot must resync simulation position");
assert(worldRuntime.includes("WORLD_BOOT_DEPENDENCIES"),"world must declare boot dependencies");
assert(worldRuntime.includes("function worldBootAudit"),"world must audit boot dependencies");
assert(worldRuntime.includes("window.ESCIE_WORLD_BOOT=status"),"world must expose boot readiness status");
assert(worldRuntime.includes('typeof sim.state==="function"?sim.state():sim.state'),"dream choices must safely resolve simulation state");
for(const control of requiredControls) assert(worldHtml.includes(control),"world HTML missing control "+control);
console.log("ESCIE world control wiring contracts OK");

/* CONFIRMED MASTER PALETTE */


assert(style.includes("--escie-void:#050505"),"master palette must define Void");
assert(style.includes("--escie-blue:#2f80ff"),"master palette must define Signal Blue");
assert(style.includes("--escie-purple:#6f3faf"),"master palette must define Deep Violet");
assert(style.includes("--escie-ultraviolet:#9b59ff"),"master palette must define Ultraviolet");
assert(style.includes("--escie-green:#8faf72"),"master palette must define incidental green");
assert(style.includes("--escie-red:#8e1f2d"),"master palette must define Blood");
assert(style.includes("--escie-rust:#8a4035"),"master palette must define Rust");
assert(style.includes("--escie-amber:#b8873a"),"master palette must define Amber");
assert(style.includes("--escie-cold-grey:#70747a"),"master palette must define Cold Grey");
assert(world.includes("--world-green:var(--escie-blue)"),"world legacy green signal alias must resolve to Signal Blue");
console.log("ESCIE confirmed master palette contracts OK");


/* WORLD LIFECYCLE CONTRACTS */
assert(worldRuntime.includes("function cleanupWorldLifecycle(reason="),"world lifecycle must clean active layers before room transitions");
assert(worldRuntime.includes("function transitionRoom(nextRoom,nextPos,message)"),"world room transitions must use one lifecycle path");
assert(worldRuntime.includes("window.ESCIE_WORLD_SIMULATION?.advance?.(5)"),"room transitions must advance simulation time");
assert(worldRuntime.includes("syncSimulationPosition();persistRoom();"),"room transitions must synchronize simulation position before saving");
assert(worldRuntime.includes("s.world_position={x:Number(pos.x)||0,y:Number(pos.y)||0}"),"room persistence must include runtime position");
assert(worldRuntime.includes("if(s?.cancelled)return"),"dream completion must ignore cancelled sessions");
assert(dreamPlayRuntime.includes('cancel=function(reason="CANCELLED")'),"dream play must expose lifecycle cancellation");
assert(dreamPlayRuntime.includes("s.cancelled=true;s.active=false"),"dream cancellation must invalidate active state");
console.log("ESCIE world lifecycle contracts OK");


/* NPC LIFECYCLE CONTRACTS */
assert(worldRuntime.includes("window.ESCIE_WORLD_NPC?.tick?.(sim.day,sim.hour,sim.minute"),"room transitions must advance NPC schedules");
assert(worldRuntime.includes("window.ESCIE_WORLD_NPC_LIFE?.syncRelationships?.()"),"room transitions must synchronize NPC relationships");
console.log("ESCIE NPC lifecycle contracts OK");


/* NPC TIME-SCALE CONTRACTS */
assert(npcRuntime.includes("const tick=(day,hour,minute,blocked,elapsedMinutes=30)"),"NPC ticking must accept elapsed simulation minutes");
assert(npcRuntime.includes("NPC_LIFE?.tick?.(Math.max(1,Number(elapsedMinutes)||30))"),"NPC life simulation must use the elapsed simulation interval");
assert(worldRuntime.includes("NPC?.tick?.(rs.day,rs.hour,rs.minute,(x,y)=>false,2)"),"interior room movement must advance NPC life on the same time scale");
assert(worldRuntime.includes("NPC?.tick?.(sim.state().day,sim.state().hour,sim.state().minute,(x,y)=>isWall(x,y),1)"),"lane movement must advance NPC life on the same time scale");
assert(worldRuntime.includes("window.ESCIE_WORLD_NPC_LIFE?.syncRelationships?.();persistRoom();say"),"room movement must synchronize NPC relationships and persistence");
console.log("ESCIE NPC time-scale contracts OK");


/* INTERIOR LIFECYCLE CONTRACTS */
assert(world3dRuntime.includes("function enter3DInterior(building)"),"3D gameplay must own interior transitions");
assert(world3dRuntime.includes("function use3DInteriorAction()"),"3D interiors need an interaction action layer");
assert(world3dRuntime.includes("root.ESCIE_WORLD_CITY?.interiors"),"3D interior actions consume canonical interior definitions");
assert(world3dRuntime.includes("sim?.activity?.(action"),"3D interior activities route through simulation");
assert(world3dRuntime.includes("interiorMode=true"),"3D interiors must enter through the 3D gameplay layer");
assert(world3dRuntime.includes("interiorMode)return use3DInteriorAction()"),"3D interior interaction must stay inside the 3D gameplay layer");
assert(world3dRuntime.includes("if(interiorMode){exit3DInterior();return}togglePause();"),"Escape must exit a 3D interior before opening the 2D pause layer");
assert(!worldIndex.includes('<script src="interior-system.js"></script>'),"legacy 2D interior renderer must not be loaded into playable gameplay");
assert(world.includes(".world-map{display:none;"),"2D map must be hidden during active 3D gameplay");
assert(world.includes("body.is-world-paused .world-map{display:block}"),"2D map must only be revealed by pause state");
assert(world3dRuntime.includes('document.body.classList.toggle("is-world-paused",paused)'),"3D pause state must own the 2D map visibility state");
assert(!worldIndex.includes("REALITY FILTER"),"game UI must not expose the removed reality filter");
assert(world3dRuntime.includes("pause:()=>togglePause(true)"),"3D runtime must expose a pause gate for 2D system views");
assert(world3dRuntime.includes("isPaused:()=>paused"),"3D runtime must expose authoritative pause state");
for(const fn of ["inventory","character","investigation","market","quests","openSimulation","phoneApp","glass","systemMenu","preferences","profileMenu"]){assert(worldRuntime.includes("function "+fn+"(") && worldRuntime.includes("ensureSystemPause();"),fn+" must route its 2D system view through pause state");} assert(worldRuntime.includes("const world=window.ESCIE_3D_WORLD"),"pause gate must use the browser global 3D runtime"); assert(worldRuntime.includes("window.ESCIE_WORLD_UI={inventory,character,investigation,market,quests,openSimulation,phoneApp,systemMenu,preferences,profileMenu,glass}"),"2D system views must be reachable through the world UI bridge"); assert(worldIndex.includes("data-pause-open=\"inventory\""),"pause menu must own inventory access"); assert(worldIndex.includes("data-pause-open=\"system\""),"pause menu must own system access"); assert(!worldIndex.includes("data-system>SYSTEM"),"system access must not remain in active gameplay controls"); assert(!worldIndex.includes("data-inventory>INVENTORY"),"inventory access must not remain in active gameplay controls"); assert(world3dRuntime.includes('if(e.key==="Escape"){e.preventDefault();if(interiorMode){exit3DInterior();return}togglePause();}'),"Escape must exit interiors first and otherwise pause the authoritative 3D runtime"); assert(world3dRuntime.includes("data-pause-open"),"3D runtime must route pause-system actions");

console.log("ESCIE 3D interior lifecycle contracts OK");
assert((world3dRuntime.match(/function enter3DInterior\(building\)/g)||[]).length===1,"3D interior entry must have exactly one runtime implementation");
assert(world3dRuntime.includes("const obstacles=[],actors=[],doors=[],lights=[],evidence=[],interiorActors=[],interiorStations=[];"),"3D interior actors and stations must have dedicated runtime collections");
assert(world3dRuntime.includes("interiorActors.length=0;interiorStations.length=0;"),"interior runtime collections must clear during world reset");
assert(world3dRuntime.includes("social_place_id"),"interior NPC routing must recognize canonical social-place assignments");
console.log("ESCIE 3D interior runtime integrity contracts OK");


assert(world3dRuntime.includes("const schedule=Array.isArray(live.schedule)?live.schedule:[]"),"interior NPCs must consume persistent canonical NPC schedules");
assert(world3dRuntime.includes("const expectedBuilding="),"interior NPC visibility must follow schedule target buildings");
assert(/activity==="WORK"\s*\?\s*\(live\.work_building\?\.id\|\|live\.workplace_id\)/.test(world3dRuntime),"working NPCs must resolve their authored workplace");
assert(/activity==="SOCIAL"\s*\?\s*\(live\.social_building\?\.id\|\|live\.social_place_id\)/.test(world3dRuntime),"social NPCs must resolve their authored social place");
assert(world3dRuntime.includes('["SLEEP","HOME"].includes(activity)'),"home NPC routines must resolve authored home buildings");
assert(/g\.userData\.targetStation=meta/.test(world3dRuntime)&&world3dRuntime.includes("const meta=station.userData.interiorStation"),"interior NPCs must persist their current station target");
assert(world3dRuntime.includes("g.userData.targetRoom=meta.room"),"interior NPCs must retain their current room target");
assert(world3dRuntime.includes("Math.floor(minute/15)+hashId(g.userData.id)"),"interior station selection must remain deterministic across frames");
console.log("ESCIE contextual interior schedule contracts OK");




/* ROOM TRANSITION NPC TIME-SCALE CONTRACT */
assert(world3dRuntime.includes("NPC?.tick?.("),"3D world transitions must retain NPC time-scale integration");
console.log("ESCIE 3D room-transition time-scale contract OK");


/* NPC RELATIONSHIP PERSISTENCE CONTRACT */
assert(npcLifeRuntime.includes('api.relationship==="function"'),"NPC life relationship changes must route through the canonical NPC relationship writer");
assert(npcLifeRuntime.includes("const fresh=api.state()?.npcs?.[id]||n"),"NPC life relationship changes must read back canonical NPC state");
assert(npcLifeRuntime.includes('ls.npcs[id]=Object.assign(ls.npcs[id]||{}, {relationship:Number(fresh.relationship||next)})'),"NPC life relationship changes must persist their mirrored life state");
console.log("ESCIE NPC relationship persistence contract OK");


/* SAVE STORE INTEGRITY CONTRACTS */
assert(worldRuntime.includes("function validateStoreBundle(stores)"),"save validation must validate auxiliary runtime stores");
assert(worldRuntime.includes("INVALID_STORE_"),"save validation must produce store-specific corruption reasons");
assert(worldRuntime.includes("const storeError=validateStoreBundle(snapshot.stores)"),"snapshot validation must reject malformed auxiliary stores");
console.log("ESCIE save-store integrity contracts OK");


/* PUBLIC INDEX / ACCORDION HIERARCHY CONTRACTS */
const publicNavigationRuntime=fs.readFileSync("navigation.js","utf8");
const aestheticRuntime=fs.readFileSync("aesthetic.css","utf8");
assert(publicNavigationRuntime.includes('id:"now",label:"NOW"'),"public index must retain NOW");
assert(publicNavigationRuntime.includes('id:"art",label:"WORK"'),"public index must retain WORK");
assert(publicNavigationRuntime.includes('id:"world",label:"THE WORLD"'),"public index must retain THE WORLD");
assert(publicNavigationRuntime.includes('id:"web",label:"THE WEB"'),"public index must retain THE WEB");
assert(publicNavigationRuntime.includes('id:"archives",label:"ARCHIVE"'),"public index must retain ARCHIVE");
assert(publicNavigationRuntime.includes('id:"investigation",label:"INVESTIGATION"'),"public index must retain INVESTIGATION");
assert(publicNavigationRuntime.includes('id:"glass-eye",label:"GLASS EYE"'),"public index must retain GLASS EYE");
assert(publicNavigationRuntime.includes('id:"escie",label:"ESCIE"'),"public index must retain ESCIE");
assert(!publicNavigationRuntime.includes('id:"merch",label:"MERCH"'),"MERCH must not occupy a primary index slot");
assert(!publicNavigationRuntime.includes('id:"enter-world"'),"ENTER THE WORLD must not occupy a primary index slot");
assert(aestheticRuntime.includes("main > .site-section:not(#entry).section-collapsed"),"collapsed sections must have an explicit compact state");
assert(aestheticRuntime.includes("padding:5px 0"),"collapsed sections must stay tightly spaced");
assert(aestheticRuntime.includes("section-open .section-drop-panel"),"expanded sections must create their own internal space");
assert(aestheticRuntime.includes("padding:28px 0 8px"),"expanded sections must create readable content spacing");
assert(aestheticRuntime.includes(".section-open .section-drop-trigger"),"expanded sections must receive a distinct visual state");
assert(fs.readFileSync("app.js","utf8").includes("function renderWorld()"),"public runtime must render the geographic world record");
assert(fs.readFileSync("app.js","utf8").includes("GEOGRAPHIC RECORD"),"THE WORLD must expose the public geographic record");
assert(aestheticRuntime.includes(".world-place-list"),"THE WORLD geographic record must have a restrained list presentation");
assert(fs.readFileSync("app.js","utf8").includes("renderMerch();\n    bindMerchFilters();\n    renderWorld();\n    renderWeb();"),"public render lifecycle must render THE WORLD before THE WEB");
assert(!fs.readFileSync("app.js","utf8").includes("ESCIE_RUNTIME.webFilters[control.getAttribute(\"data-web-filter\")]=control.value||\"\";\n      renderWorld();"),"THE WEB filter changes must not rebuild THE WORLD unnecessarily");
const publicAppRuntime=fs.readFileSync("app.js","utf8");
const musicStart=publicAppRuntime.indexOf("function renderMusic()");
const projectsStart=publicAppRuntime.indexOf("function renderProjects()",musicStart);
assert(musicStart>=0 && projectsStart>musicStart,"public music renderer must remain a bounded function");
const musicRenderer=publicAppRuntime.slice(musicStart,projectsStart);
assert(!musicRenderer.includes("item.category"),"public music renderer must not reference merch-only item state");
assert(!musicRenderer.includes("packet.quantity_decision"),"public music renderer must not reference merch production state");
assert(musicRenderer.includes("data-record-id"),"public music renderer must expose record targets for playback/inspection");
console.log("ESCIE public music renderer contracts OK");

assert(fs.readFileSync("world/3d-reality.js","utf8").includes("doors.forEach(d=>{d.open=false;d.mesh.rotation.y=0;});"),"3D interior exit must close street doors before restoring street play");
assert(/if\(seed%2===0 \|\| buildingRef\)\{const dm=door\(/.test(fs.readFileSync("world/3d-reality.js","utf8")),"every canonical building must receive a 3D-accessible door");
assert(fs.readFileSync("world/3d-reality.js","utf8").includes('const type=String(building?.interior||"").toUpperCase();'),"3D interiors must derive visual identity from canonical interior type");
assert(fs.readFileSync("world/3d-reality.js","utf8").includes('type==="SHOP"' ) && fs.readFileSync("world/3d-reality.js","utf8").includes('type==="STUDIO"'),"3D interiors must provide distinct authored visual treatments");
assert(fs.readFileSync("world/3d-reality.js","utf8").includes('say3D("EXITED · BACK ON THE STREET")'),"3D interior exit must return the player to the street layer");
console.log("ESCIE 3D interior door lifecycle contracts OK");
const world3dInterior=fs.readFileSync("world/3d-reality.js","utf8");
assert(world3dInterior.includes("occupiedBy:null,holdUntil:0"),"interior stations must track occupant holds");
assert(world3dInterior.includes('activity==="COMMUTE"'),"interior NPCs must leave active interior state during commute windows");
assert(world3dInterior.includes("g.userData.occupation"),"interior NPC runtime must preserve occupation context");
assert(world3dInterior.includes("g.userData.roomTransition"),"interior NPCs must retain room-transition state");
assert(world3dRuntime.includes("currentWindow=n=>Array.isArray(n.schedule)"),"street NPC runtime must consume persistent schedule windows");
assert(world3dRuntime.includes('scheduledActivity==="COMMUTE"'),"street NPC runtime must visibly route commute behavior");
assert(world3dRuntime.includes("n.x=Number(target.x)"),"street NPC schedule targets must resolve back into canonical NPC position state");
assert(world3dRuntime.includes("buildingRef.__worldDoor"),"authored buildings must expose runtime door coordinates for NPC routing");
assert(world3dRuntime.includes("current_building_id"),"NPC runtime must persist street/interior building state");
assert(world3dRuntime.includes("lastWorldX"),"NPC runtime must preserve the last world position across interior transitions");
assert(world3dRuntime.includes("enteringUntil"),"NPC building transitions must have a visible arrival phase before street actors disappear");
assert(world3dRuntime.includes("doorTransition"),"NPC building transitions must expose explicit door transition state");
assert(world3dRuntime.includes('n.current_building_state="INSIDE"'),"NPC runtime must persist an inside-building state after the door transition");
assert(world3dRuntime.includes('n.current_building_state="EXITING"'),"NPC runtime must persist an exiting-building state during commute transitions");
assert(world3dRuntime.includes('a.userData.doorTransition="EXIT"'),"NPC exits must expose explicit door transition state");
assert(world3dRuntime.includes("roomIndex"),"interior stations must retain canonical room placement metadata");


const worldContent=fs.readFileSync("data/world-content.js","utf8");
const worldCity=fs.readFileSync("data/world-city.js","utf8");
assert(worldContent.includes("window.ESCIE_WORLD_CONTENT"),"canonical world content file must publish the world content registry");
assert(worldContent.includes("game-item-baby-shoe"),"canonical world content must retain authored world objects");
assert(worldContent.includes("POCKET_KNIFE"),"canonical world content must retain authored loot");
assert(worldContent.includes("TRACE CORE"),"canonical world content must retain authored room definitions");
assert(worldContent.includes("runtimeNPC"),"canonical world content must retain runtime NPC profiles");
assert(worldRuntime.includes("CONTENT.runtimeNPC"),"world runtime must consume canonical runtime NPC profiles");
assert(!worldRuntime.includes("registerSurveillance({id:\"lane-camera\""),"world runtime must not own the authored surveillance profile");
assert(worldCity.includes("window.ESCIE_WORLD_CITY"),"canonical city file must publish the city simulation registry");
assert(worldCity.includes("PARC-EXTENSION"),"canonical city file must retain Montréal district street data");
assert(worldCity.includes("npcPopulations"),"canonical city file must own authored NPC population data");
assert(worldRuntime.includes("window.ESCIE_WORLD_CONTENT"),"world runtime must consume canonical world content");
assert(!worldRuntime.includes("let npcs=[{id:\"witness\""),"world runtime must not own the authored NPC definition");
assert(!worldRuntime.includes("const WORLD_LOOT_TABLE=["),"world runtime must not own the authored loot table");
assert(simRuntime.includes("window.ESCIE_WORLD_CITY"),"simulation must consume canonical city data");
const worldItems=fs.readFileSync("data/world-items.js","utf8");
assert(worldItems.includes("window.ESCIE_WORLD_ITEMS"),"canonical world item file must publish item registries");
assert(worldItems.includes("STREET_CAR"),"canonical world item file must retain street vehicle definitions");
assert(worldItems.includes("VAN") && worldItems.includes("SUV"),"canonical world item file must retain expanded vehicle classes");
assert((worldCity.match(/id:"resident_[a-z_0-9]+"/g)||[]).length>=8,"canonical city data must retain baseline residential NPC coverage");
assert(worldCity.includes("densityNPCs"),"canonical city data must expose authored population density expansion");
assert(worldCity.includes("LAUNDROMAT_PE") && worldCity.includes("REHEARSAL_ME") && worldCity.includes("DINER_VE"),"canonical city data must retain secondary district buildings");
assert(worldItems.includes("POCKET_KNIFE"),"canonical world item file must retain equipment definitions");
assert(fs.readFileSync("world/equipment.js","utf8").includes("window.ESCIE_WORLD_ITEMS?.equipment"),"equipment system must consume canonical item data");
assert(fs.readFileSync("world/vehicle-system.js","utf8").includes("window.ESCIE_WORLD_ITEMS?.vehicles"),"vehicle system must consume canonical vehicle data");
assert(worldIndex.indexOf("../data/world-items.js")<worldIndex.indexOf("equipment.js"),"world item data must load before equipment runtime");
assert(!simRuntime.includes("const WORLD_STREETS={"),"simulation must not own the authored street graph");
assert(!simRuntime.includes("const NPC_POPULATIONS={"),"simulation must not own authored NPC populations");
assert(worldIndex.indexOf('../data/world-content.js')<worldIndex.indexOf('world.js'),"canonical world content must load before world runtime");
assert(worldIndex.indexOf('../data/world-city.js')<worldIndex.indexOf('world-simulation.js'),"canonical city data must load before simulation runtime");
assert(simRuntime.includes("const CITY=window.ESCIE_WORLD_CITY||{};"),"simulation must bind to canonical city data");
assert(simRuntime.includes("const WORLD_BUILDINGS=CITY.buildings||{};"),"simulation must consume canonical building data");
assert(simRuntime.includes("const INTERIORS=CITY.interiors||{};"),"simulation must consume canonical interior data");
assert(simRuntime.includes("const PUBLIC_TRANSIT=CITY.publicTransit||{};"),"simulation must consume canonical transit data");
assert(!simRuntime.includes("const WORLD_BUILDINGS={"),"simulation must not own authored building definitions");
assert(!simRuntime.includes("const INTERIORS={"),"simulation must not own authored interior definitions");
assert(!simRuntime.includes("const PUBLIC_TRANSIT={"),"simulation must not own authored transit definitions");
assert(!simRuntime.includes("const WORLD_LANDMARKS={"),"simulation must not own authored landmark definitions");
assert(fs.readFileSync("data/world-city.js","utf8").includes("world_buildings"),"canonical city data must own building definitions");
assert(fs.readFileSync("data/world-city.js","utf8").includes("public_transit"),"canonical city data must own transit definitions");
const worldEngine=fs.readFileSync("world-engine.js","utf8");
assert(!worldEngine.includes("world-public-reality"),"public World Engine must not expose a reality filter");
assert(!worldEngine.includes("realityLevel"),"public World Engine must not classify/filter the world through a reality-level control");

const worldHealth=fs.readFileSync("world/health-check.js","utf8");
assert(worldHealth.includes("ESCIE_WORLD_HEALTH"),"world must expose post-boot health state");
assert(worldHealth.includes("ESCIE_WORLD_CONTENT"),"world health must verify canonical content");
assert(worldHealth.includes("ESCIE_WORLD_CITY"),"world health must verify canonical city data");
assert(worldHealth.includes("ESCIE_WORLD_ITEMS"),"world health must verify canonical item data");
assert(worldHealth.includes("ESCIE_WORLD_QUESTS"),"world health must verify canonical quest data");
assert(worldHealth.includes("ESCIE_WORLD_ACTIONS"),"world health must verify runtime boot");
assert(worldIndex.indexOf("health-check.js")>worldIndex.indexOf("3d-reality.js"),"world health check must load after core runtime dependencies");
const citySecurity=fs.readFileSync("data/world-city.js","utf8");
assert(citySecurity.includes("building_security"),"city data must define building security metadata");
assert(citySecurity.includes("SHOP_01"),"city security metadata must cover canonical shops");
const investigationRuntime=fs.readFileSync("world/investigation-system.js","utf8");
assert(investigationRuntime.includes("ESCIE_WORLD_INVESTIGATION"),"investigation runtime must expose a gameplay API");
assert(investigationRuntime.includes("CAMERA"),"investigation runtime must recognize camera reports");
assert(investigationRuntime.includes("SEARCH"),"investigation runtime must support case search");
assert(investigationRuntime.includes("TRACE"),"investigation runtime must support case tracing");
assert(investigationRuntime.includes("CLOSE"),"investigation runtime must support case closure");
const lawRuntime=fs.readFileSync("world/law-system.js","utf8");
assert(lawRuntime.includes("caseFiles"),"law system must persist investigation cases");
assert(lawRuntime.includes("reportCrime"),"law system must accept delayed witness/camera reports");
console.log("ESCIE witness/camera investigation contracts OK");

console.log("ESCIE file-based world ownership contracts OK");


console.log("ESCIE public index hierarchy and compact accordion contracts OK");

assert(world3dRuntime.includes("const pool=interiorMode?interiorActors:actors"),"NPC interaction must route to interior occupants while inside a building");
assert(world3dRuntime.includes("!a.userData.canonical||!a.visible"),"NPC interaction must ignore hidden interior occupants");
console.log("ESCIE interior NPC interaction routing OK");

assert(world3dRuntime.includes('g.userData.doorTransition=crossing?"ROOM_TRANSIT":"WALK"'),"interior NPC movement must expose physical room transitions");
assert(world3dRuntime.includes('g.userData.doorTransition="ARRIVED"'),"interior NPCs must mark arrival into the destination room");
assert(world3dRuntime.includes("const gateBlocked=(x,z)=>"),"interior room movement must pass through a physical corridor gate");
console.log("ESCIE physical interior room transitions OK");

assert(world3dRuntime.includes("function updateHostileNPCs(now)"),"3D gameplay must include active hostile NPC AI");
assert(world3dRuntime.includes('a.userData.combatState="CHASING"'),"hostile NPCs must chase the player");
assert(world3dRuntime.includes('sim?.applyDamage?.(damage,"NPC_ATTACK")'),"hostile NPCs must be able to damage the player");
assert(world3dRuntime.includes('a.userData.combatState="ATTACKING"'),"hostile NPCs must enter an attacking state");
console.log("ESCIE active NPC combat gameplay OK");

assert(world3dRuntime.includes('api?.favor?.(best.id,"FAVOR")'),"3D NPC encounters must support favors");
assert(world3dRuntime.includes("api?.jobOffer?.(best.id)"),"3D NPC encounters must surface playable jobs");
assert(world3dRuntime.includes("api?.jobAccept?.(best.id)"),"3D NPC jobs must be completable from gameplay");
assert(world3dRuntime.includes("interactionCooldown"),"NPC rewards must have an interaction cooldown");
console.log("ESCIE NPC job/favor gameplay OK");

assert(simRuntime.includes("const commitCrime="), "simulation must expose systemic crime consequences");
assert(/const kind=night\?"BURGLARY":\(interior==="SHOP"\?"ROBBERY":null\)/.test(world3dRuntime)&&world3dRuntime.includes('commitCrime?.("BURGLARY"')&&world3dRuntime.includes('commitCrime?.("ROBBERY"'), "3D world must support burglary and robbery crime types");
assert(world3dRuntime.includes("commitCrime?.(\"ASSAULT\""), "3D combat must record assault crime");
assert(world3dRuntime.includes("commitCrime?.(\"VEHICLE_THEFT\""), "vehicle theft must record crime");
assert(simRuntime.includes("const crimeJobAccept="), "simulation must support multi-step crime jobs");
assert(simRuntime.includes("const crimeJobProgress="), "crime jobs must have physical progression steps");
assert(world3dRuntime.includes("function crimeInteract()"), "3D world must expose physical crime entry");
assert(world3dRuntime.includes("crimeJobProgress?.(\"TAKE\""), "crime interiors must support physical loot taking");
assert(world3dRuntime.includes("crimeJobProgress?.(\"ESCAPE\""), "crime exits must progress the heist");
assert(simRuntime.includes("ROBBERY:{id:\"ROBBERY\""), "crime jobs must include robbery");
assert(world3dRuntime.includes('const kind=night?"BURGLARY":(interior==="SHOP"?"ROBBERY":null)'), "3D crime must distinguish burglary and daytime robbery");
assert(world3dRuntime.includes('commitCrime?.("ROBBERY"'), "robbery must create a systemic crime record");
assert(lawRuntime.includes("caseFiles"), "law system must maintain crime case files");
assert(lawRuntime.includes("reportCrime"), "law system must expose crime reporting");
assert(lawRuntime.includes("sim.change({wanted:-Number(st.wanted||0)})"), "arrest must clear wanted state after sentencing");