/* ESCIE — first-contact World globe */
(function(){
  "use strict";
  function init(){
    var globe=document.querySelector(".entry-world-globe .world-globe");
    if(!globe || globe.dataset.ready==="1") return;
    globe.dataset.ready="1";
    var down=false,startX=0,startY=0,rx=0,ry=0;
    function apply(){
      globe.style.animation="none";
      globe.style.transform="rotateX("+rx+"deg) rotateY("+ry+"deg)";
    }
    function stop(e){
      down=false;
      try{if(e)globe.releasePointerCapture(e.pointerId);}catch(_){}
      globe.classList.remove("is-dragging");
      apply();
    }
    globe.addEventListener("pointerdown",function(e){
      if(e.target.closest("a")) return;
      down=true;startX=e.clientX;startY=e.clientY;
      try{globe.setPointerCapture(e.pointerId);}catch(_){}
      globe.classList.add("is-dragging");
      e.preventDefault();
    });
    globe.addEventListener("pointermove",function(e){
      if(!down)return;
      ry+=(e.clientX-startX)*.35;
      rx-=(e.clientY-startY)*.2;
      startX=e.clientX;startY=e.clientY;
      apply();
    });
    globe.addEventListener("pointerup",stop);
    globe.addEventListener("pointercancel",stop);
    globe.addEventListener("dblclick",function(){
      rx=0;ry=0;globe.style.animation="";
      globe.style.transform="";
    });
    globe.addEventListener("keydown",function(e){
      if(e.key==="Escape"){
        rx=0;ry=0;globe.style.animation="";
        globe.style.transform="";
        globe.focus();
      }
      if(e.key==="ArrowRight" || e.key==="ArrowLeft"){
        e.preventDefault();
        ry+=e.key==="ArrowRight"?18:-18;
        apply();
      }
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();