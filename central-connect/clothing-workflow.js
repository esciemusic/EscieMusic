/*
 * ESCIE CENTRAL — WARDROBE WORKFLOW
 * Operational clothing pipeline. No commerce assumptions, no public-write authority.
 */
(function(){
  "use strict";
  const KEY="escie_central_wardrobe_v2";
  const SAMPLE_STATES=["REQUESTED","RECEIVED","FIT_REVIEW","WASH_TEST","QC_REVIEW","APPROVED","REJECTED"];
  const STAGES=["DESIGN_READY","SAMPLE_REQUESTED","SAMPLE_RECEIVED","FIT_REVIEW","WASH_TEST","PHOTO_READY","PREORDER_READY","PRODUCTION","RELEASED"];
  const CHECKS=[
    ["spec","Confirm garment, fabric, GSM target, fit and decoration."],
    ["supplier","Record supplier/printer candidate and quote; no commitment is implied."],
    ["sample","Request one physical sample before any quantity decision."],
    ["fit","Wear-test fit, construction, print placement and comfort."],
    ["wash","Wash-test and inspect shrinkage, print, seams and hand feel."],
    ["photo","Photograph the actual approved sample."],
    ["preorder","Only open preorder after sample approval and cost review."],
    ["production","Confirm quantity, size curve, decoration and QC plan."],
    ["release","Release only the approved physical version."]
  ];
  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{};}catch(e){return {};}
  }
  function write(state){
    try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}
  }
  function items(){
    const list=Array.isArray(window.ESCIE_CLOTHING)?window.ESCIE_CLOTHING:[];
    const state=read();
    return list.map(item=>{
      const saved=state[item.id]||{};
      return Object.assign({},item,{workflow:{
        stage:saved.stage||item.production_stage||"DESIGN_READY",
        checks:Object.assign({},saved.checks||{}),
        supplier:saved.supplier||"",
        quote:saved.quote||"",
        sample_request:saved.sample_request||"",
        sample_received:saved.sample_received||"",
        fit_notes:saved.fit_notes||"",
        wash_notes:saved.wash_notes||"",
        photo:saved.photo||"",
        quantity:saved.quantity||"",
        size_curve:saved.size_curve||"",
        production_notes:saved.production_notes||"",
        release_notes:saved.release_notes||"",
        history:Array.isArray(saved.history)?saved.history.slice():[],
        samples:Array.isArray(saved.samples)?saved.samples.slice():[],
        updated_at:saved.updated_at||"",
        specification:saved.specification||item.specification||{}
      }}); 
    });
  }
  function stageIndex(stage){const i=STAGES.indexOf(stage);return i<0?0:i;}
  function gate(item,stage){
    const w=item.workflow, i=stageIndex(stage);
    const checks=w.checks||{};
    if(i>=stageIndex("PREORDER_READY")&&!checks.spec) return "Complete the spec check first.";
    if(i>=stageIndex("SAMPLE_REQUESTED")&&!w.supplier) return "Add a supplier/printer candidate before requesting a sample.";
    if(i>=stageIndex("SAMPLE_REQUESTED")&&!w.quote) return "Record a quote before requesting a sample.";
    if(i>=stageIndex("SAMPLE_RECEIVED")&&!w.sample_request) return "Record the sample request before marking it received.";
    if(i>=stageIndex("SAMPLE_RECEIVED")&&!w.samples.some(s=>s&&["RECEIVED","FIT_REVIEW","WASH_TEST","APPROVED"].includes(s.state))) return "Create and receive a physical sample before advancing.";
    if(i>=stageIndex("FIT_REVIEW")&&!w.samples.some(s=>s&&["FIT_REVIEW","WASH_TEST","APPROVED"].includes(s.state))) return "Move a physical sample into FIT REVIEW before advancing.";
    if(i>=stageIndex("WASH_TEST")&&!w.samples.some(s=>s&&["WASH_TEST","APPROVED"].includes(s.state))) return "Move a physical sample into WASH TEST before advancing.";

    if(i>=stageIndex("FIT_REVIEW")&&!w.sample_received) return "Record the received sample before fit review.";
    if(i>=stageIndex("WASH_TEST")&&!checks.fit) return "Complete fit review before wash testing.";
    if(i>=stageIndex("PHOTO_READY")&&!checks.wash) return "Complete wash testing before photo readiness.";
    if(i>=stageIndex("PREORDER_READY")&&(!hasApprovedSample(item)||!checks.photo||!checks.preorder)) return "An approved physical sample, approved photography and preorder review are required.";
    if(i>=stageIndex("PRODUCTION")&&!hasApprovedSample(item)) return "Production requires an explicitly approved physical sample.";
    if(i>=stageIndex("PRODUCTION")&&(!w.quantity||!w.size_curve)) return "Quantity and size curve stay locked until sample approval and must be entered before production.";
    return "";
  }
  function latestSample(item){const list=item&&item.workflow&&Array.isArray(item.workflow.samples)?item.workflow.samples:[];return list.length?list[list.length-1]:null;}
  function hasApprovedSample(item){return item.workflow.samples.some(s=>s&&s.state==="APPROVED"&&qcReady(s)&&measurementReady(item,s)&&shrinkageReady(s)&&decorationReady(s));}
  function canAdvance(item,next){return !gate(item,next);}
  function samples(id){
    const state=read(), current=state[id]||{};
    return Array.isArray(current.samples)?current.samples.slice():[];
  }
  function addSample(id,patch){
    const state=read(), current=state[id]||{};
    const samples=Array.isArray(current.samples)?current.samples.slice():[];
    const n=samples.length+1;
    const sample=Object.assign({
      id:id+"-S"+String(n).padStart(3,"0"),
      number:n,
      state:"REQUESTED",
      supplier:current.supplier||"",
      quote:current.quote||"",
      size:"",
      notes:"",
      outcome:"",
      measurements:{chest:"",length:"",shoulder:"",sleeve:""},
      measurement_result:"PENDING",
      measurement_notes:"",
      shrinkage:{pre_wash:"",post_wash:"",percent:"",result:"PENDING"},
      decoration_check:{placement:"",scale:"",color:"",result:"PENDING"},
      qc:{fit:"",fabric:"",shrinkage:"",print:"",embroidery:"",seams:"",measurements:"",defects:"",decision:"PENDING",approved_by:""},
      created_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    },patch||{});
    samples.push(sample);
    state[id]=Object.assign({},current,{samples:samples.slice(-25),updated_at:new Date().toISOString()});
    const h=Array.isArray(current.history)?current.history.slice():[];
    h.push({at:state[id].updated_at,action:"SAMPLE_CREATED",sample_id:sample.id});
    state[id].history=h.slice(-100);
    write(state);
    render();
    return sample;
  }
  function measurementFor(sample){return Object.assign({chest:"",length:"",shoulder:"",sleeve:""},sample&&sample.measurements||{});}
  function shrinkageReady(sample){return sample&&sample.shrinkage&&String(sample.shrinkage.result||"").toUpperCase()==="PASS";}
  function decorationReady(sample){return sample&&sample.decoration_check&&String(sample.decoration_check.result||"").toUpperCase()==="PASS";}
  function measurementReady(item,sample){
    const spec=Object.assign({tolerance:"±1 cm"},item.specification||{});
    const actual=measurementFor(sample);
    return ["chest","length","shoulder","sleeve"].every(k=>String(actual[k]||"").trim())&&String(sample.measurement_result||"").toUpperCase()==="PASS";
  }
  function qcFor(sample){return Object.assign({fit:"",fabric:"",shrinkage:"",print:"",embroidery:"",seams:"",measurements:"",defects:"",decision:"PENDING",approved_by:""},sample&&sample.qc||{});}
  function qcReady(sample){
    const q=qcFor(sample);
    return ["fit","fabric","shrinkage","print","seams","measurements","defects"].every(k=>String(q[k]||"").trim())&&["PASS","FAIL"].includes(q.decision)&&String(q.approved_by||"").trim();
  }
  function updateSample(id,sampleId,patch){
    const state=read(), current=state[id]||{};
    const samples=Array.isArray(current.samples)?current.samples.slice():[];
    const index=samples.findIndex(s=>s&&s.id===sampleId);
    if(index<0)return null;
    samples[index]=Object.assign({},samples[index],patch||{},{updated_at:new Date().toISOString()});
    state[id]=Object.assign({},current,{samples:samples.slice(-25),updated_at:new Date().toISOString()});
    const h=Array.isArray(current.history)?current.history.slice():[];
    h.push({at:state[id].updated_at,action:"SAMPLE_UPDATED",sample_id:sampleId,patch:Object.keys(patch||{})});
    state[id].history=h.slice(-100);
    write(state);
    render();
    return samples[index];
  }
  function history(id){
    const state=read(), current=state[id]||{};
    return Array.isArray(current.history)?current.history.slice():[];
  }
  function record(id,event){
    const state=read(), current=state[id]||{};
    const next=Object.assign({},current);
    const history=Array.isArray(current.history)?current.history.slice():[];
    history.push(Object.assign({at:new Date().toISOString()},event||{}));
    next.history=history.slice(-100);
    state[id]=next;
    write(state);
    return next;
  }
  function update(id,patch){
    const state=read(), current=state[id]||{};
    state[id]=Object.assign({},current,patch,{updated_at:new Date().toISOString()});
    const history=Array.isArray(current.history)?current.history.slice():[];
    history.push({at:state[id].updated_at,action:"UPDATE",patch:Object.keys(patch||{})});
    state[id].history=history.slice(-100);
    write(state);
    render();
    return state[id];
  }
  function pct(item){
    const done=CHECKS.filter(([id])=>item.workflow.checks[id]).length;
    return Math.round(done/CHECKS.length*100);
  }
  function saveItem(id,patch){
    return update(id,patch);
  }
  function field(card,item,key,label,type){
    const wrap=el("div",{class:"wardrobe-field"});
    wrap.append(el("label",{},label));
    const input=document.createElement(type==="textarea"?"textarea":"input");
    input.value=item.workflow[key]||"";
    input.placeholder=label;
    if((key==="quantity"||key==="size_curve")&&!hasApprovedSample(item))input.disabled=true;
    if(type==="textarea"){input.rows=3;input.style.resize="vertical";}
    input.addEventListener("change",()=>saveItem(item.id,{[key]:input.value.trim()}));
    wrap.append(input);
    card.append(wrap);
    return input;
  }
  function render(){
    const host=document.getElementById("wardrobe-workflow");
    if(!host)return;
    host.textContent="";
    const wrap=el("div",{class:"panel"});
    const head=el("div",{class:"sectionTitle"});
    const title=el("div",{});
    title.append(el("div",{class:"kicker"},"PHYSICAL PRODUCTION"));
    title.append(el("h2",{},"WARDROBE"));
    title.append(el("p",{},"DESIGN → SAMPLE → TEST → APPROVE → PHOTOGRAPH → PREORDER → PRODUCE → RELEASE."));
    head.append(title); wrap.append(head);
    const grid=el("div",{class:"stack"});
    items().forEach(item=>{
      const card=el("div",{class:"rowcard wardrobe-card"});
      const left=el("div",{class:"rowleft"});
      left.append(el("div",{class:"rowtitle"},item.title));
      left.append(el("div",{class:"rowmeta"},item.id+" · "+item.workflow.stage+" · "+pct(item)+"% checklist"));
      card.append(left);
      const gateMsg=gate(item,item.workflow.stage);
      const stage=el("select",{class:"pill"});
      STAGES.forEach(s=>{const o=el("option",{value:s},s);o.selected=s===item.workflow.stage;stage.append(o);});
      stage.addEventListener("change",()=>{
        const next=stage.value;
        if(!canAdvance(item,next)){stage.value=item.workflow.stage;notice.textContent=gate(item,next);return;}
        saveItem(item.id,{stage:next});
      });
      card.append(stage);
      const notice=el("div",{class:"wardrobe-gate "+(gateMsg?"warn":"ok")},gateMsg||"GATE CLEAR — current stage requirements satisfied.");
      card.append(notice);
      const meta=el("div",{class:"wardrobe-meta"});
      meta.append(el("div",{},item.color+" · "+item.gsm_target+" · "+item.fit));
      meta.append(el("div",{},Array.isArray(item.sizes)?item.sizes.join(" / "):""));
      card.append(meta);
      const fields=el("div",{class:"wardrobe-fields"});
      card.append(fields);
      const addField=(key,label,type)=>{const old=card.querySelectorAll(".wardrobe-field").length;const input=field(fields,item,key,label,type);return input;};
      addField("supplier","SUPPLIER / PRINTER","input");
      addField("quote","QUOTE / COST NOTE","input");
      addField("sample_request","SAMPLE REQUEST / REFERENCE","input");
      addField("sample_received","SAMPLE RECEIVED / DATE","input");
      addField("fit_notes","FIT REVIEW NOTES","textarea");
      addField("wash_notes","WASH TEST / SHRINKAGE / QC","textarea");
      addField("photo","APPROVED SAMPLE PHOTO / REFERENCE","input");
      addField("quantity","QUANTITY (LOCKED UNTIL PRODUCTION GATE)","input");
      addField("size_curve","SIZE CURVE","input");
      addField("production_notes","PRODUCTION NOTES","textarea");
      addField("release_notes","RELEASE NOTES","textarea");
      const actions=el("div",{class:"quickgrid"});
      CHECKS.forEach(([id,label])=>{
        const locked=id==="preorder"&&!item.workflow.checks.photo;
        const b=el("button",{class:"quick",type:"button"},(item.workflow.checks[id]?"✓ ":"□ ")+id.toUpperCase());
        b.setAttribute("aria-pressed",String(!!item.workflow.checks[id]));
        b.disabled=locked;
        b.title=locked?"Approve the actual sample photo first.":label;
        b.addEventListener("click",()=>{
          const checks=Object.assign({},item.workflow.checks,{[id]:!item.workflow.checks[id]});
          saveItem(item.id,{checks});
        });
        actions.append(b);
      });
      card.append(actions);
      if(item.workflow.updated_at)card.append(el("div",{class:"rowmeta"},"LAST UPDATED · "+item.workflow.updated_at));
      const sampleWrap=el("div",{class:"wardrobe-samples"});
      sampleWrap.append(el("div",{class:"kicker"},"PHYSICAL SAMPLES"));
      const sampleList=samples(item.id);
      if(!sampleList.length){
        const add=el("button",{class:"btn small",type:"button"},"CREATE SAMPLE #001");
        add.addEventListener("click",()=>addSample(item.id,{}));
        sampleWrap.append(add);
      }else{
        sampleList.slice().reverse().forEach(s=>{
          const line=el("div",{class:"sample-line"});
          line.append(el("strong",{},s.id+" · "+s.state));
          const meta=el("span",{},(s.supplier||"No supplier recorded")+" · "+(s.size||"Size not recorded")+" · "+(s.created_at||""));
          line.append(meta);
          const sampleFields=el("div",{class:"sample-fields"});
          [["size","SIZE / VARIANT"],["notes","SAMPLE NOTES"],["outcome","OUTCOME / DEFECTS"]].forEach(([key,label])=>{
            const inp=document.createElement("input"); inp.value=s[key]||""; inp.placeholder=label; inp.addEventListener("change",()=>updateSample(item.id,s.id,{[key]:inp.value.trim()})); sampleFields.append(inp);
          });
          line.append(sampleFields);
          const m=measurementFor(s);
          const measureWrap=el("div",{class:"sample-qc"});
          measureWrap.append(el("div",{class:"kicker"},"MEASUREMENT CHECK"));
          [["chest","CHEST"],["length","LENGTH"],["shoulder","SHOULDER"],["sleeve","SLEEVE"]].forEach(([key,label])=>{
            const inp=document.createElement("input"); inp.value=m[key]||""; inp.placeholder=label; inp.addEventListener("change",()=>updateSample(item.id,s.id,{measurements:Object.assign({},m,{[key]:inp.value.trim()})})); measureWrap.append(inp);
          });
          const mr=document.createElement("select");["PENDING","PASS","FAIL"].forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;o.selected=String(s.measurement_result||"PENDING")===v;mr.append(o);});mr.addEventListener("change",()=>updateSample(item.id,s.id,{measurement_result:mr.value}));measureWrap.append(mr);
          measureWrap.append(el("div",{class:"rowmeta"},"SPEC TOLERANCE · "+((item.specification&&item.specification.tolerance)||"±1 cm")));
          const mn=document.createElement("input");mn.value=s.measurement_notes||"";mn.placeholder="MEASUREMENT NOTES / DEVIATIONS";mn.addEventListener("change",()=>updateSample(item.id,s.id,{measurement_notes:mn.value.trim()}));measureWrap.append(mn);
          line.append(measureWrap);
          const sh=Object.assign({pre_wash:"",post_wash:"",percent:"",result:"PENDING"},s.shrinkage||{});
          const shrinkWrap=el("div",{class:"sample-qc"});
          shrinkWrap.append(el("div",{class:"kicker"},"SHRINKAGE CHECK"));
          ["pre_wash","post_wash","percent"].forEach(key=>{const inp=document.createElement("input");inp.value=sh[key]||"";inp.placeholder=key.replace("_"," ").toUpperCase();inp.addEventListener("change",()=>updateSample(item.id,s.id,{shrinkage:Object.assign({},sh,{[key]:inp.value.trim()})}));shrinkWrap.append(inp);});
          const sr=document.createElement("select");["PENDING","PASS","FAIL"].forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;o.selected=String(sh.result||"PENDING")===v;sr.append(o);});sr.addEventListener("change",()=>updateSample(item.id,s.id,{shrinkage:Object.assign({},sh,{result:sr.value})}));shrinkWrap.append(sr);line.append(shrinkWrap);
          const dc=Object.assign({placement:"",scale:"",color:"",result:"PENDING"},s.decoration_check||{});
          const decWrap=el("div",{class:"sample-qc"});decWrap.append(el("div",{class:"kicker"},"DECORATION CHECK"));
          ["placement","scale","color"].forEach(key=>{const inp=document.createElement("input");inp.value=dc[key]||"";inp.placeholder=key.toUpperCase();inp.addEventListener("change",()=>updateSample(item.id,s.id,{decoration_check:Object.assign({},dc,{[key]:inp.value.trim()})}));decWrap.append(inp);});
          const dr=document.createElement("select");["PENDING","PASS","FAIL"].forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;o.selected=String(dc.result||"PENDING")===v;dr.append(o);});dr.addEventListener("change",()=>updateSample(item.id,s.id,{decoration_check:Object.assign({},dc,{result:dr.value})}));decWrap.append(dr);line.append(decWrap);
          const q=qcFor(s);
          const qcWrap=el("div",{class:"sample-qc"});
          qcWrap.append(el("div",{class:"kicker"},"QC INSPECTION"));
          [["fit","FIT"],["fabric","FABRIC / HAND FEEL"],["shrinkage","SHRINKAGE"],["print","PRINT"],["embroidery","EMBROIDERY"],["seams","SEAMS"],["measurements","MEASUREMENTS"],["defects","DEFECTS / NOTES"]].forEach(([key,label])=>{
            const inp=document.createElement("input"); inp.value=q[key]||""; inp.placeholder=label; inp.addEventListener("change",()=>updateSample(item.id,s.id,{qc:Object.assign({},q,{[key]:inp.value.trim()})})); qcWrap.append(inp);
          });
          const decision=document.createElement("select");
          ["PENDING","PASS","FAIL"].forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;o.selected=q.decision===v;decision.append(o);});
          decision.addEventListener("change",()=>updateSample(item.id,s.id,{qc:Object.assign({},q,{decision:decision.value})}));
          qcWrap.append(decision);
          const approver=document.createElement("input");approver.value=q.approved_by||"";approver.placeholder="APPROVED BY";approver.addEventListener("change",()=>updateSample(item.id,s.id,{qc:Object.assign({},q,{approved_by:approver.value.trim()})}));qcWrap.append(approver);
          const qcStatus=el("div",{class:"rowmeta"},qcReady(s)?"QC COMPLETE — SAMPLE ELIGIBLE FOR APPROVAL.":"QC INCOMPLETE — COMPLETE INSPECTION BEFORE APPROVAL.");
          qcWrap.append(qcStatus);
          line.append(qcWrap);
          const controls=el("div",{class:"sample-controls"});
          SAMPLE_STATES.forEach(stateName=>{
            const b=el("button",{class:"btn small "+(s.state===stateName?"primary":"ghost"),type:"button"},stateName);
            b.addEventListener("click",()=>{if(stateName==="APPROVED"&&!qcReady(s)){return;}updateSample(item.id,s.id,{state:stateName});});
            controls.append(b);
          });
          line.append(controls);
          sampleWrap.append(line);
        });
      }
      card.append(sampleWrap);
      const historyWrap=el("div",{class:"wardrobe-history"});
      historyWrap.append(el("div",{class:"kicker"},"GARMENT HISTORY"));
      const hist=history(item.id);
      if(!hist.length) historyWrap.append(el("div",{class:"rowmeta"},"No changes recorded yet."));
      else hist.slice().reverse().slice(0,8).forEach(h=>{
        const action=h.action||"EVENT";
        const keys=Array.isArray(h.patch)?h.patch.join(", "):"";
        historyWrap.append(el("div",{class:"history-line"},(h.at||"")+" · "+action+(keys?" · "+keys:"")));
      });
      card.append(historyWrap);

      grid.append(card);
    });
    wrap.append(grid);
    host.append(wrap);
  }
  function mount(){
    const work=document.getElementById("work");
    if(!work||document.getElementById("wardrobe-workflow"))return;
    const host=document.createElement("div");
    host.id="wardrobe-workflow";
    host.style.marginTop="18px";
    work.append(host);
    render();
  }
  window.ESCIE_WARDROBE_WORKFLOW=Object.freeze({
    version:"1.0",
    stages:Object.freeze(STAGES.slice()),
    checklist:Object.freeze(CHECKS.map(x=>Object.freeze(x.slice()))),
    records:items,
    history,
    samples,
    addSample,
    updateSample,
    sampleStates:Object.freeze(SAMPLE_STATES.slice()),
    save:(id,patch)=>saveItem(id,patch),
    record,
    render
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("escie:central-ready",mount);
})();
