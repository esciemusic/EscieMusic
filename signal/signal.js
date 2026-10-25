/*
 * ESCIE SIGNAL ENGINE
 *
 * Signals are public-facing changes in the site's state or presentation.
 * The engine coordinates signal components; it does not invent ESCIE
 * material or establish canon.
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
    payload: null
  },

  emit(input = {}) {
    this.current = {
      level: typeof input.level === "number" ? input.level : 0,
      active: true,
      type: input.type || null,
      payload: input.payload ?? null
    };

    return this.current;
  },

  clear() {
    this.current = {
      level: 0,
      active: false,
      type: null,
      payload: null
    };

    return this.current;
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_SIGNAL_ENGINE = ESCIE_SIGNAL_ENGINE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SIGNAL_ENGINE;
}
