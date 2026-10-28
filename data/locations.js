/*
 * ESCIE LOCATION REGISTRY
 *
 * Places are records in ESCIE's world.
 *
 * A place can be physical, remembered, documented, depicted, or
 * referenced. A location record does not imply that every associated
 * event occurred there. Geographic proximity is not proof of a
 * relationship between records.
 */

const ESCIE_LOCATIONS = [
  {
    id: "montreal",
    type: "place",
    title: "MONTRÉAL",
    slug: "montreal",
    description: "The physical city anchoring ESCIE.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "observation",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "quebec", "canada", "physical-anchor"]
  }
];

if (typeof window !== "undefined") {
  window.ESCIE_LOCATIONS = ESCIE_LOCATIONS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_LOCATIONS;
}
