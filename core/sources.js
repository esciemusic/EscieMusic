/*
 * ESCIE CORE SOURCES
 *
 * A source describes where information came from.
 * Source metadata supports provenance, auditing, ingestion, and disclosure.
 *
 * A source is not proof by itself.
 */

const ESCIE_SOURCES = [];

const SOURCE_TYPES = Object.freeze({
  DOCUMENTATION: "documentation",
  OBSERVATION: "observation",
  CONVERSATION: "conversation",
  RESEARCH: "research",
  EXISTING_ART: "existing_art",
  EXTERNAL_MEDIA: "external_media",
  UNKNOWN: "unknown"
});

const SOURCE_RELIABILITY = Object.freeze({
  VERIFIED: "verified",
  STRONG: "strong",
  CREDIBLE: "credible",
  UNCERTAIN: "uncertain",
  UNKNOWN: "unknown"
});

function createSource(input = {}) {
  return {
    id: input.id || null,
    type: input.type || SOURCE_TYPES.UNKNOWN,
    name: input.name || null,
    url: input.url || null,
    provider: input.provider || null,
    discoveredAt: input.discoveredAt || null,
    accessedAt: input.accessedAt || null,
    reliability: input.reliability || SOURCE_RELIABILITY.UNKNOWN,
    disclosure: input.disclosure || "unknown",
    metadata: input.metadata || {}
  };
}

function validateSource(source = {}) {
  const errors = [];

  if (!source || typeof source !== "object") {
    return { valid: false, errors: ["Source must be an object."] };
  }

  if (!source.id || typeof source.id !== "string") {
    errors.push("Source must have a string id.");
  }

  if (!Object.values(SOURCE_TYPES).includes(source.type)) {
    errors.push("Invalid source type.");
  }

  if (!Object.values(SOURCE_RELIABILITY).includes(source.reliability)) {
    errors.push("Invalid source reliability.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function registerSource(input = {}) {
  const source = createSource(input);
  const validation = validateSource(source);

  if (!validation.valid) {
    return { source, valid: false, errors: validation.errors };
  }

  if (ESCIE_SOURCES.some((item) => item.id === source.id)) {
    return {
      source,
      valid: false,
      errors: ["Duplicate source id."]
    };
  }

  ESCIE_SOURCES.push(source);

  return {
    source,
    valid: true,
    errors: []
  };
}

function getSource(id) {
  if (!id) return null;
  return ESCIE_SOURCES.find((source) => source.id === id) || null;
}

const ESCIE_SOURCE_API = {
  TYPES: SOURCE_TYPES,
  RELIABILITY: SOURCE_RELIABILITY,
  create: createSource,
  validate: validateSource,
  register: registerSource,
  get: getSource
};

if (typeof window !== "undefined") {
  window.ESCIE_SOURCES = ESCIE_SOURCES;
  window.ESCIE_SOURCE = ESCIE_SOURCE_API;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ESCIE_SOURCES,
    ...ESCIE_SOURCE_API,
    createSource,
    validateSource,
    registerSource,
    getSource
  };
}
