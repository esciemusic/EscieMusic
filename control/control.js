/*
 * ESCIE CONTROL
 *
 * Human-facing attention filter.
 *
 * The Control layer turns meaningful system findings into actionable
 * attention for ESCIE. Automation may prepare work, but Control does not
 * grant itself authority to decide what ESCIE means.
 */

const ESCIE_CONTROL = {
  categories: Object.freeze([
    "CREATE",
    "RESPOND",
    "DECIDE",
    "FIX",
    "REVIEW"
  ]),

  items: [],

  add(input = {}) {
    const item = {
      id: input.id || null,
      category: input.category || "REVIEW",
      title: input.title || "Untitled attention item",
      reason: input.reason || null,
      sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
      recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : [],
      suggestedAction: input.suggestedAction || null,
      urgency: input.urgency || "normal",
      status: input.status || "open",
      createdAt: input.createdAt || new Date().toISOString()
    };

    this.items.push(item);

    if (typeof window !== "undefined" &&
        window.ESCIE_EVENTS &&
        typeof window.ESCIE_EVENTS.emit === "function") {
      window.ESCIE_EVENTS.emit("control:item-added", { item });
    }

    return item;
  },

  resolve(id, status = "resolved", metadata = {}) {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) return null;

    item.status = status;
    item.resolvedAt = new Date().toISOString();
    item.resolution = metadata || null;

    if (typeof window !== "undefined" &&
        window.ESCIE_EVENTS &&
        typeof window.ESCIE_EVENTS.emit === "function") {
      window.ESCIE_EVENTS.emit("control:item-resolved", { item });
    }

    return item;
  },

  pending() {
    return this.items.filter((item) => item.status === "open");
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_CONTROL = ESCIE_CONTROL;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_CONTROL;
}
