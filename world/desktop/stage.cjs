const fs = require("node:fs");
const path = require("node:path");

const desktop = __dirname;
const source = path.resolve(desktop, "..");
const target = path.join(desktop, "app");

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(source, src);
    return !rel.startsWith("desktop") &&
      !rel.startsWith("node_modules") &&
      !rel.startsWith(".git") &&
      !rel.startsWith("dist");
  }
});

const threeSource = path.join(desktop, "node_modules", "three", "build", "three.min.js");
const threeTargetDir = path.join(target, "vendor");
const threeTarget = path.join(threeTargetDir, "three.min.js");
if (!fs.existsSync(threeSource)) {
  throw new Error("MISSING_THREE_RUNTIME:"+threeSource);
}
fs.mkdirSync(threeTargetDir, { recursive: true });
fs.copyFileSync(threeSource, threeTarget);
if (!fs.existsSync(threeTarget) || fs.statSync(threeTarget).size < 100000) {
  throw new Error("INVALID_THREE_RUNTIME:"+threeTarget);
}

console.log("Staged ESCIE World game source:", target);
console.log("Staged offline Three.js runtime:", threeTarget);
