/*
 * ESCIE SIGNAL — TRANSMISSION
 *
 * A transmission packages an intentional signal event for presentation.
 * It may reference existing records, fragments, audio, visuals, or sources.
 *
 * A transmission cannot manufacture evidence, canon, or meaning.
 */

const TRANSMISSION_LEVELS = Object.freeze({
  QUIET: 0,
  DISTURBANCE: 1,
  FRAGMENT: 2,
  TRANSMISSION: 3,
  EVENT: 4
});

function createTransmission(input = {}) {
  const level = Number.isInteger(input.level) && input.level >= 0 && input.level <= 4
    ? input.level
    : TRANSMISSION_LEVELS.QUIET;

  return {
    id: input.id || null,
    level,
    type: input.type || null,
    sourceId: input.sourceId || null,
    recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : [],
    visual: input.visual || null,
    audio: input.audio || null,
    duration: Math.max(
      0,
      typeof input.duration === "number" ? input.duration : 0
    ),
    createdAt: input.createdAt || new Date().toISOString()
  };
}

const ESCIE_TRANSMISSION = {
  levels: TRANSMISSION_LEVELS,
  create: createTransmission
};

if (typeof window !== "undefined") {
  window.ESCIE_TRANSMISSION = ESCIE_TRANSMISSION;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_TRANSMISSION;
}
