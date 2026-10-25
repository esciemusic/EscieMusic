/*
 * ESCIE SIGNAL — AUDIO
 *
 * Audio signal state describes possible sonic responses.
 * It references existing material rather than inventing audio content.
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

  create(input = {}) {
    return {
      effect: input.effect || null,
      sourceId: input.sourceId || null,
      volume: typeof input.volume === "number" ? input.volume : 1,
      duration: typeof input.duration === "number" ? input.duration : 0
    };
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_SIGNAL_AUDIO = ESCIE_SIGNAL_AUDIO;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SIGNAL_AUDIO;
}
