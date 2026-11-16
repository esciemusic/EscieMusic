/* ESCIE PUBLIC SECTION CONTRACT
 * Canonical definition of the public surface.
 *
 * This is a presentation contract, not a second canon. Central research and
 * Case Files remain the controlled source for investigation material.
 * A section may receive finished public artifacts only when its release
 * conditions are satisfied. No section auto-publishes private material.
 */
(function(){
  "use strict";

  const SECTIONS = [
    {
      id:"now", label:"NOW", order:1, role:"current_pulse",
      purpose:"Show what is alive in the present without explaining the whole universe.",
      contentTypes:["current_artifact","current_signal","recent_work","short_trace"],
      behavior:["quiet","single_focus","time_sensitive","returns_to_archive"],
      visualRole:"pulse",
      caseFileRole:"receives_finished_discoveries_only",
      inbound:["approved_artifact","approved_signal","approved_current_work"],
      outbound:["archive_record","candidate_case_reference"],
      disclosure:"minimal"
    },
    {
      id:"art", label:"ART", order:2, role:"creative_surface",
      purpose:"Hold the things ESCIE makes from life: image, sound, writing, film, drawing, painting and other forms.",
      contentTypes:["photograph","video","audio","writing","poetry","drawing","painting","music","object","experiment"],
      behavior:["exhibit","browse","return","context_on_demand"],
      visualRole:"material",
      caseFileRole:"primary_artifact_destination",
      inbound:["approved_artifact","approved_work","approved_media_experiment"],
      outbound:["archive_record","related_case_reference","world_reference","glass_eye_reference"],
      disclosure:"artifact_first"
    },
    {
      id:"world", label:"MY WORLD", order:3, role:"physical_reality",
      purpose:"Ground ESCIE in Montréal, places, routes, environments, objects and lived geography.",
      contentTypes:["place","route","map","photograph","environmental_audio","moment","object","location_trace"],
      behavior:["explore","locate","observe","return"],
      visualRole:"geography",
      caseFileRole:"place_and_context_layer",
      inbound:["approved_place_artifact","approved_map","approved_environmental_work","approved_moment"],
      outbound:["archive_record","world_context","candidate_case_reference"],
      disclosure:"lived_reality"
    },
    {
      id:"glass-eye", label:"GLASS EYE", order:4, role:"audience_eye_surface",
      purpose:"Make the audience's screen feel like an eye: seeing, hearing, following, missing and returning without turning participation into canon.",
      contentTypes:["approved_media","viewer_memory","finding","theory","comment","public_participation"],
      behavior:["observe","listen","follow","miss","return","participate_without_canon"],
      visualRole:"screen_and_sight",
      caseFileRole:"audience_participation_layer",
      inbound:["approved_media","approved_viewer_prompt","approved_public_context"],
      outbound:["web_connection","archive_reference","candidate_finding"],
      disclosure:"public_media_plus_non_canonical_participation"
    },
    {
      id:"web", label:"THE WEB", order:5, role:"connection_surface",
      purpose:"Follow the connections between people, places, moments, records and signals without manufacturing relationships.",
      contentTypes:["public_relationship","connection","reference","shared_record","thread","trail"],
      behavior:["follow","filter","trace","backtrack","return"],
      visualRole:"network",
      caseFileRole:"public_connection_layer",
      inbound:["approved_public_connection","approved_relationship","verified_shared_record"],
      outbound:["related_records","archive_reference","case_file_context"],
      disclosure:"only_verified_or_explicitly_interpreted"
    },
    {
      id:"archives", label:"THE ARCHIVES", order:6, role:"memory_surface",
      purpose:"Preserve public records, fragments, sources, images and traces that have earned a place in the memory of ESCIE.",
      contentTypes:["archive_record","source","fragment","image","document","historical_context","artifact_history"],
      behavior:["browse","date","preserve","contextualize","return"],
      visualRole:"memory",
      caseFileRole:"public_context_and_history",
      inbound:["approved_archive_record","approved_source","retired_artifact","approved_context"],
      outbound:["source_context","case_file_reference","artifact_history"],
      disclosure:"contextual"
    },
    {
      id:"investigation", label:"THE CASE FILES", order:7, role:"controlled_investigation_surface",
      purpose:"Present approved deeper investigation layers without exposing Central's private workspace or turning the site into a puzzle board.",
      contentTypes:["case_file","approved_evidence","timeline","contradiction","question","reference","connection"],
      behavior:["layered","quiet","optional_depth","no_forced_solution"],
      visualRole:"investigation",
      caseFileRole:"is_the_case_file_bridge",
      inbound:["artist_approved_case_layer","approved_evidence","approved_context","approved_question","approved_connection"],
      outbound:["public_artifact","archive_record","world_reference","web_connection"],
      disclosure:"artist_approved_only"
    },
    {
      id:"escie", label:"ESCIE", order:8, role:"artist_identity",
      purpose:"Hold the artist identity, selected philosophy, context and deliberately unknown material without over-explaining the work.",
      contentTypes:["artist_statement","philosophy","selected_context","unknown","identity_trace"],
      behavior:["quiet","direct","selective","open_ended"],
      visualRole:"presence",
      caseFileRole:"artist_authority",
      inbound:["approved_identity_context","approved_statement","approved_unknown"],
      outbound:["artist_context"],
      disclosure:"selective"
    }
  ];

  const MAP={};
  SECTIONS.forEach(section=>{MAP[section.id]=section;});

  window.ESCIE_PUBLIC_SECTIONS={
    version:"1.0.0",
    sections:SECTIONS,
    byId:MAP,
    get:function(id){return MAP[id]||null;},
    list:function(){return SECTIONS.slice();},
    publicIds:function(){return SECTIONS.map(section=>section.id);}
  };
})();
