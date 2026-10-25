/*
 * ESCIE BRAIN
 *
 * The Brain coordinates observation, understanding, memory, reasoning,
 * questioning, verification, and action.
 *
 * It may analyze and propose. It does not become ESCIE's creative will
 * and cannot silently establish canon, meaning, relationships, evidence,
 * or disclosure.
 */

const ESCIE_BRAIN = {
  version: "0.1.0",

  abilities: Object.freeze([
    "SEE",
    "KNOW",
    "REMEMBER",
    "CONNECT",
    "QUESTION",
    "DECIDE",
    "ACT"
  ]),

  autonomy: Object.freeze({
    A0: "observe",
    A1: "report",
    A2: "recommend",
    A3: "prepare",
    A4: "auto-repair-deterministic-reversible",
    A5: "human-authorization-required",
    A6: "never-automate-meaning"
  }),

  status: "idle",

  observe(input = {}) {
    return {
      type: "observation",
      input,
      timestamp: new Date().toISOString()
    };
  },

  propose(input = {}) {
    const proposal = {
      type: "proposal",
      input,
      requiresReview: true,
      timestamp: new Date().toISOString()
    };

    const control = typeof window !== "undefined"
      ? window.ESCIE_CONTROL
      : null;

    if (control && typeof control.add === "function") {
      control.add({
        id: input.id || null,
        category: input.category || "REVIEW",
        title: input.title || "Brain proposal requires attention",
        reason: input.reason || "The Brain prepared a proposal for human review.",
        sourceIds: Array.isArray(input.sourceIds) ? input.sourceIds : [],
        recordIds: Array.isArray(input.recordIds) ? input.recordIds : [],
        suggestedAction: input.suggestedAction || input.action || null,
        urgency: input.urgency || "normal"
      });
    }

    return proposal;
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_BRAIN = ESCIE_BRAIN;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_BRAIN;
}
