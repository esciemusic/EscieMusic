/* ESCIE — first-contact World globe */
(function(){
  "use strict";
  function init(){
    var globe=document.querySelector(".entry-world-globe .world-globe");
    if(!globe || globe.dataset.ready==="1") return;
    globe.dataset.ready="1";
    var down=false,startX=0,startY=0,rx=0,ry=0,vy=0,vx=0,lastTime=0,inertiaFrame=0;
    function apply(){
      globe.style.animation="none";
      globe.style.transform="rotateX("+rx+"deg) rotateY("+ry+"deg)";
    }
    function stop(e){
      down=false;
      try{if(e)globe.releasePointerCapture(e.pointerId);}catch(_){}
      globe.classList.remove("is-dragging");
      if(Math.abs(vy)>0.05 || Math.abs(vx)>0.05)startInertia(); else apply();
    }
    function startInertia(){
      cancelAnimationFrame(inertiaFrame);
      var last=performance.now();
      function step(now){
        var dt=Math.min(32,now-last);last=now;
        if(down)return;
        ry+=vy*(dt/16);rx+=vx*(dt/16);
        vy*=Math.pow(.94,dt/16);vx*=Math.pow(.94,dt/16);
        apply();
        if(Math.abs(vy)>0.05 || Math.abs(vx)>0.05)inertiaFrame=requestAnimationFrame(step);
        else {vy=0;vx=0;}
      }
      inertiaFrame=requestAnimationFrame(step);
    }
    globe.addEventListener("pointerdown",function(e){
      if(e.target.closest("a")) return;
      cancelAnimationFrame(inertiaFrame);vy=0;vx=0;down=true;startX=e.clientX;startY=e.clientY;lastTime=performance.now();
      try{globe.setPointerCapture(e.pointerId);}catch(_){}
      globe.classList.add("is-dragging");
      e.preventDefault();
    });
    globe.addEventListener("pointermove",function(e){
      if(!down)return;
      var now=performance.now(),dt=Math.max(8,now-lastTime),dx=e.clientX-startX,dy=e.clientY-startY;
      ry+=dx*.35;
      rx-=dy*.2;
      vy=(-dy*.2)/(dt/16);
      vx=(dx*.35)/(dt/16);
      startX=e.clientX;startY=e.clientY;lastTime=now;
      apply();
    });
    globe.addEventListener("pointerup",stop);
    globe.addEventListener("pointercancel",stop);
    globe.addEventListener("dblclick",function(){
      cancelAnimationFrame(inertiaFrame);vy=0;vx=0;rx=0;ry=0;globe.style.animation="";
      globe.style.transform="";
    });
    globe.addEventListener("keydown",function(e){
      if(e.key==="Escape"){
        cancelAnimationFrame(inertiaFrame);vy=0;vx=0;rx=0;ry=0;globe.style.animation="";
        globe.style.transform="";
        globe.focus();
      }
      if(e.key==="ArrowRight" || e.key==="ArrowLeft"){
        cancelAnimationFrame(inertiaFrame);vy=0;vx=0;
        e.preventDefault();
        ry+=e.key==="ArrowRight"?18:-18;
        apply();
      }
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();