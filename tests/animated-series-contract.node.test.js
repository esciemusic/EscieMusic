const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

test("animated series master bible defines the complete production architecture", () => {
  const bible = read("ANIMATED_SERIES_BIBLE.md");
  for (const term of [
    "LYRICS → STORY → EPISODES → ANIMATED SERIES",
    "WHO MADE HIM?",
    "WHAT DID HE BECOME?",
    "WHAT WILL HE MAKE?",
    "CANON",
    "INFERENCE",
    "ADAPTATION",
    "UNKNOWN",
    "CHARACTER SYSTEM",
    "LOCATION SYSTEM",
    "SYMBOL SYSTEM",
    "TIMELINE ENGINE",
    "MYSTERY ENGINE",
    "PRODUCTION PIPELINE",
    "QUALITY GATES",
    "CROSS-MEDIA RELATIONSHIP"
  ]) assert.ok(bible.includes(term), "missing series architecture: " + term);
});

test("animated series registry contains eight source slots without publishing lyric text", () => {
  const registry = require(path.join(root, "data/animated-series.js"));
  assert.equal(registry.sourceTracks.length, 8);
  assert.deepEqual(registry.canonPolicy, ["CANON","INFERENCE","ADAPTATION","UNKNOWN"]);
  for (const track of registry.sourceTracks) {
    assert.equal(track.status, "source-required");
    assert.equal(track.approvedLyricSource, null);
    assert.equal(track.title, null);
  }
});

test("series development keeps the paused game boundary explicit", () => {
  const registry = require(path.join(root, "data/animated-series.js"));
  const bible = read("ANIMATED_SERIES_BIBLE.md");
  assert.equal(registry.gameStatus, "paused");
  assert.match(bible, /game remains the playable layer and is currently paused/i);
});

test("series disclosure gate prevents accidental unreleased source publication", () => {
  const bible = read("ANIMATED_SERIES_BIBLE.md");
  const registry = read("data/animated-series.js");
  assert.match(bible, /does not publish unreleased lyric text/i);
  assert.match(registry, /No unreleased lyric text/i);
  assert.match(bible, /Unreleased music, lyrics, private case files and Central material stay private/i);
});
