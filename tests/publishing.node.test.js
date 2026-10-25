const build = require("../publishing/build.js");
const validate = require("../publishing/validate.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const publicRecords = build.buildPublicRecords([
  { id: "public-a", type: "art", title: "Public A", published: true, visibility: "public" },
  { id: "private-a", type: "art", title: "Private A", published: true, visibility: "private" },
  { id: "draft-a", type: "art", title: "Draft A", published: false, visibility: "public" }
]);

assert(publicRecords.length === 1, "Public build filtering failed.");
assert(publicRecords[0].id === "public-a", "Unexpected public record survived filtering.");

const duplicateBuild = {
  records: [
    { id: "duplicate-a", data: { id: "duplicate-a", type: "art", title: "One", published: true, visibility: "public" } },
    { id: "duplicate-a", data: { id: "duplicate-a", type: "art", title: "Two", published: true, visibility: "public" } }
  ]
};

const duplicateValidation = validate.validateBuild(duplicateBuild);
assert(!duplicateValidation.valid, "Duplicate public IDs must fail validation.");
assert(
  duplicateValidation.errors.some((entry) =>
    Array.isArray(entry.errors) && entry.errors.includes("Duplicate public record id.")
  ),
  "Duplicate-ID validation error was not reported."
);

console.log("ESCIE publishing contracts OK");
