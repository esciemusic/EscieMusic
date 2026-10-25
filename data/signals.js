/*
 * ESCIE SIGNAL REGISTRY
 *
 * Signals are external or internal transmission sources that can feed
 * the ESCIE interface.
 *
 * A signal describes a source/channel. It does not itself create canon,
 * relationships, evidence, or meaning.
 *
 * Individual transmissions should become records/fragments when they
 * are intentionally preserved by ESCIE.
 */

const ESCIE_SIGNALS = [];

if (typeof window !== "undefined") {
  window.ESCIE_SIGNALS = ESCIE_SIGNALS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SIGNALS;
}
