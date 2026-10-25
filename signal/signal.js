/*
 * ESCIE SIGNAL ENGINE
 *
 * Signals are public-facing changes in the site's state or presentation.
 * The engine coordinates signal components; it does not invent ESCIE
 * material, evidence, meaning, or canon.
 */

const ESCIE_SIGNAL_ENGINE = {
  levels: Object.freeze({
    QUIET: 0,
    DISTURBANCE: 1,
    FRAGMENT: 2,
    TRANSMISSION: 3,
    EVENT: 4
  }),

  current: {
    level: 0,
    active: false,
    type: null,
    payload: null,
    sourceId: null,
    recordIds: [],
    startedAt: null
  },

  isValidLevel(level) {
    return Number.isInteger(level) && level >= 0 && level <= 4;
  },

  emit(input = {}) {
    const level = this.isValidLevel(input.level) ? input.level : 0;

    this.current = {
      level,
      active: true,
      type: input.type || null,
      payload: input.payload ?? null,
      sourceId: input.sourceId || null,
      recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : [],
      startedAt: input.startedAt || new Date().toISOString()
    };

    if (typeof window !== "undefined" && window.ESCIE_EVENTS) {
      window.ESCIE_EVENTS.emit("signal:emitted", this.current);
    }

    return this.current;
  },

  clear() {
    const previous = this.current;

    this.current = {
      level: this.levels.QUIET,
      active: false,
      type: null,
      payload: null,
      sourceId: null,
      recordIds: [],
      startedAt: null
    };

    if (typeof window !== "undefined" && window.ESCIE_EVENTS) {
      window.ESCIE_EVENTS.emit("signal:cleared", { previous });
    }

    return this.current;
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_SIGNAL_ENGINE = ESCIE_SIGNAL_ENGINE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SIGNAL_ENGINE;
}
