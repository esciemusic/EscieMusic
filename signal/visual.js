/*
 * ESCIE SIGNAL — VISUAL
 *
 * Visual signal state describes how the interface may respond to a signal.
 * Rendering belongs to the UI layer.
 *
 * Effects are presentation instructions, not invented story content.
 */

const ESCIE_SIGNAL_VISUAL = {
  effects: Object.freeze([
    "darkness",
    "film_grain",
    "frame_tear",
    "typography_shift",
    "blackout",
    "image_fragment",
    "static"
  ]),

  isValidEffect(effect) {
    return this.effects.includes(effect);
  },

  create(input = {}) {
    const effect = this.isValidEffect(input.effect) ? input.effect : null;

    return {
      effect,
      intensity: Math.max(
        0,
        Math.min(1, typeof input.intensity === "number" ? input.intensity : 0)
      ),
      duration: Math.max(
        0,
        typeof input.duration === "number" ? input.duration : 0
      ),
      sourceId: input.sourceId || null,
      recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : []
    };
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_SIGNAL_VISUAL = ESCIE_SIGNAL_VISUAL;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SIGNAL_VISUAL;
}
