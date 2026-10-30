/*
 * ESCIE SIGNAL — COUNTDOWN
 * Temporal presentation only. It never creates or mutates canon.
 */
const ESCIE_COUNTDOWN = {
  version:"2.0.0",
  start:new Date("2026-10-31T00:00:00-04:00"),
  target:new Date("2026-11-22T00:00:00-05:00"),
  configure(target,start){
    const t=target?new Date(target):this.target;
    const s=start?new Date(start):this.start;
    if(Number.isNaN(t.getTime())||Number.isNaN(s.getTime())||t.getTime()<=s.getTime())throw new Error("Invalid countdown window.");
    this.target=t;this.start=s;return this;
  },
  active(now=new Date()){
    const n=new Date(now);
    return !Number.isNaN(n.getTime())&&n.getTime()>=this.start.getTime()&&n.getTime()<this.target.getTime();
  },
  remaining(now=new Date()){
    if(!this.active(now))return this.expired(now)?0:null;
    return Math.max(0,this.target.getTime()-new Date(now).getTime());
  },
  expired(now=new Date()){
    const n=new Date(now);
    return !Number.isNaN(n.getTime())&&n.getTime()>=this.target.getTime();
  },
  parts(now=new Date()){
    const ms=this.remaining(now);if(ms===null)return null;
    const totalSeconds=Math.floor(ms/1000);
    return {days:Math.floor(totalSeconds/86400),hours:Math.floor((totalSeconds%86400)/3600),minutes:Math.floor((totalSeconds%3600)/60),seconds:totalSeconds%60,milliseconds:ms%1000};
  },
  display(now=new Date()){
    const p=this.parts(now);if(!p)return null;
    return [p.days,p.hours,p.minutes,p.seconds].map(x=>String(x).padStart(2,"0")).join(":");
  }
};
if(typeof window!=="undefined")window.ESCIE_COUNTDOWN=ESCIE_COUNTDOWN;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_COUNTDOWN;
