const assert = require("assert");
const normalize = require("../ingestion/normalize.js");
const match = require("../ingestion/match.js");
const deduplicate = require("../ingestion/deduplicate.js");
const ingestion = require("../ingestion/ingestion.js");

const normalized = normalize({
  id: "input-1",
  sourceId: "source-1",
  type: "art",
  title: "  Test Art  ",
  description: "  Description  "
});

assert.strictEqual(normalized.title, "Test Art");
assert.strictEqual(normalized.description, "Description");

const matches = match(
  { title: "  Test Art " },
  [{ id: "record-1", title: "test art" }, { id: "record-2", title: "other" }]
);

assert.strictEqual(matches.length, 1);
assert.strictEqual(matches[0].recordId, "record-1");
assert.strictEqual(matches[0].confidence, "strongly_supported");

const duplicates = deduplicate([
  { id: "a" },
  { id: "b" },
  { id: "a" }
]);

assert.strictEqual(duplicates.length, 1);
assert.strictEqual(duplicates[0].firstIndex, 0);
assert.strictEqual(duplicates[0].duplicateIndex, 2);

const received = ingestion.receive({
  id: "ingest-1",
  sourceId: "source-1",
  type: "art",
  payload: { test: true }
});

assert.strictEqual(received.status, "received");
assert.ok(ingestion.pending().some((item) => item.id === "ingest-1"));

console.log("ESCIE ingestion contracts OK");
