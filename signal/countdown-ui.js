/* ESCIE SIGNAL — public countdown controller */
(function(root){
  "use strict";
  function render(now=new Date()){
    const el=document.querySelector("[data-escie-countdown]");
    const timer=root.ESCIE_COUNTDOWN;
    if(!el||!timer)return;
    const status=el.querySelector("[data-countdown-status]");
    const value=el.querySelector("[data-countdown-value]");
    if(timer.expired(now)){
      el.hidden=false;
      if(status)status.textContent="SIGNAL ARRIVED";
      if(value)value.textContent="00:00:00:00";
      return;
    }
    if(!timer.active(now)){el.hidden=true;return;}
    el.hidden=false;
    if(status)status.textContent="NEXT TRANSMISSION";
    if(value)value.textContent=timer.display(now)||"00:00:00:00";
  }
  function start(){
    render();
    root.setInterval(function(){render();},1000);
  }
  root.ESCIE_COUNTDOWN_UI={render,start};
  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
    else start();
  }
})(typeof window!=="undefined"?window:globalThis);
