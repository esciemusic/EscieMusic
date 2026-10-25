/*
 * ESCIE CORE STATE
 *
 * Runtime state is transient system state.
 * It is not canonical content and must never silently become canon.
 */

const ESCIE_STATE_STATUS = Object.freeze({
  INITIALIZING: "initializing",
  READYING: "readying",
  READY: "ready",
  ERROR: "error"
});

const ESCIE_STATE = {
  status: ESCIE_STATE_STATUS.INITIALIZING,
  route: null,
  language: "en",
  activeRecordId: null,
  activeProjectId: null,
  activeSignalId: null,
  transmissionLevel: 0,
  initializedAt: null
};

const ESCIE_STATE_API = {
  STATUS: ESCIE_STATE_STATUS,

  validate(state = ESCIE_STATE) {
    const errors = [];

    if (!Object.values(ESCIE_STATE_STATUS).includes(state.status)) {
      errors.push("Invalid runtime state status.");
    }

    if (state.language && !["en", "fr", "es"].includes(state.language)) {
      errors.push("Invalid runtime language.");
    }

    if (
      !Number.isInteger(state.transmissionLevel) ||
      state.transmissionLevel < 0 ||
      state.transmissionLevel > 4
    ) {
      errors.push("Invalid transmission level.");
    }

    return { valid: errors.length === 0, errors };
  },

  setStatus(status) {
    if (!Object.values(ESCIE_STATE_STATUS).includes(status)) return false;
    ESCIE_STATE.status = status;
    return true;
  },

  reset() {
    ESCIE_STATE.status = ESCIE_STATE_STATUS.INITIALIZING;
    ESCIE_STATE.route = null;
    ESCIE_STATE.language = "en";
    ESCIE_STATE.activeRecordId = null;
    ESCIE_STATE.activeProjectId = null;
    ESCIE_STATE.activeSignalId = null;
    ESCIE_STATE.transmissionLevel = 0;
    ESCIE_STATE.initializedAt = null;
    return ESCIE_STATE;
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_STATE = ESCIE_STATE;
  window.ESCIE_STATE_API = ESCIE_STATE_API;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_STATE;
  module.exports.API = ESCIE_STATE_API;
  module.exports.STATUS = ESCIE_STATE_STATUS;
  module.exports.validate = ESCIE_STATE_API.validate;
  module.exports.setStatus = ESCIE_STATE_API.setStatus;
  module.exports.reset = ESCIE_STATE_API.reset;
}
