const assert = require("assert");
const health = require("../core/health.js");

global.window = {
  ESCIE_RECORD: {},
  ESCIE_RELATIONSHIP: {},
  ESCIE_STATE: {},
  ESCIE_EVENTS: {},
  ESCIE_PUBLISH_BUILD: {},
  ESCIE_PUBLISH_VALIDATE: {},
  ESCIE_SEARCH_INDEX: {}
};

const result = health.check([
  "ESCIE_RECORD",
  "ESCIE_RELATIONSHIP",
  "ESCIE_STATE",
  "ESCIE_EVENTS"
]);

assert.strictEqual(result.ok, true);
assert.strictEqual(result.failed.length, 0);

const missing = health.check(["ESCIE_RECORD", "ESCIE_MISSING"]);
assert.strictEqual(missing.ok, false);
assert.strictEqual(missing.failed.length, 1);
assert.strictEqual(missing.failed[0].name, "ESCIE_MISSING");

console.log("ESCIE health contracts OK");
