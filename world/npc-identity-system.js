(()=>{"use strict";
const KEY="escie_world_identity_v1";
const NAMES={en:["Alex","Jordan","Taylor","Morgan","Sam","Chris","Jamie","Riley","Avery","Dylan"],fr:["Alex","Mathieu","Camille","Julien","Élodie","Maxime","Nicolas","Amélie","Gabriel","Sophie"],es:["Alex","Diego","Sofía","Mateo","Valeria","Luis","Camila","Javier","Lucía","Andrés"],ar:["Omar","Mariam","Youssef","Nour","Karim","Lina"],bn:["Rahim","Nadia","Hasan","Maya","Imran","Riya"],ur:["Ali","Ayesha","Hassan","Sara","Usman","Zara"]};
const PERSONALITIES=["CALM","SOCIABLE","PRIVATE","AMBITIOUS","CAUTIOUS","CURIOUS","IMPULSIVE","OBSERVANT","GENEROUS","GUARDED"];
const INCOME=["LOW","LOW_MIDDLE","MIDDLE","UPPER_MIDDLE"];
const hash=s=>String(s||"").split("").reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),17);
function profile(n={}){const h=hash(n.id||n.role||"npc"),lang=n.native_language||n.nativeLanguage||"en";const names=NAMES[lang]||NAMES.en;return {name:n.name||names[h%names.length],age:18+(h%55),personality:PERSONALITIES[h%PERSONALITIES.length],incomeBand:INCOME[h%INCOME.length],seed:h};}
function remember(id,patch={}){const s=JSON.parse(localStorage.getItem(KEY)||"{}");s[id]=Object.assign({},s[id]||{},patch);localStorage.setItem(KEY,JSON.stringify(s));return s[id];}
window.ESCIE_WORLD_IDENTITY={profile,remember,personalities:PERSONALITIES,incomeBands:INCOME};
})();