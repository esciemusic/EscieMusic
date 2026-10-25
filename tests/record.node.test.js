const assert = require("assert");
global.window = {};
const record = require("../record.js");

const publicRecord = record.create({
  id: "public-art",
  type: record.TYPES.ART,
  title: "Public Art",
  visibility: record.VISIBILITY.PUBLIC,
  public_disclosure: true
});

assert.strictEqual(record.validate(publicRecord).valid, true);
assert.strictEqual(record.isPublic(publicRecord), true);

const limitedRecord = record.create({
  id: "limited-art",
  type: record.TYPES.ART,
  title: "Limited Art",
  visibility: record.VISIBILITY.LIMITED,
  public_disclosure: false
});

assert.strictEqual(record.validate(limitedRecord).valid, true);
assert.strictEqual(record.isPublic(limitedRecord), false);

const invalidType = record.create({
  id: "invalid-type",
  type: "not-a-record-type",
  title: "Invalid",
  visibility: record.VISIBILITY.PUBLIC
});

assert.strictEqual(record.validate(invalidType).valid, false);

const contradictory = record.create({
  id: "contradictory",
  type: record.TYPES.ART,
  title: "Contradictory",
  visibility: record.VISIBILITY.PRIVATE,
  public_disclosure: true
});

assert.strictEqual(record.validate(contradictory).valid, false);

console.log("ESCIE record contracts OK");
