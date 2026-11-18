/* ESCIE PUBLIC SURFACE CONTRACT
 * Presentation contract only. It does not define the canon.
 *
 * Surface hierarchy:
 *   HOME -> WORLD -> TRACE
 *   WORLD -> PEOPLE / PLACES / MOMENTS / OBJECTS / ART
 *   deeper -> FRAGMENTS / PROOF / BODIES / ARCHIVES / CONNECTIONS
 *   modes -> CASE FILES / GLASS EYE
 *
 * Legacy route ids are kept as aliases so contract normalization does not
 * create a navigation break before the router pass.
 */
(function(){
  "use strict";

  const SECTIONS=[
    {
      id:"now",label:"NOW",order:1,role:"current_signal",
      purpose:"Show what is alive in the present without becoming a dashboard or timeline.",
      contentTypes:["current_artifact","current_signal","recent_work","short_trace"],
      behavior:["quiet","single_focus","time_sensitive","returns_to_context"],
      visualRole:"pulse",disclosure:"minimal"
    },
    {
      id:"world",label:"WORLD",order:2,role:"world_surface",
      purpose:"Let visitors discover the living World through People, Places, Moments, Objects and Art.",
      contentTypes:["person","place","moment","object","art"],
      behavior:["explore","discover","cross_context","return"],
      visualRole:"world",disclosure:"public_projection"
    },
    {
      id:"trace",label:"TRACE",order:3,role:"connection_experience",
      purpose:"Let visitors follow meaningful connections between things without exposing the underlying graph machinery.",
      contentTypes:["connection","thread","trail","reference","shared_record"],
      behavior:["follow","branch","backtrack","return","continue"],
      visualRole:"trace",disclosure:"public_connections_only"
    },
    {
      id:"art",label:"ART",order:4,role:"creative_surface",
      purpose:"Hold what ESCIE creates from experience: music, words, visual work and projects.",
      contentTypes:["music","writing","poetry","drawing","painting","photography","video","project"],
      behavior:["listen","read","watch","browse","context_on_demand"],
      visualRole:"material",disclosure:"artifact_first"
    },
    {
      id:"archives",label:"ARCHIVES",order:5,role:"memory_surface",
      purpose:"Preserve records, fragments, sources, images, versions and traces whose continued existence matters.",
      contentTypes:["archive_record","source","fragment","image","document","artifact_history"],
      behavior:["browse","date","preserve","contextualize","return"],
      visualRole:"memory",disclosure:"contextual"
    },
    {
      id:"investigation",label:"CASE FILES",order:6,role:"controlled_investigation_surface",
      purpose:"Present approved deeper investigations without exposing Central's private workspace.",
      contentTypes:["case_file","approved_evidence","timeline","contradiction","question","reference","connection"],
      behavior:["layered","quiet","optional_depth","no_forced_solution"],
      visualRole:"investigation",disclosure:"artist_approved_only"
    },
    {
      id:"glass-eye",label:"GLASS EYE",order:7,role:"participation_surface",
      purpose:"Let visitors see, hear, follow, comment and contribute without turning participation directly into canon.",
      contentTypes:["approved_media","viewer_memory","finding","theory","comment","public_participation"],
      behavior:["observe","listen","follow","miss","return","participate_without_canon"],
      visualRole:"screen_and_sight",disclosure:"public_media_plus_reviewed_participation"
    },
    {
      id:"escie",label:"ESCIE",order:8,role:"artist_identity",
      purpose:"Hold the artist identity and selected context without becoming a biography dashboard.",
      contentTypes:["artist_statement","selected_context","identity_trace","unknown"],
      behavior:["quiet","direct","selective","open_ended"],
      visualRole:"presence",disclosure:"selective"
    }
  ];

  const MAP={};
  SECTIONS.forEach(section=>{MAP[section.id]=section;});

  const ALIASES={
    "my-world":"world",
    "web":"trace",
    "the-web":"trace",
    "archives":"archives",
    "the-archives":"archives",
    "cases":"investigation"
  };

  Object.keys(ALIASES).forEach(alias=>{MAP[alias]=MAP[ALIASES[alias]];});

  window.ESCIE_PUBLIC_SECTIONS={
    version:"2.0.0",
    hierarchy:{
      level1:["home","world","trace"],
      level2:["people","places","moments","objects","art"],
      deeper:["fragments","proof","bodies","archives","connections"],
      modes:["investigation","glass-eye"]
    },
    sections:SECTIONS,
    byId:MAP,
    aliases:ALIASES,
    get:function(id){return MAP[id]||null;},
    list:function(){return SECTIONS.slice();},
    publicIds:function(){return SECTIONS.map(section=>section.id);}
  };
})();
