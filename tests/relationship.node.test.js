const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../relationship.js");

test("THE WEB rejects unsupported inverse types without mutation", () => {
  const relationship = R.create({
    id: "directional-relationship",
    type: "inspired_by",
    from: "art-a",
    to: "art-b"
  });

  assert.equal(relationship.valid, true);
  assert.equal(R.invert(relationship.relationship), null);
});

test("THE WEB preserves registered inverse traversal", () => {
  const relationship = R.create({
    id: "supported-inverse",
    type: "created",
    from: "person-a",
    to: "art-a"
  });

  const inverse = R.invert(relationship.relationship);

  assert.ok(inverse);
  assert.equal(inverse.type, "created_by");
  assert.equal(inverse.from, "art-a");
  assert.equal(inverse.to, "person-a");
});

test("THE WEB does not confuse public disclosure with canon", () => {
  const provisional = R.create({
    id: "provisional-public",
    type: "collaborated_with",
    from: "person-a",
    to: "person-b",
    canonical_status: "provisional",
    visibility: "public",
    public_disclosure: true
  });

  assert.equal(provisional.valid, true);
  assert.equal(R.isPublic(provisional.relationship), true);
  assert.equal(R.isCanonical(provisional.relationship), false);
});

test("THE WEB blocks canonical relationships from non-public lifecycle states", () => {
  const invalid = R.create({
    id: "invalid-canonical",
    type: "collaborated_with",
    from: "person-a",
    to: "person-b",
    canonical_status: "canonical",
    status: "proposed"
  });

  assert.equal(invalid.valid, false);
});
