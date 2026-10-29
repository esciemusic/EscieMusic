/* ESCIE THE WORLD · Equipment / combat registry · local-first, expandable */
(()=>{"use strict";
const KEY="escie_world_equipment_v1";
const ITEMS={
 FISTS:{id:"FISTS",type:"WEAPON",slot:"HAND",label:"FISTS",damage:9,range:1,stamina:10,price:0,owned:true},
 POCKET_KNIFE:{id:"POCKET_KNIFE",type:"WEAPON",slot:"HAND",label:"POCKET KNIFE",damage:14,range:1,stamina:11,price:35},
 BAT:{id:"BAT",type:"WEAPON",slot:"HAND",label:"BASEBALL BAT",damage:22,range:1,stamina:16,price:60},
 HOODIE:{id:"HOODIE",type:"ARMOR",slot:"BODY",label:"HOODIE",armor:3,price:25},
 JACKET:{id:"JACKET",type:"ARMOR",slot:"BODY",label:"HEAVY JACKET",armor:8,price:90}
};
const DEFAULT={owned:["FISTS"],equipped:{HAND:"FISTS",BODY:null}};
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"null");return v&&Array.isArray(v.owned)?v:structuredClone(DEFAULT)}catch(e){return structuredClone(DEFAULT)}};
const save=s=>{try{const raw=JSON.stringify(s);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw new Error("SAVE_VERIFY_FAILED:"+KEY);return s}catch(e){return null}};
const item=id=>ITEMS[String(id||"").toUpperCase()]||null;
const owned=id=>read().owned.includes(String(id).toUpperCase());
const equip=id=>{const s=read(),i=item(id);if(!i||!s.owned.includes(i.id))return {ok:false,reason:"NOT_OWNED"};s.equipped[i.slot]=i.id;save(s);return {ok:true,item:i,state:s}};
const acquire=(id)=>{const s=read(),i=item(id);if(!i)return {ok:false,reason:"UNKNOWN_ITEM"};if(!s.owned.includes(i.id))s.owned.push(i.id);save(s);return {ok:true,item:i,state:s}};
const weapon=()=>item(read().equipped.HAND)||ITEMS.FISTS;
const armor=()=>{const i=item(read().equipped.BODY);return Number(i?.armor||0)};
const damage=(targetArmor=0)=>Math.max(1,Math.round(Number(weapon().damage||9)*(1-Math.min(.6,Number(targetArmor||0)/100))));
const describe=()=>{const s=read();return {owned:s.owned.map(id=>item(id)).filter(Boolean),equipped:{hand:item(s.equipped.HAND),body:item(s.equipped.BODY)}}};
window.ESCIE_WORLD_EQUIPMENT={state:read,items:ITEMS,item,owned,equip,acquire,weapon,armor,damage,describe};
})();