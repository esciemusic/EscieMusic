"use strict";

/*
 * ESCIE ANIMATED SERIES DEVELOPMENT REGISTRY
 * Architecture-first and private-safe.
 * No unreleased lyric text is stored here.
 */

const ESCIE_ANIMATED_SERIES = {
  id: "escie-animated-series",
  status: "development",
  canonPolicy: ["CANON", "INFERENCE", "ADAPTATION", "UNKNOWN"],
  spine: [
    "WHO MADE HIM?",
    "WHAT DID HE BECOME?",
    "WHAT WILL HE MAKE?"
  ],
  identityFacets: ["THE FATHER", "THE MAN", "THE MONSTER"],
  storyFlow: ["LYRICS", "STORY", "EPISODES", "ANIMATED SERIES"],
  ecosystemFlow: ["SONGS", "SERIES", "WORLD", "GAME"],
  gameStatus: "paused",
  sourceTracks: Array.from({length: 8}, (_, index) => ({
    id: "track-" + String(index + 1).padStart(3, "0"),
    status: "source-required",
    title: null,
    approvedLyricSource: null,
    canon: [],
    inference: [],
    adaptation: [],
    unknown: []
  })),
  season: {
    id: "season-1",
    status: "architecture",
    acts: [
      {id:"act-1", name:"ORIGIN OF THE SIGNAL", purpose:"Establish person, environment, pressure and formative relationships."},
      {id:"act-2", name:"THE MONSTER", purpose:"Expose behavior, perception, conditioning and consequence."},
      {id:"act-3", name:"THE FATHER", purpose:"Test responsibility, protection and inheritance."},
      {id:"act-4", name:"THE HUMAN", purpose:"Confront consequence, contradiction and identity."}
    ]
  },
  episodeSchema: [
    "id","workingTitle","sourceReferences","chronologyPosition",
    "primaryCharacter","secondaryCharacters","locations","objects",
    "events","conflict","emotionalTurn","visualLanguage","symbols",
    "soundLanguage","dialogueRequirements","canon","inference",
    "adaptation","unknowns","endingImage","nextQuestion"
  ],
  characterSchema: [
    "identity","innerEngine","relationshipEngine","visualEngine","voiceEngine"
  ],
  locationSchema: [
    "physicalIdentity","timeIdentity","seasonIdentity","soundIdentity",
    "socialIdentity","memoryAssociation","objects","characters",
    "storyFunction","transformation"
  ],
  symbolSchema: [
    "symbol","firstAppearance","meaningAtFirstAppearance",
    "laterMeaning","visualRule","soundRule","resolution"
  ],
  timelineSchema: [
    "eventTime","memoryTime","audienceTime","revealImpact"
  ],
  qualityGates: [
    "SOURCE","STORY","CONTINUITY","VISUAL","SOUND","DISCLOSURE","PUBLIC-SITE"
  ]
};

if (typeof window !== "undefined") window.ESCIE_ANIMATED_SERIES = ESCIE_ANIMATED_SERIES;
if (typeof module !== "undefined") module.exports = ESCIE_ANIMATED_SERIES;
