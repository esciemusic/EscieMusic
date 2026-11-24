const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const desktop = path.join(root, "world", "desktop");

test("desktop packaging uses a staged game boundary", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(desktop, "package.json"), "utf8"));
  const stage = fs.readFileSync(path.join(desktop, "stage.cjs"), "utf8");
  const main = fs.readFileSync(path.join(desktop, "main.cjs"), "utf8");

  assert.match(pkg.scripts["package:win"], /npm run stage/);
  assert.deepEqual(pkg.build.files, ["app/**/*", "main.cjs", "preload.cjs", "package.json"]);
  assert.match(stage, /fs\.cpSync/);
  assert.match(stage, /!rel\.startsWith\("desktop"\)/);
  assert.match(main, /app.isPackaged/);
  assert.match(main, /path\.join\(__dirname, "app", "index\.html"\)/);
});

test("desktop build manifest stays aligned with the game source", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(desktop, "build-config.json"), "utf8"));
  assert.equal(manifest.source.entry, "../index.html");
  assert.equal(manifest.source.simulation, "../world-simulation.js");
  assert.equal(manifest.source.presentation, "../3d-reality.js");
  assert.equal(manifest.boundaries.publicSite, "doorway-only");
  assert.equal(manifest.boundaries.gameState, "local-first");
});
