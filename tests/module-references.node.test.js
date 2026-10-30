const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)].map((match) => match[1]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const appIndex = scripts.indexOf("app.js");
const gameIndex = scripts.indexOf("data/games.js");
assert(appIndex >= 0, "app.js must be loaded");
assert(gameIndex >= 0, "data/games.js must be loaded");

const providers = new Map();

scripts.forEach((src, index) => {
  const content = fs.readFileSync(src, "utf8");
  const exports = [
    ...[...content.matchAll(/(?:window|root)\.(ESCIE_[A-Z0-9_]+)\s*=/g)].map((match) => match[1]),
    ...[...content.matchAll(/(?:^|\n)\s*(?:function\s+|(?:const|let|var)\s+)(normalizeEscieSocial|auditEscieSocial|normalizeEscieVisuals|auditEscieVisuals)\b/g)].map((match) => match[1])
  ];

  exports.forEach((name) => {
    if (!providers.has(name)) {
      providers.set(name, { src, index });
    }
  });
});

const app = fs.readFileSync("app.js", "utf8");
const referenced = new Set([
  ...[...app.matchAll(/getGlobal\("([^"]+)"/g)].map((match) => match[1]),
  ...[...app.matchAll(/window\.(ESCIE_[A-Z0-9_]+)/g)].map((match) => match[1])
]);

const internal = new Set([
  "ESCIE_RUNTIME",
  "ESCIE_TEST_RUNNER"
]);

const missing = [];
const late = [];

referenced.forEach((name) => {
  if (internal.has(name)) return;

  const provider = providers.get(name);

  if (!provider) {
    missing.push(name);
    return;
  }

  if (name === "ESCIE_GAME_REGISTRY" && provider.index >= appIndex) {
    late.push(name + " <- " + provider.src);
    return;
  }

  if (provider.index >= appIndex) {
    late.push(name + " <- " + provider.src);
  }
});

assert(missing.length === 0, "app.js references globals with no loaded provider: " + missing.join(", "));
assert(late.length === 0, "app.js references globals loaded after app.js: " + late.join(", "));

console.log("ESCIE app module-reference contracts OK");
