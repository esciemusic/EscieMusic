/*
 * ESCIE TESTS — REGISTRY
 *
 * Contract checks use an isolated in-memory release fixture so the public
 * repository can remain completely free of unreleased BAM metadata.
 */
(function(){
  "use strict";
  function assert(condition,message){if(!condition)throw new Error(message);}

  function run(){
    const registry=typeof window!=="undefined"?window.ESCIE_RECORD_REGISTRY:null;
    if(!registry)return {skipped:true,reason:"record registry unavailable"};

    const runtime=window.ESCIE_RELEASE_RUNTIME||{};
    const original={
      music:Array.isArray(runtime.music)?runtime.music.slice():[],
      relationships:Array.isArray(runtime.relationships)?runtime.relationships.slice():[],
      projectStructures:runtime.projectStructures&&typeof runtime.projectStructures==="object"?Object.assign({},runtime.projectStructures):{},
      projects:Array.isArray(runtime.projects)?runtime.projects.slice():[]
    };
    const gameCollections={
      games:Array.isArray(window.ESCIE_GAMES)?window.ESCIE_GAMES.slice():[],
      episodes:Array.isArray(window.ESCIE_GAME_EPISODES)?window.ESCIE_GAME_EPISODES.slice():[],
      scenes:Array.isArray(window.ESCIE_GAME_SCENES)?window.ESCIE_GAME_SCENES.slice():[]
    };

    const project={id:"__test-project__",type:"project",title:"TEST PROJECT",status:"active",published:true,visibility:"public",release_mode:"progressive"};
    const track={id:"__test-track__",type:"music",project:project.id,number:"001",title:"TEST TRANSMISSION",role:"THE TEST",status:"active",published:true,visibility:"public",release_status:"released"};
    const locked={id:"__locked-release-fixture__",type:"music",project:project.id,number:"999",title:"LOCKED FIXTURE",role:"LOCKED",status:"development",published:true,visibility:"public",release_status:"locked"};
    const relationship={id:"__test-contains__",from:project.id,type:"contains",to:track.id,status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true};

    runtime.projects=[project];
    runtime.music=[track,locked];
    runtime.relationships=[relationship];
    window.ESCIE_GAMES.push({
      id:"__test-game__",type:"game",title:"TEST GAME",status:"active",published:true,visibility:"public",release_status:"released"
    });
    window.ESCIE_GAME_EPISODES.push({
      id:"__test-episode__",type:"game_episode",title:"TEST EPISODE",status:"active",published:true,visibility:"public",release_status:"released",project:"__test-game__",conditions:[]
    });
    window.ESCIE_GAME_SCENES.push({
      id:"__test-scene__",type:"game_scene",title:"TEST SCENE",status:"active",published:true,visibility:"public",release_status:"released",episode:"__test-episode__",conditions:[]
    });

    runtime.projectStructures={[project.id]:[
      {number:"001",title:track.title,role:track.role,trackId:track.id},
      {number:"999",title:locked.title,role:locked.role,trackId:locked.id}
    ]};

    try{
      const nodes=registry.publicNodes();
      assert(Array.isArray(nodes)&&nodes.length===7,"canonical public node set must contain seven nodes");
      assert(nodes[0].id==="node-now"&&nodes[6].id==="node-escie","public nodes must preserve canonical order");

      const workNode=registry.nodeFor("node-work");
      assert(workNode&&workNode.section==="work","node lookup must resolve the work node");
      assert(workNode.records.includes(track.id),"work node must expose released test transmission");
      assert(!workNode.records.includes(locked.id),"work node must hide locked release records");

      assert(registry.nodesForRecord(track.id).some(node=>node.id==="node-work"),"released transmission must resolve back to its public work node");
      assert(registry.nodesForRecord(locked.id).length===0,"locked release must resolve to no public nodes");

      const manifest=registry.manifestFor(project.id);
      assert(manifest&&manifest.work===true&&manifest.sections.work===true,"progressive project manifest must route to work");

      const trackManifest=registry.manifestFor(track.id);
      assert(trackManifest&&trackManifest.sections.work===true,"released test track must route to work");
      assert(trackManifest.sections.web===true,"connected test track must appear in web");
      assert(trackManifest.search===true,"public released records should be searchable");

      assert(registry.releaseVisible(project)===true,"progressive project must unlock when a released track exists");
      assert(registry.releaseVisible(track)===true,"released track must be visible");
      assert(registry.releaseVisible(locked)===false,"locked release must remain hidden");
      assert(registry.publicRecord(track.id).id===track.id,"publicRecord must return released records");
      assert(registry.publicRecord(locked.id)===null,"publicRecord must fail closed for locked records");

      const publicRecords=registry.allPublicRecords();
      assert(publicRecords.some(record=>record.id===track.id),"released fixture must enter public records");
      assert(!publicRecords.some(record=>record.id===locked.id),"locked fixture must stay out of public records");

      const projectTracks=registry.filter(registry.records(),{project:project.id});
      assert(projectTracks.some(record=>record.id===track.id)&&projectTracks.some(record=>record.id===locked.id),"project facet should see internal fixture records");

      const contained=registry.relationshipsFor(project.id,{type:"contains"});
      assert(contained.length===1&&contained[0].to===track.id,"relationship query must expose only released containment");

      const counts=registry.relationshipCounts();
      assert(counts.byType.contains===1,"relationship counts must aggregate released containment");

      assert(registry.contextFor(locked.id).record===null,"locked context must fail closed");
      assert(registry.releaseVisible(Object.assign({},locked,{release_status:"unknown"}))===false,"invalid release states must fail closed");

      const game=registry.get("__test-game__");
      const episode=registry.get("__test-episode__");
      const scene=registry.get("__test-scene__");
      assert(game&&game.type==="game","game records must enter canonical registry");
      assert(episode&&episode.type==="game_episode"&&episode.project==="__test-game__","game episode must retain game linkage");
      assert(scene&&scene.type==="game_scene"&&scene.episode==="__test-episode__","game scene must retain episode linkage");
      assert(registry.releaseVisible(scene)===true,"released game scenes must be visible to the registry");
      assert(registry.publicRecord(scene.id).id===scene.id,"released game scene must be publicly addressable");

      assert(registry.referenceAudit().ok===true,"reference audit must pass");
      assert(registry.sectionAudit().ok===true,"section manifest audit must pass");
      assert(registry.releaseAudit().ok===true,"progressive release audit must pass");
      assert(registry.contractAudit().ok===true,"release fixture must satisfy record contract");

      const searchIndex=typeof window!=="undefined"?window.ESCIE_SEARCH_INDEX:null;
      if(searchIndex){
        searchIndex.clear();
        searchIndex.build([track,locked]);
        assert(searchIndex.entries.some(entry=>entry.id===track.id),"released fixture must enter search index");
        assert(!searchIndex.entries.some(entry=>entry.id===locked.id),"locked fixture must stay out of search index");
        searchIndex.clear();
      }

      const publishBuild=typeof window!=="undefined"?window.ESCIE_PUBLISH_BUILD:null;
      if(publishBuild){
        const publicBuild=publishBuild.buildPublicRecords([track,locked]);
        assert(publicBuild.some(record=>record.id===track.id),"released fixture must enter public build");
        assert(!publicBuild.some(record=>record.id===locked.id),"locked fixture must stay out of public build");
      }

      return {passed:true};
    }finally{
      runtime.music=original.music;
      runtime.relationships=original.relationships;
      runtime.projectStructures=original.projectStructures;
      runtime.projects=original.projects;
      window.ESCIE_GAMES.length=0; window.ESCIE_GAMES.push(...gameCollections.games);
      window.ESCIE_GAME_EPISODES.length=0; window.ESCIE_GAME_EPISODES.push(...gameCollections.episodes);
      window.ESCIE_GAME_SCENES.length=0; window.ESCIE_GAME_SCENES.push(...gameCollections.scenes);
    }
  }

  if(typeof window!=="undefined")window.ESCIE_TEST_REGISTRY={run};
  if(typeof module!=="undefined"&&module.exports)module.exports={run};
})();
