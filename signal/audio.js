/*
 * ESCIE SIGNAL — AUDIO
 *
 * Audio signal state describes possible sonic responses.
 * It references existing material rather than inventing audio content.
 *
 * Playback belongs to the UI/media layer.
 */

const ESCIE_SIGNAL_AUDIO = {
  effects: Object.freeze([
    "click",
    "tape_stop",
    "voice_fragment",
    "shutter",
    "room_tone",
    "single_note",
    "static",
    "silence"
  ]),

  isValidEffect(effect) {
    return this.effects.includes(effect);
  },

  create(input = {}) {
    const effect = this.isValidEffect(input.effect) ? input.effect : null;

    return {
      effect,
      sourceId: input.sourceId || null,
      recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : [],
      volume: Math.max(
        0,
        Math.min(1, typeof input.volume === "number" ? input.volume : 1)
      ),
      duration: Math.max(
        0,
        typeof input.duration === "number" ? input.duration : 0
      )
    };
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_SIGNAL_AUDIO = ESCIE_SIGNAL_AUDIO;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SIGNAL_AUDIO;
}
