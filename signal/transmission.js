/*
 * ESCIE SIGNAL — TRANSMISSION
 *
 * A transmission packages an intentional signal event for presentation.
 * It may reference existing records, fragments, audio, visuals, or sources.
 *
 * A transmission cannot manufacture evidence or meaning.
 */

function createTransmission(input = {}) {
  return {
    id: input.id || null,
    level: typeof input.level === "number" ? input.level : 0,
    type: input.type || null,
    sourceId: input.sourceId || null,
    recordIds: Array.isArray(input.recordIds) ? [...input.recordIds] : [],
    visual: input.visual || null,
    audio: input.audio || null,
    duration: typeof input.duration === "number" ? input.duration : 0,
    createdAt: input.createdAt || new Date().toISOString()
  };
}

if (typeof window !== "undefined") {
  window.ESCIE_TRANSMISSION = {
    create: createTransmission
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = createTransmission;
}
