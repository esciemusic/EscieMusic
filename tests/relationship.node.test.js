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

test("THE WEB inverse vocabulary is internally closed", () => {
  for (const type of Object.keys(R.INVERSE_TYPES)) {
    const inverse = R.INVERSE_TYPES[type];
    assert.equal(R.isType(type), true, `inverse source must be registered: ${type}`);
    assert.equal(R.isType(inverse), true, `inverse target must be registered: ${inverse}`);
  }
});

test("THE WEB public view strips private editorial metadata", () => {
  const source = R.create({
    id: "public-safe-view",
    type: "collaborated_with",
    from: "person-a",
    to: "person-b",
    visibility: "public",
    public_disclosure: true,
    basis: "internal research",
    source_reference: "private-source",
    evidence: [{ id: "private-evidence" }],
    history: [{ action: "private-history" }],
    created_by: "private-user",
    modified_by: "private-user"
  });

  assert.equal(source.valid, true);
  const view = R.toPublicView(source.relationship);
  assert.ok(view);
  for (const field of ["basis","source","evidence","history","created_by","modified_by"]) {
    assert.equal(Object.prototype.hasOwnProperty.call(view, field), false, `public view must exclude ${field}`);
  }
});

test("THE WEB inversion is a view and does not mutate the source", () => {
  const source = R.create({
    id: "non-mutating-inverse",
    type: "created",
    from: "person-a",
    to: "art-a",
    history: [{ action: "created" }]
  });

  const before = JSON.stringify(source.relationship);
  const inverse = R.invert(source.relationship);

  assert.ok(inverse);
  assert.equal(JSON.stringify(source.relationship), before);
  assert.notEqual(inverse.id, source.relationship.id);
  assert.deepEqual(inverse.history, source.relationship.history);
});

test("THE WEB disclosure is explicit opt-in", () => {
  const relationship = R.create({
    id: "disclosure-opt-in",
    type: "collaborated_with",
    from: "person-a",
    to: "person-b",
    visibility: "public"
  });

  assert.equal(relationship.valid, true);
  assert.equal(relationship.relationship.public_disclosure, null);
  assert.equal(R.canDisclose(relationship.relationship), false);
  assert.equal(R.toPublicView(relationship.relationship), null);
});
