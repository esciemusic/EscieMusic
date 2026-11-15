/* ESCIE WORLD LIVE BRIDGE
 * The public World receives a minimal experience state from Central/Supabase.
 * It never receives private records, credentials, or Central internals.
 */
(function(root){
  "use strict";
  const API="https://ljdkjzvnwnaluevtzker.supabase.co/functions/v1/escie-public";
  const state={status:"LOADING",data:null,error:null};
  root.ESCIE_WORLD_LIVE=state;

  function normalize(body){
    const world=body&&body.world&&typeof body.world==="object"?body.world:{};
    const env=world.environment&&typeof world.environment==="object"?world.environment:{};
    return {
      place:world.place||null,
      encounter:world.encounter||null,
      contents:Array.isArray(world.contents)?world.contents:[],
      discoveries:Array.isArray(world.discoveries)?world.discoveries:[],
      environment:env,
      available_actions:Array.isArray(world.available_actions)?world.available_actions:["RETURN","EXPLORE"],
      trace_state:world.trace_state||null,
      engine:world.engine||{}
    };
  }

  function apply(data){
    const env=data.environment||{};
    const visual=env.visual_state&&typeof env.visual_state==="object"?env.visual_state:{};
    const html=document.documentElement;
    html.dataset.worldWeather=String(env.weather||"UNKNOWN").toLowerCase();
    html.dataset.worldSeason=String(env.season||"UNKNOWN").toLowerCase();
    html.dataset.worldLight=String(visual.light||env.daylight||"UNKNOWN").toLowerCase();
    html.dataset.worldSurface=String(visual.surface||"NATURAL").toLowerCase();
    html.dataset.worldSignal=String(visual.signal||"AMBIENT").toLowerCase();
    root.dispatchEvent(new CustomEvent("escie:world-state",{detail:data}));
  }

  async function load(recordId){
    const record=String(recordId||"montreal").trim()||"montreal";
    const session=(function(){
      try{
        let id=sessionStorage.getItem("escie-world-session");
        if(!id){
          id=(typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function")?crypto.randomUUID():"world-"+Date.now()+"-"+Math.random().toString(36).slice(2);
          sessionStorage.setItem("escie-world-session",id);
        }
        return id;
      }catch(_e){return "";}
    })();

    try{
      const response=await fetch(API+"?mode=world&record="+encodeURIComponent(record)+"&session="+encodeURIComponent(session),{
        headers:{Accept:"application/json"},
        cache:"no-store"
      });
      if(!response.ok)throw Error("WORLD_STATE_HTTP_"+response.status);
      const data=normalize(await response.json());
      state.data=data;
      state.status="READY";
      apply(data);
      return data;
    }catch(error){
      state.status="OFFLINE";
      state.error=String(error&&error.message||error);
      root.dispatchEvent(new CustomEvent("escie:world-state",{detail:null}));
      return null;
    }
  }

  state.navigate=async function(recordId){
    const data=await load(recordId);
    if(data)apply(data);
    return data;
  };
  state.ready=load("montreal");
})(window);
