/* ESCIE THE WORLD · Equipment / combat registry · local-first, expandable */
(()=>{"use strict";
const KEY="escie_world_equipment_v1";
const ITEMS={
 FISTS:{id:"FISTS",type:"WEAPON",slot:"HAND",label:"FISTS",damage:9,range:1,stamina:10,price:0,owned:true,durability:Infinity},
 POCKET_KNIFE:{id:"POCKET_KNIFE",type:"WEAPON",slot:"HAND",label:"POCKET KNIFE",damage:14,range:1,stamina:11,price:35,durability:80},
 BAT:{id:"BAT",type:"WEAPON",slot:"HAND",label:"BASEBALL BAT",damage:22,range:1,stamina:16,price:60,durability:120},
 HOODIE:{id:"HOODIE",type:"ARMOR",slot:"BODY",label:"HOODIE",armor:3,price:40,durability:100},
 JACKET:{id:"JACKET",type:"ARMOR",slot:"BODY",label:"HEAVY JACKET",armor:8,price:90,durability:140}
};
const DEFAULT={owned:["FISTS"],equipped:{HAND:"FISTS",BODY:null},durability:{FISTS:Infinity}};
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"null");return v&&Array.isArray(v.owned)?v:structuredClone(DEFAULT)}catch(e){return structuredClone(DEFAULT)}};
const save=s=>{try{const raw=JSON.stringify(s);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw new Error("SAVE_VERIFY_FAILED:"+KEY);return s}catch(e){return null}};
const item=id=>ITEMS[String(id||"").toUpperCase()]||null;
const owned=id=>read().owned.includes(String(id).toUpperCase());
const ensureDurability=s=>{s.durability=s.durability&&typeof s.durability==="object"?s.durability:{};s.owned.forEach(id=>{const i=item(id);if(i&&!Object.prototype.hasOwnProperty.call(s.durability,id))s.durability[id]=i.durability===Infinity?Infinity:Number(i.durability||100)});return s};
const equip=id=>{const s=ensureDurability(read()),i=item(id);if(!i||!s.owned.includes(i.id))return {ok:false,reason:"NOT_OWNED"};
 if(i.durability!==Infinity&&Number(s.durability[i.id]||0)<=0)return {ok:false,reason:"BROKEN"};s.equipped[i.slot]=i.id;if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,item:i,state:s}};
const acquire=(id)=>{const s=ensureDurability(read()),i=item(id);if(!i)return {ok:false,reason:"UNKNOWN_ITEM"};if(!s.owned.includes(i.id))s.owned.push(i.id);s.durability[i.id]=i.durability===Infinity?Infinity:Number(i.durability||100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,item:i,state:s}};
const unequip=id=>{const s=ensureDurability(read()),i=item(id);if(!i||!s.owned.includes(i.id))return {ok:false,reason:"NOT_OWNED"};if(i.slot==="HAND")s.equipped.HAND="FISTS";else if(i.slot==="BODY")s.equipped.BODY=null;else return {ok:false,reason:"UNSUPPORTED_SLOT"};if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,item:i,state:s}};
const weapon=()=>item(read().equipped.HAND)||ITEMS.FISTS;
const armor=()=>{const s=ensureDurability(read()),i=item(s.equipped.BODY);return i&&Number(s.durability[i.id]||0)>0?Number(i.armor||0):0};
const consume=(id,amount=1)=>{const s=ensureDurability(read()),i=item(id);if(!i||i.durability===Infinity)return {ok:true,remaining:Infinity};s.durability[i.id]=Math.max(0,Number(s.durability[i.id]||0)-Math.max(0,Number(amount)||0));if(s.durability[i.id]<=0&&s.equipped[i.slot]===i.id)s.equipped[i.slot]=i.slot==="HAND"?"FISTS":null;if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,remaining:s.durability[i.id],broken:s.durability[i.id]<=0,item:i}};
const durability=(id)=>{const s=ensureDurability(read()),i=item(id);return i?(i.durability===Infinity?Infinity:Number(s.durability[i.id]??i.durability??0)):0};
const damage=(targetArmor=0)=>Math.max(1,Math.round(Number(weapon().damage||9)*(1-Math.min(.6,Number(targetArmor||0)/100))));
const describe=()=>{const s=ensureDurability(read());return {owned:s.owned.map(id=>item(id)).filter(Boolean).map(i=>Object.assign({},i,{current_durability:durability(i.id)})),equipped:{hand:item(s.equipped.HAND),body:item(s.equipped.BODY)},durability:s.durability}};
window.ESCIE_WORLD_EQUIPMENT={state:read,items:ITEMS,item,owned,equip,unequip,acquire,weapon,armor,damage,consume,durability,describe};
})();