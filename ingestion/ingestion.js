/*
 * ESCIE INGESTION
 *
 * Entry point for material entering the ESCIE system.
 * Ingestion receives material; it does not decide what that material means.
 */

const ESCIE_INGESTION = {
  queue: [],

  receive(input = {}) {
    const item = {
      id: input.id || null,
      sourceId: input.sourceId || null,
      type: input.type || "unknown",
      payload: input.payload ?? null,
      receivedAt: input.receivedAt || new Date().toISOString(),
      status: "received"
    };

    this.queue.push(item);
    return item;
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
