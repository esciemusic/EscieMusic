/* ESCIE GAME REGISTRY
 * Game-facing records live in the same world as music, clothing, archive and investigation.
 * This file defines the canonical shape; an empty collection is intentional until a game
 * episode is actually authored.
 */
(function(){
  "use strict";
  const root=typeof window!=="undefined"?window:globalThis;

  const GAME_TYPES=[
    "game",
    "game_episode",
    "game_scene",
    "game_event",
    "game_interaction",
    "game_dialogue",
    "game_clue",
    "game_discovery",
    "player_path",
    "player_state",
    "game_ending"
  ];

  const GAME_RELATIONSHIPS=[
    "APPEARS_IN",
    "LOCATED_AT",
    "BELONGS_TO",
    "REFERENCES",
    "HEARD_IN",
    "SEEN_IN",
    "PRECEDES",
    "FOLLOWS",
    "DISCOVERED_BY",
    "UNLOCKS",
    "POINTS_TO",
    "CONTRADICTS"
  ];

  const ESCIE_GAMES=[];
  const ESCIE_GAME_EPISODES=[];
  const ESCIE_GAME_SCENES=[];
  const ESCIE_GAME_EVENTS=[];
  const ESCIE_GAME_INTERACTIONS=[];
  const ESCIE_GAME_DIALOGUE=[];
  const ESCIE_GAME_CLUES=[];
  const ESCIE_GAME_DISCOVERIES=[];
  const ESCIE_PLAYER_PATHS=[];
  const ESCIE_PLAYER_STATES=[];
  const ESCIE_GAME_ENDINGS=[];

  function list(value){
    return Array.isArray(value)?value:[];
  }

  function gameRecord(record,type){
    if(!record||typeof record!=="object") return null;
    return Object.assign({
      id:null,
      type:type||"game",
      title:"UNTITLED",
      description:"",
      status:"development",
      visibility:"private",
      published:false,
      release_status:"locked",
      release_mode:null,
      project:null,
      episode:null,
      scene:null,
      people:[],
      locations:[],
      media:[],
      evidence:[],
      symbols:[],
      tags:[],
      relationships:[],
      related_content:[],
      questions:[],
      interactions:[],
      discoveries:[],
      conditions:[],
      player_state:null,
      provenance:null
    },record,{
      type:record.type||type||"game",
      people:list(record.people),
      locations:list(record.locations),
      media:list(record.media),
      evidence:list(record.evidence),
      symbols:list(record.symbols),
      tags:list(record.tags),
      relationships:list(record.relationships),
      related_content:list(record.related_content),
      questions:list(record.questions),
      interactions:list(record.interactions),
      discoveries:list(record.discoveries),
      conditions:list(record.conditions)
    });
  }

  const API={
    version:"1.0.0",
    types:()=>GAME_TYPES.slice(),
    relationshipTypes:()=>GAME_RELATIONSHIPS.slice(),
    records:()=>list(ESCIE_GAMES).map(r=>gameRecord(r,"game")),
    episodes:()=>list(ESCIE_GAME_EPISODES).map(r=>gameRecord(r,"game_episode")),
    scenes:()=>list(ESCIE_GAME_SCENES).map(r=>gameRecord(r,"game_scene")),
    events:()=>list(ESCIE_GAME_EVENTS).map(r=>gameRecord(r,"game_event")),
    interactions:()=>list(ESCIE_GAME_INTERACTIONS).map(r=>gameRecord(r,"game_interaction")),
    dialogue:()=>list(ESCIE_GAME_DIALOGUE).map(r=>gameRecord(r,"game_dialogue")),
    clues:()=>list(ESCIE_GAME_CLUES).map(r=>gameRecord(r,"game_clue")),
    discoveries:()=>list(ESCIE_GAME_DISCOVERIES).map(r=>gameRecord(r,"game_discovery")),
    playerPaths:()=>list(ESCIE_PLAYER_PATHS).map(r=>gameRecord(r,"player_path")),
    playerStates:()=>list(ESCIE_PLAYER_STATES).map(r=>gameRecord(r,"player_state")),
    endings:()=>list(ESCIE_GAME_ENDINGS).map(r=>gameRecord(r,"game_ending")),
    all:()=>[
      ...API.records(),...API.episodes(),...API.scenes(),...API.events(),...API.interactions(),
      ...API.dialogue(),...API.clues(),...API.discoveries(),...API.playerPaths(),
      ...API.playerStates(),...API.endings()
    ],
    validate(record){
      const errors=[];
      if(!record||typeof record!=="object") return {ok:false,errors:["record must be an object"]};
      if(!record.id) errors.push("missing id");
      if(!GAME_TYPES.includes(record.type)) errors.push("unsupported game type: "+record.type);
      if(record.release_status&&!["locked","released"].includes(record.release_status)) errors.push("invalid release_status");
      if(!Array.isArray(record.conditions)) errors.push("conditions must be an array");
      return {ok:errors.length===0,errors};
    }
  };

  root.ESCIE_GAMES=ESCIE_GAMES;
  root.ESCIE_GAME_EPISODES=ESCIE_GAME_EPISODES;
  root.ESCIE_GAME_SCENES=ESCIE_GAME_SCENES;
  root.ESCIE_GAME_EVENTS=ESCIE_GAME_EVENTS;
  root.ESCIE_GAME_INTERACTIONS=ESCIE_GAME_INTERACTIONS;
  root.ESCIE_GAME_DIALOGUE=ESCIE_GAME_DIALOGUE;
  root.ESCIE_GAME_CLUES=ESCIE_GAME_CLUES;
  root.ESCIE_GAME_DISCOVERIES=ESCIE_GAME_DISCOVERIES;
  root.ESCIE_PLAYER_PATHS=ESCIE_PLAYER_PATHS;
  root.ESCIE_PLAYER_STATES=ESCIE_PLAYER_STATES;
  root.ESCIE_GAME_ENDINGS=ESCIE_GAME_ENDINGS;
  root.ESCIE_GAME_REGISTRY=API;

  if(typeof module!=="undefined"&&module.exports) module.exports=API;
})();