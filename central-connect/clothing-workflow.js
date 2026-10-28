/*
 * ESCIE CENTRAL — WARDROBE WORKFLOW
 * Operational clothing pipeline. No commerce assumptions, no public-write authority.
 */
(function(){
  "use strict";
  const KEY="escie_central_wardrobe_v1";
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
        updated_at:saved.updated_at||""
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
    if(i>=stageIndex("FIT_REVIEW")&&!w.sample_received) return "Record the received sample before fit review.";
    if(i>=stageIndex("WASH_TEST")&&!checks.fit) return "Complete fit review before wash testing.";
    if(i>=stageIndex("PHOTO_READY")&&!checks.wash) return "Complete wash testing before photo readiness.";
    if(i>=stageIndex("PREORDER_READY")&&(!checks.photo||!checks.preorder)) return "Approve sample photography and preorder review first.";
    if(i>=stageIndex("PRODUCTION")&&(!w.quantity||!w.size_curve)) return "Quantity and size curve stay locked until sample approval and must be entered before production.";
    return "";
  }
  function canAdvance(item,next){return !gate(item,next);}
  function update(id,patch){
    const state=read(), current=state[id]||{};
    state[id]=Object.assign({},current,patch,{updated_at:new Date().toISOString()});
    write(state);
    render();
    return state[id];
  }
  function stageIndex(stage){const i=STAGES.indexOf(stage);return i<0?0:i;}
  function pct(item){
    const done=CHECKS.filter(([id])=>item.workflow.checks[id]).length;
    return Math.round(done/CHECKS.length*100);
  }
  function saveItem(id,patch){
    const state=read(), current=state[id]||{};
    state[id]=Object.assign({},current,patch);
    write(state);
    render();
    return state[id];
  }
  function el(tag,attrs,text){
    const node=document.createElement(tag);
    Object.keys(attrs||{}).forEach(k=>{
      if(k==="class") node.className=attrs[k];
      else if(k==="value") node.value=attrs[k];
      else node.setAttribute(k,attrs[k]);
    });
    if(text!=null) node.textContent=text;
    return node;
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
    title.append(el("p",{},"One excellent sample first. Every quantity decision stays behind the human gate."));
    head.append(title); wrap.append(head);
    const grid=el("div",{class:"stack"});
    items().forEach(item=>{
      const card=el("div",{class:"rowcard"});
      const left=el("div",{class:"rowleft"});
      left.append(el("div",{class:"rowtitle"},item.title));
      left.append(el("div",{class:"rowmeta"},item.id+" · "+item.workflow.stage+" · "+pct(item)+"% checklist"));
      card.append(left);
      const select=document.createElement("select");
      select.className="pill";
      STAGES.forEach(stage=>{const o=el("option",{value:stage},stage);o.selected=stage===item.workflow.stage;select.append(o);});
      select.addEventListener("change",()=>saveItem(item.id,{stage:select.value}));
      card.append(select);
      const details=el("div",{class:"ey"});
      details.style.width="100%";
      details.style.marginTop="10px";
      details.textContent=CHECKS.map(([id,label])=>(item.workflow.checks[id]?"✓ ":"□ ")+label).join("  ");
      card.append(details);
      const actions=el("div",{class:"quickgrid"});
      CHECKS.forEach(([id,label])=>{
        const b=el("button",{class:"quick",type:"button"},(item.workflow.checks[id]?"✓ ":"□ ")+id.toUpperCase());
        b.setAttribute("aria-pressed",String(!!item.workflow.checks[id]));
        b.title=label;
        b.addEventListener("click",()=>{
          const checks=Object.assign({},item.workflow.checks,{[id]:!item.workflow.checks[id]});
          saveItem(item.id,{checks});
        });
        actions.append(b);
      });
      card.append(actions);
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
    save:(id,patch)=>saveItem(id,patch),
    render
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  window.addEventListener("escie:central-ready",mount);
})();
