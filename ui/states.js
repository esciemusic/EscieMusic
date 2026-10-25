/*
 * ESCIE UI — STATES
 *
 * Public experience states are presentation conditions.
 * They do not represent separate universes or hidden canon.
 */

const ESCIE_UI_STATES = Object.freeze({
  NORMAL: "NORMAL",
  ACTIVE_TRANSMISSION: "ACTIVE_TRANSMISSION",
  ARCHIVAL_RESURFACING: "ARCHIVAL_RESURFACING",
  INVESTIGATION_ACTIVE: "INVESTIGATION_ACTIVE",
  SILENCE: "SILENCE"
});

function isUIState(value) {
  return Object.values(ESCIE_UI_STATES).includes(value);
}

if (typeof window !== "undefined") {
  window.ESCIE_UI_STATES = ESCIE_UI_STATES;
  window.ESCIE_IS_UI_STATE = isUIState;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ESCIE_UI_STATES, isUIState };
}
