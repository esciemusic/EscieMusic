/* ESCIE CURRENT SIGNAL / PRESENT STATE
 * Quiet factual signal for the hero.
 * The state informs atmosphere; it does not compete with the identity.
 */
(function(root){
  "use strict";

  const MONTHS=["JAN.","FEB.","MAR.","APR.","MAY","JUN.","JUL.","AUG.","SEP.","OCT.","NOV.","DEC."];
  const DAYS=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];

  function title(value){
    const raw=String(value==null?"":value).trim().replace(/_/g," ");
    return raw ? raw.toLowerCase().replace(/\b\w/g,function(c){return c.toUpperCase();}) : "";
  }

  function getNumber(source, keys){
    for(const key of keys){
      const value=source&&source[key];
      if(value!==null&&value!==undefined&&value!==""&&Number.isFinite(Number(value))) return Number(value);
    }
    return null;
  }

  function daylightState(date){
    const h=date.getHours()+date.getMinutes()/60;
    if(h<5.5||h>=21) return "NIGHT";
    if(h<7) return "DAWN";
    if(h>=18.5) return "NIGHT";
    return "DAY";
  }

  function render(data){
    const rootEl=document.getElementById("hero-present-state");
    const timeEl=document.getElementById("hero-present-time");
    const conditionsEl=document.getElementById("hero-present-conditions");
    if(!rootEl||!timeEl||!conditionsEl)return;

    const now=new Date();
    const env=data&&data.environment&&typeof data.environment==="object"?data.environment:{};
    const visual=env.visual_state&&typeof env.visual_state==="object"?env.visual_state:{};
    const time=new Intl.DateTimeFormat("en-CA",{hour:"numeric",minute:"2-digit",hour12:true}).format(now).toUpperCase();
    const date=timeEl.dataset.liveDate||[MONTHS[now.getMonth()],String(now.getDate())].join(" ");
    const light=String(visual.light||env.daylight||daylightState(now)).toUpperCase();

    timeEl.textContent=time+" · "+date+" · "+light;

    const temp=getNumber(env,["temperature_c","temperatureC","temp_c","tempC","temperature"]);
    const weather=title(env.weather||env.condition||env.conditions||"");
    const pieces=[];
    if(temp!==null) pieces.push(Math.round(temp)+"°C");
    if(weather) pieces.push(weather.toUpperCase());
    if(!pieces.length) pieces.push("MONTRÉAL");
    conditionsEl.textContent=pieces.join(" · ");

    rootEl.dataset.presentLight=light.toLowerCase();
    rootEl.dataset.presentWeather=String(env.weather||"unknown").toLowerCase().replace(/\s+/g,"-");
  }

  function setDate(){
    const now=new Date();
    const dateEl=document.getElementById("hero-present-time");
    if(dateEl) dateEl.dataset.liveDate=MONTHS[now.getMonth()]+" "+now.getDate();
  }

  setDate();
  render(null);

  root.addEventListener("escie:world-state",function(event){
    render(event&&event.detail?event.detail:null);
  });

  function scheduleMinuteRefresh(){
    const now=new Date();
    const delay=Math.max(1000,60000-(now.getSeconds()*1000+now.getMilliseconds()));
    setTimeout(function(){
      setDate();
      render(root.ESCIE_WORLD_LIVE&&root.ESCIE_WORLD_LIVE.data||null);
      scheduleMinuteRefresh();
    },delay);
  }

  scheduleMinuteRefresh();
})(window);
