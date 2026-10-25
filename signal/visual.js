/*
 * ESCIE SIGNAL — VISUAL
 *
 * Visual signal state describes how the interface may respond to a signal.
 * Rendering belongs to the UI layer.
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

  create(input = {}) {
    return {
      effect: input.effect || null,
      intensity: typeof input.intensity === "number" ? input.intensity : 0,
      duration: typeof input.duration === "number" ? input.duration : 0,
      sourceId: input.sourceId || null
    };
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_SIGNAL_VISUAL = ESCIE_SIGNAL_VISUAL;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SIGNAL_VISUAL;
}
