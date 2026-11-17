const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const nav=fs.readFileSync(path.join(root,"navigation.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const style=fs.readFileSync(path.join(root,"style.css"),"utf8");

test("Experience Pass 4 preserves the public journey as one simple surface",()=>{
  const expected=["NOW","ART","MY WORLD","GLASS EYE","THE WEB","THE ARCHIVES","THE CASE FILES","ESCIE"];
  expected.forEach(label=>assert.ok(nav.includes('label:"'+label+'"'),label));
  assert.match(nav,/order:\[["']now["'],"art","world","glass-eye","web","archives","investigation","escie"\]/);
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
  assert.doesNotMatch(app,/pendingControl|controlItems/);
  assert.match(app,/Private cognition\/control systems are intentionally absent/);
});
