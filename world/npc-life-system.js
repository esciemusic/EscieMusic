(()=>{"use strict";
const KEY="escie_world_npc_life_v1";
const DEFAULT={npcs:{},events:[]};
const read=()=>{try{return Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return JSON.parse(JSON.stringify(DEFAULT))}};
const save=s=>{try{const raw=JSON.stringify(s);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw new Error("SAVE_VERIFY_FAILED:"+KEY);return s}catch(e){return null}};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
const hash=(id)=>{let h=0;for(let i=0;i<String(id).length;i++)h=((h<<5)-h)+String(id).charCodeAt(i)|0;return Math.abs(h)};
const GOALS=["STABILITY","MONEY","CREATIVE","FAMILY","HEALTH","SOCIAL","FREEDOM","KNOWLEDGE"];
const tiers=id=>{const h=hash(id)%100;if(String(id)==="witness"||h<8)return "FEATURED";if(h<32)return "SIMULATED";return "GENERIC"};
const seed=(n)=>{
 const h=hash(n.id),income=n.income_band||"MIDDLE";
 const baseMoney={LOW:80,LOW_MIDDLE:180,MIDDLE:420,UPPER_MIDDLE:900}[income]||180;
 return {hunger:65+(h%25),energy:70+((h>>2)%25),health:100,stress:8+(h%18),social:35+(h%35),money:baseMoney,
  bills:Math.max(10,Math.round(baseMoney*.08)),goal:GOALS[h%GOALS.length],motivation:45+(h%45),
  family:(h%3===0),friends:[],memories:[],last_income_day:0,last_need_day:0,life_state:"STABLE"};
};
const ensure=(n)=>{
 const tier=n.simulation_tier||tiers(n.id);const s=read();s.npcs=s.npcs||{};const existing=s.npcs[n.id]||{};
 if(tier==="GENERIC"){delete existing.life;existing.simulation_tier=tier;s.npcs[n.id]=existing;save(s);return null;}
 const life=Object.assign(seed(n),existing.life||{},{
  goal:existing.life?.goal||GOALS[hash(n.id)%GOALS.length],
  money:Number(existing.life?.money??seed(n).money),
  health:clamp(existing.life?.health??100),
  hunger:clamp(existing.life?.hunger??70),energy:clamp(existing.life?.energy??80),
  stress:clamp(existing.life?.stress??15),social:clamp(existing.life?.social??45)
 });
 existing.life=life;existing.simulation_tier=tier;s.npcs[n.id]=existing;save(s);return life;
};
const profile=id=>{const s=read();return s.npcs?.[id]?.life||null};
const remember=(id,memory)=>{
 const s=read(),n=s.npcs?.[id];if(!n)return null;if((n.simulation_tier||tiers(id))==="GENERIC")return null;n.life=n.life||seed(n);n.life.memories=(n.life.memories||[]).concat([Object.assign({},memory,{day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1})]).slice(-30);save(s);return n.life;
};
const relationship=(id,delta,reason)=>{
 const api=window.ESCIE_WORLD_NPC;if(!api)return null;const n=api.state()?.npcs?.[id];if(!n)return null;if((n.simulation_tier||tiers(id))==="GENERIC")return null;n.links=n.links||{};n.life=n.life||ensure(n);
 const player=Number(n.relationship||0)+Number(delta||0);const next=Math.max(-100,Math.min(100,player));
 if(typeof api.relationship==="function")api.relationship(id,next-Number(n.relationship||0),reason);else n.relationship=next;
 const fresh=api.state()?.npcs?.[id]||n;const ls=read();ls.npcs=ls.npcs||{};ls.npcs[id]=Object.assign(ls.npcs[id]||{}, {relationship:Number(fresh.relationship||next)});save(ls);
 return Number(fresh.relationship||next);
};
const chooseActivity=(n,s)=>{
 const l=n.life||ensure(n),now=s.hour*60+s.minute;
 if(l.hunger<25)return "EAT";
 if(l.energy<20)return "REST";
 if(l.stress>80)return "REST";
 if(l.goal==="SOCIAL"&&now>=1020&&now<1260)return "SOCIAL";
 if(l.goal==="HEALTH"&&now>=540&&now<1140)return "TRAIN";
 if(l.goal==="CREATIVE"&&n.role==="MUSICIAN"&&now>=540&&now<1140)return "CREATE";
 if(now>=360&&now<1020)return "WORK";
 return "ROUTINE";
};
const tick=(minutes=30)=>{
 const sim=window.ESCIE_WORLD_SIMULATION,ss=sim?.state?.();if(!ss)return {ok:false};
 const s=read();s.npcs=s.npcs||{};
 Object.values(s.npcs).forEach(n=>{
  if(!n?.id)return;const tier=n.simulation_tier||tiers(n.id);if(tier==="GENERIC")return;const l=n.life||ensure(n);const beforeDay=l.last_need_day||ss.day;
  const m=Math.max(1,Number(minutes)||30);
  l.hunger=clamp(l.hunger-m/180);l.energy=clamp(l.energy-m/260);l.social=clamp(l.social-m/720);
  l.stress=clamp(l.stress+m/120-(l.social>55?0.5:0));
  if(ss.day!==beforeDay){l.money+=Math.max(0,Number(l.money||0)*0.01);l.last_need_day=ss.day}
  const activity=chooseActivity(n,ss);l.life_state=activity;
  if(activity==="WORK"){const pay={LOW:18,LOW_MIDDLE:25,MIDDLE:35,UPPER_MIDDLE:50}[n.income_band]||25;l.money+=pay*m/120;l.energy=clamp(l.energy-5);l.stress=clamp(l.stress+2)}
  if(activity==="EAT"){l.hunger=clamp(l.hunger+28);l.money=Math.max(0,l.money-8)}
  if(activity==="REST"){l.energy=clamp(l.energy+12);l.stress=clamp(l.stress-5)}
  if(activity==="SOCIAL"){l.social=clamp(l.social+10);l.stress=clamp(l.stress-6)}
  if(activity==="TRAIN"){l.energy=clamp(l.energy-7);l.health=clamp(l.health+0.4);l.stress=clamp(l.stress+1)}
  if(activity==="CREATE"){l.social=clamp(l.social+2);l.stress=clamp(l.stress-2)}
  if(l.hunger<10||l.energy<10||l.health<40)l.life_state="STRUGGLING";
  if(l.money<20)l.life_state="FINANCIALLY_STRESSED";
 });
 save(s);return {ok:true,count:Object.keys(s.npcs).length};
};
const syncRelationships=()=>{
 const api=window.ESCIE_WORLD_NPC;if(!api)return 0;const s=read(),all=api.state()?.npcs||{};let count=0;
 Object.values(all).forEach(n=>{const l=s.npcs?.[n.id]?.life;if(!l)return;n.life=l;n.life.relationships=n.life.relationships||{};Object.keys(n.links||{}).forEach(id=>n.life.relationships[id]=n.links[id]);count++});save(s);return count;
};
const promote=(id,reason="PLAYER_INTERACTION")=>{const s=read(),n=s.npcs?.[id];if(!n)return null;if((n.simulation_tier||tiers(id))==="FEATURED")return n;n.simulation_tier="SIMULATED";n.engagement=Object.assign({score:0,reasons:[]},n.engagement||{});n.engagement.score+=1;n.engagement.reasons=(n.engagement.reasons||[]).concat(reason).slice(-20);save(s);ensure(n);return s.npcs[id];};
const feature=(id,reason="STORY_IMPORTANCE")=>{const s=read(),n=s.npcs?.[id];if(!n)return null;n.simulation_tier="FEATURED";n.engagement=Object.assign({score:0,reasons:[]},n.engagement||{});n.engagement.score+=5;n.engagement.reasons=(n.engagement.reasons||[]).concat(reason).slice(-20);save(s);ensure(n);return s.npcs[id];};
const engage=(id,reason="INTERACTION")=>{const s=read(),n=s.npcs?.[id];if(!n)return null;n.engagement=Object.assign({score:0,reasons:[]},n.engagement||{});n.engagement.score+=1;n.engagement.reasons=(n.engagement.reasons||[]).concat(reason).slice(-20);if((n.simulation_tier||tiers(id))==="GENERIC"&&n.engagement.score>=2)n.simulation_tier="SIMULATED";save(s);if(n.simulation_tier!=="GENERIC")ensure(n);return s.npcs[id];};
const goalFor=id=>profile(id)?.goal||null;
window.ESCIE_WORLD_NPC_LIFE={state:read,ensure,profile,tick,remember,relationship,syncRelationships,goalFor,goals:GOALS,tiers,featureLevels:["GENERIC","SIMULATED","FEATURED"],promote,feature,engage};
if(!localStorage.getItem(KEY))save(DEFAULT);
})();