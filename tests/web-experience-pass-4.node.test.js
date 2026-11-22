const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const nav=fs.readFileSync(path.join(root,"navigation.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const style=fs.readFileSync(path.join(root,"style.css"),"utf8");
const globe=fs.readFileSync(path.join(root,"entry-globe.js"),"utf8");

test("Experience Pass 4 preserves the public journey as one simple surface",()=>{
  const expected=["NOW","ART","THE WORLD","GLASS EYE","TRACE","THE ARCHIVES","THE CASE FILES","ESCIE"];
  expected.forEach(label=>assert.ok(nav.includes('label:"'+label+'"'),label));
  assert.match(nav,/order:\["now","art","world","glass-eye","web","archives","investigation","escie"\]/);
  assert.match(app,/renderNavigation\(\)/);
  assert.match(app,/syncRouteState|bindNavigationRuntime/);
});

test("Experience Pass 4 preserves return-to-top and route continuity",()=>{
  assert.match(app,/topReturnReady/);
  assert.match(app,/history\.replaceState/);
  assert.match(app,/window\.scrollTo/);
  assert.match(app,/document\.body\.dataset\.route\s*=\s*"entry"/);
  assert.match(app,/localStorage\.(?:getItem|setItem|removeItem)/);
});

test("Experience Pass 4 keeps mobile navigation usable and reversible",()=>{
  assert.match(app,/aria-expanded/);
  assert.match(app,/aria-hidden/);
  assert.match(app,/focusFirst/);
  assert.match(app,/handleFocusTrap/);
  assert.match(app,/event\.key === "Escape"/);
  assert.match(app,/closeMenu\(true\)/);
  assert.match(style,/\.menu-open/);
});

test("Experience Pass 4 keeps motion subordinate to accessibility",()=>{
  assert.match(app,/reduceMotion\(\)/);
  assert.match(app,/route-shift/);
  assert.match(style,/prefers-reduced-motion/);
});

test("Experience Pass 4 keeps the public doorway free of private controls",()=>{
  assert.doesNotMatch(index,/service_role/i);
  assert.doesNotMatch(app,/SUPABASE_SERVICE_ROLE_KEY/i);
  assert.match(app,/pendingControl\s*=\s*function \(\) \{ return \[\]; \}/);
  assert.match(app,/controlItems\s*=\s*\[\];/);
  assert.match(app,/Private cognition\/control systems are intentionally absent/);
});

test("Experience Pass 6 lets globe latitude depth respond to pitch",()=>{
  assert.match(globe,/latitude=\[\.65,\.22,-\.22,-\.65\]/);
  assert.match(globe,/Math\.sin\(latitude\)\*Math\.sin\(pitch\)/);
  assert.match(globe,/el\.style\.top=\(50-lift\)+"%"/);
});

test("Experience Pass 5 lets attention change the World pace without stopping it",()=>{
  assert.match(globe,/attentive=false/);
  assert.match(globe,/pointerenter/);
  assert.match(globe,/focusin/);
  assert.match(globe,/attentive\?0\.0035:0\.012/);
});

test("Experience Pass 7 makes orientation perceptible through restrained light movement",()=>{
  assert.match(globe,/--globe-light-x/);
  assert.match(globe,/--globe-light-y/);
  assert.match(globe,/Math\.sin\(ry\*Math\.PI\/180\)/);
  assert.match(globe,/Math\.sin\(rx\*Math\.PI\/180\)/);
});
