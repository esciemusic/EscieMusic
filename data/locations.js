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
  },
  {
    id: "parc-extension",
    type: "place",
    title: "PARC-EXTENSION",
    slug: "parc-extension",
    description: "A Montréal neighbourhood used as a recurring geographic anchor in the ESCIE record.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "observation",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "parc-extension", "physical-anchor"]
  },
  {
    id: "mile-end",
    type: "place",
    title: "MILE END",
    slug: "mile-end",
    description: "A Montréal neighbourhood within the city's broader physical geography.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "reference",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "mile-end", "place"]
  },
  {
    id: "plateau",
    type: "place",
    title: "PLATEAU",
    slug: "plateau",
    description: "A Montréal geographic reference point in the ESCIE world.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "reference",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "plateau", "place"]
  },
  {
    id: "rosemont",
    type: "place",
    title: "ROSEMONT",
    slug: "rosemont",
    description: "A Montréal geographic reference point in the ESCIE world.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "reference",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "rosemont", "place"]
  },
  {
    id: "downtown-montreal",
    type: "place",
    title: "DOWNTOWN MONTRÉAL",
    slug: "downtown-montreal",
    description: "The central Montréal reference layer for the ESCIE world.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "reference",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "downtown", "place"]
  },
  {
    id: "old-montreal",
    type: "place",
    title: "OLD MONTRÉAL",
    slug: "old-montreal",
    description: "A historic Montréal geographic reference point in the ESCIE world.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "reference",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "old-montreal", "place"]
  },
  {
    id: "saint-henri",
    type: "place",
    title: "SAINT-HENRI",
    slug: "saint-henri",
    description: "A Montréal neighbourhood reference point in the ESCIE world.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "reference",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "saint-henri", "place"]
  },
  {
    id: "verdun",
    type: "place",
    title: "VERDUN",
    slug: "verdun",
    description: "A Montréal neighbourhood reference point in the ESCIE world.",
    visibility: "public",
    public_disclosure: true,
    archive_state: "active",
    knowledge: "known",
    origin: "reference",
    transformation: "none",
    certainty: "verified",
    status: "active",
    tags: ["montréal", "verdun", "place"]
  }
];

if (typeof window !== "undefined") {
  window.ESCIE_LOCATIONS = ESCIE_LOCATIONS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_LOCATIONS;
}
