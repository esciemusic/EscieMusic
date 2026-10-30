/* ESCIE PERFORMANCE BUDGET — shared runtime scheduling primitives.
 * Keeps expensive work off the hottest loop and lets each layer spend its budget where it matters.
 */
(function(root){
  "use strict";
  const raf=root.requestAnimationFrame?root.requestAnimationFrame.bind(root):(fn=>root.setTimeout(fn,16));
  const caf=root.cancelAnimationFrame?root.cancelAnimationFrame.bind(root):(id=>root.clearTimeout(id));
  const PERF={
    version:"1.0.0",
    budgets:Object.freeze({
      PUBLIC_RENDER_MS:12,
      PUBLIC_IDLE_MS:50,
      GAME_FRAME_MS:16.7,
      GAME_ENVIRONMENT_MS:66,
      GAME_HUD_MS:120,
      GAME_WORLD_HEARTBEAT_MS:5000,
      GAME_NPC_HEARTBEAT_MS:30000
    }),
    now:()=>typeof performance!=="undefined"&&performance.now?performance.now():Date.now(),
    throttle(fn,interval){
      let last=-Infinity,timer=0,lastArgs,lastThis;
      const wrapped=function(){
        lastArgs=arguments;lastThis=this;
        const n=PERF.now(),remaining=interval-(n-last);
        if(remaining<=0){last=n;return fn.apply(lastThis,lastArgs);}
        if(!timer)timer=root.setTimeout(function(){timer=0;last=PERF.now();fn.apply(lastThis,lastArgs);},remaining);
      };
      wrapped.cancel=()=>{if(timer)root.clearTimeout(timer);timer=0;};
      return wrapped;
    },
    idle(fn,timeout=1000){
      if(typeof root.requestIdleCallback==="function")return root.requestIdleCallback(fn,{timeout});
      return root.setTimeout(fn,Math.min(timeout,250));
    },
    frame(fn){
      let id=0,active=true;
      const loop=t=>{if(!active)return;fn(t);id=raf(loop);};
      id=raf(loop);
      return {stop(){active=false;if(id)caf(id);}};
    },
    validate(){
      const b=this.budgets,errors=[];
      Object.keys(b).forEach(k=>{if(!Number.isFinite(b[k])||b[k]<=0)errors.push(k+" invalid");});
      return {ok:errors.length===0,errors,version:this.version};
    }
  };
  root.ESCIE_PERFORMANCE=PERF;
  if(typeof module!=="undefined"&&module.exports)module.exports=PERF;
})(typeof window!=="undefined"?window:globalThis);
