const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

test("World keeps explicit mobile-first controls available", () => {
  const index = fs.readFileSync(path.join(root, "world", "index.html"), "utf8");
  const shell = fs.readFileSync(path.join(root, "world", "game-shell.css"), "utf8");
  const reality = fs.readFileSync(path.join(root, "world", "3d-reality.js"), "utf8");

  for (const action of ["OPEN", "FIGHT", "SPRINT", "PAUSE"]) {
    assert.match(index, new RegExp('data-mobile-action="' + action + '"'));
  }
  for (const direction of ["up", "down", "left", "right"]) {
    assert.match(index, new RegExp('data-mobile-move="' + direction + '"'));
  }
  assert.match(shell, /@media\s*\(pointer:coarse\)/);
  assert.match(shell, /env\(safe-area-inset-bottom\)/);
  assert.match(reality, /bindMobileControls/);
  assert.match(reality, /activeInputDevice\("TOUCH"\)/);
});

test("World desktop shell has an offline Three.js fallback", () => {
  const index = fs.readFileSync(path.join(root, "world", "index.html"), "utf8");
  const stage = fs.readFileSync(path.join(root, "world", "desktop", "stage.cjs"), "utf8");

  assert.match(index, /vendor\/three\.min\.js/);
  assert.match(index, /cdn\.jsdelivr\.net\/npm\/three@0\.160\.0/);
  assert.match(stage, /three\.min\.js/);
  assert.match(stage, /vendor/);
});
