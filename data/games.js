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


  const GAME_ITEM_TYPES=["game_item","game_inventory","game_purchase","game_reward"];
  const GAME_ITEM_STATES=["AVAILABLE","LOCKED","DISCOVERED","PURCHASABLE","PURCHASED","OWNED","CLAIMED"];
  function gameItem(record){
    if(!record||typeof record!=="object")return null;
    return Object.assign({id:null,type:"game_item",title:"UNTITLED",description:"",price:null,currency:"CAD",availability:"AVAILABLE",visibility:"public",requires:[],unlocks:[],inventory_key:null,external_purchase_url:null,physical_item_id:null,digital:false,canonical_write:false},record);
  }
  function validateItem(item){
    const errors=[];
    if(!item||typeof item!=="object")return {ok:false,errors:["item must be an object"]};
    if(!item.id)errors.push("missing id");
    if(!GAME_ITEM_TYPES.includes(item.type))errors.push("unsupported item type");
    if(item.canonical_write===true)errors.push("game commerce cannot write canonical truth directly");
    if(item.price!==null&&item.price!==undefined&&(!Number.isFinite(Number(item.price))||Number(item.price)<0))errors.push("invalid price");
    if(item.external_purchase_url&&typeof item.external_purchase_url!=="string")errors.push("invalid purchase url");
    if(!Array.isArray(item.requires)||!Array.isArray(item.unlocks))errors.push("requires and unlocks must be arrays");
    return {ok:errors.length===0,errors};
  }

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
  const ESCIE_GAME_ITEMS=[];
  const ESCIE_GAME_INVENTORIES=[];
  const ESCIE_GAME_PURCHASES=[];
  const ESCIE_GAME_REWARDS=[];
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

  const PLAYER_EVENT_TYPES=[
    "ENTERED","OBSERVED","INTERACTED","HEARD","SEEN","COLLECTED",
    "CONNECTED","DISCONNECTED","MISSED","RETURNED","DISCOVERED","LEFT"
  ];

  const PLAYER_STATE_SCHEMA={
    version:1,
    session_id:null,
    player_id:null,
    episode_id:null,
    current_scene:null,
    current_location:null,
    entered_at:null,
    last_seen_at:null,
    observed:[],
    interacted:[],
    heard:[],
    seen:[],
    collected:[],
    connections:[],
    discoveries:[],
    missed:[],
    visited_scenes:[],
    visited_locations:[],
    signals:[],
    unknown:[],
    unresolved:[],
    path:[],
    event_count:0,
    canonical_write:false
  };

  function clone(value){
    if(value===undefined||value===null) return value;
    if(typeof structuredClone==="function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function cleanIds(value){
    return list(value).filter(v=>typeof v==="string"&&v.trim()).map(v=>v.trim());
  }

  function createPlayerState(seed){
    const input=seed&&typeof seed==="object"?seed:{};
    const state=Object.assign({},clone(PLAYER_STATE_SCHEMA),input);
    state.observed=cleanIds(input.observed);
    state.interacted=cleanIds(input.interacted);
    state.heard=cleanIds(input.heard);
    state.seen=cleanIds(input.seen);
    state.collected=cleanIds(input.collected);
    state.connections=cleanIds(input.connections);
    state.discoveries=cleanIds(input.discoveries);
    state.missed=cleanIds(input.missed);
    state.visited_scenes=cleanIds(input.visited_scenes);
    state.visited_locations=cleanIds(input.visited_locations);
    state.signals=cleanIds(input.signals);
    state.unknown=cleanIds(input.unknown);
    state.unresolved=cleanIds(input.unresolved);
    state.path=Array.isArray(input.path)?input.path.slice(-500):[];
    state.event_count=Number.isFinite(Number(input.event_count))?Number(input.event_count):0;
    state.canonical_write=false;
    return state;
  }

  function hasId(array,id){
    return Array.isArray(array)&&array.includes(id);
  }

  function addUnique(array,id){
    if(typeof id!=="string"||!id.trim()) return;
    if(!hasId(array,id)) array.push(id);
  }

  function applyPlayerEvent(seed,event){
    const state=createPlayerState(seed);
    if(!event||typeof event!=="object") return state;
    const type=String(event.type||"").toUpperCase();
    const id=typeof event.target_id==="string"?event.target_id.trim():"";
    const timestamp=event.timestamp||new Date().toISOString();
    if(!PLAYER_EVENT_TYPES.includes(type)) return state;
    state.last_seen_at=timestamp;
    state.event_count+=1;
    if(id) state.path.push({type,target_id:id,timestamp});
    if(type==="ENTERED"){
      addUnique(state.visited_scenes,event.scene_id);
      addUnique(state.visited_locations,event.location_id);
      state.current_scene=event.scene_id||state.current_scene;
      state.current_location=event.location_id||state.current_location;
    }
    if(type==="OBSERVED") addUnique(state.observed,id);
    if(type==="INTERACTED") addUnique(state.interacted,id);
    if(type==="HEARD") addUnique(state.heard,id);
    if(type==="SEEN") addUnique(state.seen,id);
    if(type==="COLLECTED") addUnique(state.collected,id);
    if(type==="CONNECTED") addUnique(state.connections,id);
    if(type==="DISCOVERED") addUnique(state.discoveries,id);
    if(type==="MISSED") addUnique(state.missed,id);
    if(type==="RETURNED"){
      addUnique(state.visited_scenes,event.scene_id);
      addUnique(state.visited_locations,event.location_id);
      state.current_scene=event.scene_id||state.current_scene;
      state.current_location=event.location_id||state.current_location;
    }
    if(type==="LEFT"){
      state.current_scene=null;
      state.current_location=null;
    }
    if(event.unknown===true) addUnique(state.unknown,id);
    if(event.unresolved===true) addUnique(state.unresolved,id);
    if(event.signal_id) addUnique(state.signals,event.signal_id);
    return state;
  }

  function playerMemory(state){
    const source=createPlayerState(state);
    return {
      observed:source.observed.slice(),
      interacted:source.interacted.slice(),
      heard:source.heard.slice(),
      seen:source.seen.slice(),
      collected:source.collected.slice(),
      connections:source.connections.slice(),
      discoveries:source.discoveries.slice(),
      missed:source.missed.slice(),
      visited_scenes:source.visited_scenes.slice(),
      visited_locations:source.visited_locations.slice(),
      signals:source.signals.slice(),
      unknown:source.unknown.slice(),
      unresolved:source.unresolved.slice(),
      path:source.path.slice()
    };
  }

  const API={
    version:"1.1.0",
    itemTypes:()=>GAME_ITEM_TYPES.slice(),
    itemStates:()=>GAME_ITEM_STATES.slice(),
    gameItem,
    validateItem,
    playerEventTypes:()=>PLAYER_EVENT_TYPES.slice(),
    playerStateSchema:()=>clone(PLAYER_STATE_SCHEMA),
    createPlayerState,
    applyPlayerEvent,
    playerMemory,

    types:()=>GAME_TYPES.slice(),
    relationshipTypes:()=>GAME_RELATIONSHIPS.slice(),
    items:()=>list(ESCIE_GAME_ITEMS).map(gameItem),
    inventories:()=>list(ESCIE_GAME_INVENTORIES).map(r=>gameRecord(r,"game_inventory")),
    purchases:()=>list(ESCIE_GAME_PURCHASES).map(r=>gameRecord(r,"game_purchase")),
    rewards:()=>list(ESCIE_GAME_REWARDS).map(r=>gameRecord(r,"game_reward")),
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
      ...API.records(),...API.items(),...API.inventories(),...API.purchases(),...API.rewards(),...API.episodes(),...API.scenes(),...API.events(),...API.interactions(),
      ...API.dialogue(),...API.clues(),...API.discoveries(),...API.playerPaths(),
      ...API.playerStates(),...API.endings()
    ],
    validate(record){
      const errors=[];
      if(!record||typeof record!=="object") return {ok:false,errors:["record must be an object"]};
      if(!record.id) errors.push("missing id");
      if(!GAME_TYPES.includes(record.type)) errors.push("unsupported game type: "+record.type);
      if(record.release_status&&!["locked","released"].includes(record.release_status)) errors.push("invalid release_status");
      if(record.canonical_write===true) errors.push("player/game records cannot write canonical truth directly");
      if(record.type==="player_state"&&record.visibility==="public"&&record.player_visible===false) errors.push("hidden player state cannot be public");
      if(!Array.isArray(record.conditions)) errors.push("conditions must be an array");
      return {ok:errors.length===0,errors};
    }
  };

  root.ESCIE_GAMES=ESCIE_GAMES;
  root.ESCIE_GAME_ITEMS=ESCIE_GAME_ITEMS;
  root.ESCIE_GAME_INVENTORIES=ESCIE_GAME_INVENTORIES;
  root.ESCIE_GAME_PURCHASES=ESCIE_GAME_PURCHASES;
  root.ESCIE_GAME_REWARDS=ESCIE_GAME_REWARDS;
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