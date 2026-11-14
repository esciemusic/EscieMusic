/*
 * ESCIE UI — ROUTER
 *
 * Routes public navigation without coupling routes to content storage.
 * Navigation changes presentation state; it does not alter canon.
 */

const ESCIE_UI_ROUTER = {
  current: null,
  routes: new Map(),

  register(path, handler) {
    if (!path) return false;
    this.routes.set(path, typeof handler === "function" ? handler : null);
    return true;
  },

  resolve(path) {
    if (!path) return null;
    const raw = String(path);
    if (this.routes.has(raw)) return raw;
    const normalized = raw.charAt(0) === "#" ? raw.slice(1) : raw;
    if (this.routes.has(normalized)) return normalized;
    const aliases = { work: "art", archive: "archives", cases: "investigation" };
    // Art category deep links are presentation routes into the ART section.
    // The carousel owns the category state; the shared router only resolves the section.
    if (/^art\\/(music|words|visual|projects)$/i.test(normalized) && this.routes.has("art")) return "art";
    const alias = aliases[normalized];
    return alias && this.routes.has(alias) ? alias : null;
  },

  navigate(path) {
    const resolved = this.resolve(path);
    if (!resolved) return false;

    this.current = resolved;
    const handler = this.routes.get(resolved);

    if (handler) handler(resolved);

    if (typeof window !== "undefined" && window.ESCIE_EVENTS) {
      window.ESCIE_EVENTS.emit("ui:navigate", { route: resolved });
    }

    return resolved;
  }
};

if (typeof window !== "undefined") window.ESCIE_UI_ROUTER = ESCIE_UI_ROUTER;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_UI_ROUTER;
