/*
 * ESCIE CORE PERMISSIONS
 *
 * Permissions define what the system is allowed to do with a record or
 * operation. They are a boundary, not a substitute for editorial judgment.
 *
 * Meaningful human authority remains outside automated permission checks.
 */

const ESCIE_PERMISSIONS = {
  levels: Object.freeze({
    PUBLIC: "public",
    LIMITED: "limited",
    PRIVATE: "private",
    WITHHELD: "withheld"
  }),

  actions: Object.freeze({
    READ: "read",
    WRITE: "write",
    PUBLISH: "publish",
    DISCLOSE: "disclose",
    RELATE: "relate",
    DECIDE: "decide"
  }),

  can(action, visibility = "private") {
    if (!action) {
      return false;
    }

    if (visibility === "withheld") {
      return action === "read" ? false : false;
    }

    if (visibility === "private") {
      return action === "read" || action === "write";
    }

    if (visibility === "limited") {
      return action === "read" ||
        action === "write" ||
        action === "publish";
    }

    if (visibility === "public") {
      return action === "read";
    }

    return false;
  }
};

if (typeof window !== "undefined") {
  window.ESCIE_PERMISSIONS = ESCIE_PERMISSIONS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_PERMISSIONS;
}
