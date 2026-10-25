/*
 * ESCIE SIGNAL — COUNTDOWN
 *
 * Countdown state is a temporal presentation layer.
 * It measures time toward a configured event without creating the event.
 */

const ESCIE_COUNTDOWN = {
  target: null,

  configure(target) {
    this.target = target ? new Date(target) : null;
    return this.target;
  },

  remaining(now = new Date()) {
    if (!this.target || Number.isNaN(this.target.getTime())) {
      return null;
    }

    return Math.max(0, this.target.getTime() - new Date(now).getTime());
  },

  expired(now = new Date()) {
    const remaining = this.remaining(now);
    return remaining !== null && remaining <= 0;
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_COUNTDOWN = ESCIE_COUNTDOWN;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_COUNTDOWN;
}
