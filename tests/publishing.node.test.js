const build = require("../publishing/build.js");
const validate = require("../publishing/validate.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const publicRecords = build.buildPublicRecords([
  { id: "public-a", type: "art", title: "Public A", published: true, visibility: "public" },
  { id: "private-a", type: "art", title: "Private A", published: true, visibility: "private" },
  { id: "limited-a", type: "art", title: "Limited A", published: true, visibility: "limited" },
  { id: "draft-a", type: "art", title: "Draft A", published: false, visibility: "public" },
  { id: "implicit-a", type: "art", title: "Implicit A", visibility: "public" }
]);

assert(publicRecords.length === 1, "Public build filtering failed.");
assert(publicRecords[0].id === "public-a", "Unexpected non-public record survived filtering.");

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

let duplicateBuildRejected = false;
try {
  build.createBuildPlan({
    records: [
      { id: "duplicate-source", type: "art", title: "One", published: true, visibility: "public" },
      { id: "duplicate-source", type: "art", title: "Two", published: true, visibility: "public" }
    ]
  });
} catch (error) {
  duplicateBuildRejected = /Duplicate public record id: duplicate-source/.test(String(error && error.message));
}

assert(duplicateBuildRejected, "Build planning must reject duplicate public record ids before deduplication.");

const privateDuplicatePlan = build.createBuildPlan({
  records: [
    { id: "private-duplicate", type: "art", title: "Private One", published: true, visibility: "private" },
    { id: "private-duplicate", type: "art", title: "Private Two", published: true, visibility: "private" },
    { id: "public-a", type: "art", title: "Public A", published: true, visibility: "public" }
  ]
});

assert(
  privateDuplicatePlan.records.length === 1 &&
  privateDuplicatePlan.records[0].id === "public-a",
  "Non-public duplicate ids must not block the public build."
);

console.log("ESCIE publishing contracts OK");
