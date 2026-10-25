/*
 * ESCIE SIGNAL — COUNTDOWN
 *
 * Countdown state is a temporal presentation layer.
 * It measures time toward a configured event without creating the event.
 *
 * The countdown may be configured later for the public threshold:
 * October 31, 2026 -> November 22, 2026.
 */

const ESCIE_COUNTDOWN = {
  target: null,

  configure(target) {
    const date = target ? new Date(target) : null;

    if (date && Number.isNaN(date.getTime())) {
      throw new Error("Invalid countdown target.");
    }

    this.target = date;
    return this.target;
  },

  remaining(now = new Date()) {
    if (!this.target) {
      return null;
    }

    const current = new Date(now);

    if (Number.isNaN(current.getTime())) {
      return null;
    }

    return Math.max(0, this.target.getTime() - current.getTime());
  },

  expired(now = new Date()) {
    const remaining = this.remaining(now);
    return remaining !== null && remaining <= 0;
  },

  parts(now = new Date()) {
    const milliseconds = this.remaining(now);

    if (milliseconds === null) {
      return null;
    }

    const totalSeconds = Math.floor(milliseconds / 1000);

    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      milliseconds: milliseconds % 1000
    };
  },

  display(now = new Date()) {
    const parts = this.parts(now);

    if (!parts) {
      return null;
    }

    return [
      String(parts.days).padStart(2, "0"),
      String(parts.hours).padStart(2, "0"),
      String(parts.minutes).padStart(2, "0"),
      String(parts.seconds).padStart(2, "0")
    ].join(":");
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_COUNTDOWN = ESCIE_COUNTDOWN;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_COUNTDOWN;
}
