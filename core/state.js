/*
 * ESCIE CORE STATE
 *
 * Runtime state is transient system state.
 * It is not canonical content and must never silently become canon.
 *
 * Persistent reality belongs in records, relationships, decisions,
 * permissions, sources, and history.
 */

const ESCIE_STATE = {
  status: "initializing",
  route: null,
  language: "en",
  activeRecordId: null,
  activeProjectId: null,
  activeSignalId: null,
  transmissionLevel: 0,
  initializedAt: null
};

if (typeof window !== "undefined") {
  window.ESCIE_STATE = ESCIE_STATE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_STATE;
}
