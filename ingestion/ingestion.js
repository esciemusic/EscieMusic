/*
 * ESCIE INGESTION
 *
 * Entry point for material entering the ESCIE system.
 * Ingestion receives material; it does not decide what that material means.
 *
 * Flow:
 * RECEIVE → NORMALIZE → VALIDATE → REGISTRY → RELEASE → UI
 */

const ESCIE_INGESTION = {
  queue: [],

  receive(input = {}) {
    const item = {
      id: input.id || null,
      sourceId: input.sourceId || null,
      type: input.type || "unknown",
      payload: input.payload ?? null,
      media: Array.isArray(input.media) ? input.media : null,
      metadata:
        input.metadata && typeof input.metadata === "object"
          ? { ...input.metadata }
          : {},
      receivedAt: input.receivedAt || new Date().toISOString(),
      status: "received",
      normalized: null
    };

    this.queue.push(item);
    return item;
  },

  normalize(item) {
    if (!item || typeof item !== "object") return null;

    const normalizer =
      typeof window !== "undefined" ? window.ESCIE_NORMALIZE : null;

    if (typeof normalizer !== "function") return null;

    const normalized = normalizer(item);
    item.normalized = normalized;
    item.status = "normalized";
    return normalized;
  },

  normalizePending() {
    return this.queue
      .filter((item) => item.status === "received")
      .map((item) => this.normalize(item))
      .filter(Boolean);
  },

  pending() {
    return this.queue.filter((item) => item.status === "received");
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_INGESTION = ESCIE_INGESTION;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_INGESTION;
}
