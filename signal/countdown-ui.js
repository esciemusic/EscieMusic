/* ESCIE SIGNAL — public countdown controller */
(function(root){
  "use strict";
  const CONFIG=Object.freeze({
    start:"2026-10-31T00:00:00-04:00",
    target:"2026-11-22T00:00:00-05:00",
    label:"NEXT TRANSMISSION",
    storageKey:"escie-countdown-seen-v1"
  });

  function date(value){const d=new Date(value);return Number.isNaN(d.getTime())?null:d;}
  function active(now=new Date()){
    const n=new Date(now),s=date(CONFIG.start),t=date(CONFIG.target);
    return !!s&&!!t&&n.getTime()>=s.getTime()&&n.getTime()<t.getTime();
  }
  function expired(now=new Date()){const t=date(CONFIG.target);return !!t&&new Date(now).getTime()>=t.getTime();}
  function render(now=new Date()){
    const rootEl=document.querySelector("[data-escie-countdown]");
    if(!rootEl)return;
    const status=rootEl.querySelector("[data-countdown-status]");
    const value=rootEl.querySelector("[data-countdown-value]");
    if(expired(now)){rootEl.hidden=false;if(status)status.textContent="SIGNAL ARRIVED";if(value)value.textContent="00:00:00:00";return;}
    if(!active(now)){rootEl.hidden=true;return;}
    const remaining=Math.max(0,date(CONFIG.target).getTime()-new Date(now).getTime());
    const s=Math.floor(remaining/1000);
    const days=Math.floor(s/86400),hours=Math.floor((s%86400)/3600),minutes=Math.floor((s%3600)/60),seconds=s%60;
    rootEl.hidden=false;
    if(status)status.textContent=CONFIG.label;
    if(value)value.textContent=[days,hours,minutes,seconds].map((x,i)=>String(x).padStart(i===0?2:2,"0")).join(":");
  }
  function start(){
    render();
    window.setInterval(()=>render(),1000);
  }
  root.ESCIE_COUNTDOWN_CONFIG=CONFIG;
  root.ESCIE_COUNTDOWN_UI={active,expired,render,start};
  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
    else start();
  }
})(typeof window!=="undefined"?window:globalThis);
