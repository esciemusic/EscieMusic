/*
 * ESCIE SECURITY — SANITIZE
 *
 * Sanitization protects the interface from unsafe text or markup.
 * It must never silently alter the meaning of canonical material.
 */

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeText(value = "") {
  return escapeHTML(value);
}

function sanitizeAttribute(value = "") {
  return escapeHTML(value).replace(/\`/g, "&#96;");
}

const ESCIE_SECURITY_SANITIZE = { escapeHTML, sanitizeText, sanitizeAttribute };

if (typeof window !== "undefined") window.ESCIE_SECURITY_SANITIZE = ESCIE_SECURITY_SANITIZE;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_SECURITY_SANITIZE;
