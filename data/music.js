/*
 * ESCIE MUSIC REGISTRY
 *
 * Music entries are ART records associated with project bodies.
 * This registry contains work metadata and references; it does not
 * establish autobiographical truth or interpretive meaning.
 */

const ESCIE_MUSIC = [
  {
    id: "bam-001-dallas-63",
    project: "bam-by-any-means",
    number: "001",
    title: "DALLAS '63",
    role: "THE MYTH",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  },
  {
    id: "bam-002-no-shade",
    project: "bam-by-any-means",
    number: "002",
    title: "NO SHADE",
    role: "THE MONSTER",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  },
  {
    id: "bam-003-i-need-a-flex",
    project: "bam-by-any-means",
    number: "003",
    title: "I NEED A FLEX",
    role: "THE FATHER",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  },
  {
    id: "bam-004-bacc-2-basics",
    project: "bam-by-any-means",
    number: "004",
    title: "BACC 2 BASICS",
    role: "THE TRAP",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  },
  {
    id: "bam-005-sana-sana",
    project: "bam-by-any-means",
    number: "005",
    title: "SANA, SANA, COLITA DE RANA",
    role: "THE INHERITANCE",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  },
  {
    id: "bam-006-pumpy-to-the-chest",
    project: "bam-by-any-means",
    number: "006",
    title: "PUMPY TO THE CHEST",
    role: "THE CONSEQUENCE",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  },
  {
    id: "bam-007-loading-the-clip",
    project: "bam-by-any-means",
    number: "007",
    title: "LOADING THE CLIP",
    role: "THE EVIDENCE",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  },
  {
    id: "bam-008-dichotomy",
    project: "bam-by-any-means",
    number: "008",
    title: "DICHOTOMY",
    role: "THE HUMAN",
    status: "development",
    published: false,
    releaseDate: null,
    audio: { platform: null, url: null, embed: null },
    video: { platform: null, url: null, embed: null },
    artwork: null,
    lyrics: null,
    people: [],
    locations: [],
    evidence: [],
    tags: [],
    relatedContent: []
  }
];

if (typeof window !== "undefined") {
  window.ESCIE_MUSIC = ESCIE_MUSIC;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_MUSIC;
}
