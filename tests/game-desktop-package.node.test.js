const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const desktop = path.join(root, "world", "desktop");

test("desktop game package has a secure Electron shell", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(desktop, "package.json"), "utf8"));
  const main = fs.readFileSync(path.join(desktop, "main.cjs"), "utf8");
  const preload = fs.readFileSync(path.join(desktop, "preload.cjs"), "utf8");

  assert.equal(pkg.name, "escie-world");
  assert.equal(pkg.main, "main.cjs");
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /fullscreen:\s*true/);
  assert.match(main, /world[\\/]index\.html/);
  assert.match(preload, /contextBridge\.exposeInMainWorld/);
});

test("desktop package preserves the canonical game source boundary", () => {
  const readme = fs.readFileSync(path.join(desktop, "README.md"), "utf8");
  assert.match(readme, /world\/world\.js/);
  assert.match(readme, /world\/world-simulation\.js/);
  assert.match(readme, /world\/3d-reality\.js/);
  assert.match(readme, /public site remains the doorway/i);
});
