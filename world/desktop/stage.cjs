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

console.log("Staged ESCIE World game source:", target);
