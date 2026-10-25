/*
 * ESCIE CORE EVENTS
 *
 * Events are structured notifications between system boundaries.
 * They communicate change; they do not establish canon by themselves.
 *
 * Consumers may subscribe to events without coupling themselves directly
 * to the subsystem that produced them.
 */

const ESCIE_EVENTS = {
  listeners: new Map(),

  on(type, handler) {
    if (typeof type !== "string" || typeof handler !== "function") {
      return () => {};
    }

    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type).add(handler);

    return () => this.off(type, handler);
  },

  off(type, handler) {
    const handlers = this.listeners.get(type);

    if (!handlers) {
      return;
    }

    handlers.delete(handler);

    if (handlers.size === 0) {
      this.listeners.delete(type);
    }
  },

  emit(type, detail = {}) {
    const handlers = this.listeners.get(type);

    if (!handlers) {
      return;
    }

    for (const handler of [...handlers]) {
      try {
        handler(detail);
      } catch (error) {
        if (typeof console !== "undefined") {
          console.error("ESCIE event handler failed:", error);
        }
      }
    }
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_EVENTS = ESCIE_EVENTS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_EVENTS;
}
