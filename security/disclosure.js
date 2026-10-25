/*
 * ESCIE SECURITY — DISCLOSURE
 *
 * Disclosure determines whether an existing record may be exposed through
 * a particular public surface. Disclosure is not truth, authorship, canon,
 * or interpretation. A record can be real and still be withheld.
 */

const DISCLOSURE_LEVELS = Object.freeze({
  PUBLIC: "public",
  LIMITED: "limited",
  PRIVATE: "private",
  WITHHELD: "withheld"
});

function normalizeDisclosure(value) {
  const normalized = String(value || "").toLowerCase();
  return Object.values(DISCLOSURE_LEVELS).includes(normalized)
    ? normalized
    : DISCLOSURE_LEVELS.WITHHELD;
}

function canDisclose(record = {}, requestedLevel = DISCLOSURE_LEVELS.PUBLIC) {
  const actual = normalizeDisclosure(record.visibility || record.disclosure);
  const requested = normalizeDisclosure(requestedLevel);

  if (actual === DISCLOSURE_LEVELS.WITHHELD || actual === DISCLOSURE_LEVELS.PRIVATE) {
    return false;
  }

  if (actual === DISCLOSURE_LEVELS.LIMITED) {
    return requested === DISCLOSURE_LEVELS.LIMITED;
  }

  return requested === DISCLOSURE_LEVELS.PUBLIC ||
    requested === DISCLOSURE_LEVELS.LIMITED;
}

function publicView(record = {}) {
  return canDisclose(record, DISCLOSURE_LEVELS.PUBLIC) ? { ...record } : null;
}

const ESCIE_SECURITY_DISCLOSURE = {
  levels: DISCLOSURE_LEVELS,
  normalize: normalizeDisclosure,
  canDisclose,
  publicView
};

if (typeof window !== "undefined") window.ESCIE_SECURITY_DISCLOSURE = ESCIE_SECURITY_DISCLOSURE;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_SECURITY_DISCLOSURE;
