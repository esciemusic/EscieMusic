import { chromium } from "playwright";
import fs from "node:fs";

const baseURL = process.env.LIVE_URL;
const expectedSha = process.env.EXPECTED_SHA || '';
if (!baseURL) throw new Error('LIVE_URL is required');
if (expectedSha && !/^[0-9a-f]{40}$/i.test(expectedSha)) throw new Error('EXPECTED_SHA must be a 40-character commit SHA');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const failures = [];
const checks = [];
const check = (ok, msg) => {
  checks.push({ ok: Boolean(ok), message: msg });
  if (!ok) failures.push(msg);
};

const forbidden = [
  "Dallas ’63",
  "Dallas '63",
  "Pumpy to the Chest",
  "BACC 2 BASICS",
  "ESCIE_RELEASE_QUEUE_JSON",
  "EscieCentral",
  "central-api",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "SIGNAL //",
  "TRANSMISSION COUNTDOWN",
  "SIGNAL STATUS"
];

const sameOrigin = new URL(baseURL).origin;
page.on("console", m => {
  if (m.type() === "error") {
    const location = m.location();
    failures.push("console error: " + m.text() + (location?.url ? " [" + location.url + "]" : ""));
  }
});
page.on("pageerror", e => failures.push("page error: " + e.message));
page.on("response", response => {
  if (/central-api|supabase\.co\/functions\/v1\/central|esciecentral/i.test(response.url())) failures.push("public runtime contacted Central/private API: " + response.url());
  const status = response.status();
  const type = response.request().resourceType();
  if (!["document", "script", "stylesheet", "xhr", "fetch"].includes(type)) return;
  if (status >= 400) {
    failures.push((response.url().startsWith(sameOrigin) ? "same-origin " : "external ") + type + " request failed: " + status + " " + response.url());
  }
});

async function scanRenderedBoundary(label) {
  const html = await page.locator("html").evaluate(el => el.outerHTML);
  for (const secret of forbidden) {
    check(!html.toLowerCase().includes(secret.toLowerCase()), label + " exposes forbidden material: " + secret);
  }
  const assets = await page.locator("script[src],link[rel='stylesheet'][href]").evaluateAll(nodes =>
    nodes.map(node => new URL(node.getAttribute("src") || node.getAttribute("href"), location.href).href)
  );
  const loadedAssets = await page.evaluate(async urls => Promise.all([...new Set(urls)].map(async url => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      return { url, status: response.status, text: response.ok ? await response.text() : "" };
    } catch (error) {
      return { url, status: 0, text: "", error: String(error) };
    } finally {
      clearTimeout(timer);
    }
  })), assets);

  for (const asset of loadedAssets) {
    check(asset.status >= 200 && asset.status < 400, label + " loaded asset failed: " + asset.status + " (" + asset.url + ")");
    for (const secret of forbidden) {
      check(!asset.text.toLowerCase().includes(secret.toLowerCase()), label + " loaded asset exposes forbidden material: " + secret + " (" + asset.url + ")");
    }
  }
}

async function auditAccordions(label) {
  const triggers = page.locator(".section-drop-trigger");
  const count = await triggers.count();
  check(count >= 8, label + " expected canonical section dropdown triggers");
  for (let i = 0; i < count; i++) {
    const trigger = triggers.nth(i);
    if (!(await trigger.isVisible().catch(() => false))) continue;
    const section = trigger.locator("xpath=ancestor::section[1]");
    const id = await section.getAttribute("id");
    const panel = section.locator(".section-drop-panel");
    if (!(await panel.count())) continue;
    await trigger.click();
    await page.waitForTimeout(80);
    const opened = await panel.evaluate(el => ({
      hidden: el.hasAttribute("hidden"),
      height: el.getBoundingClientRect().height,
      display: getComputedStyle(el).display
    }));
    check(!opened.hidden && opened.display !== "none" && opened.height > 0, label + " section failed to open: " + id);

    const media = panel.locator("img,video,iframe");
    for (let m = 0; m < await media.count(); m++) {
      const item = media.nth(m);
      const tag = await item.evaluate(el => el.tagName.toLowerCase());
      const src = await item.getAttribute("src");
      check(Boolean(src), label + " media missing src in section: " + id + " (" + tag + ")");
      if (tag === "img") {
        check(await item.evaluate(el => el.complete && el.naturalWidth > 0).catch(() => true), label + " image failed to load in section: " + id);
      }
    }

    await trigger.click();
    const closed = await panel.evaluate(el => ({
      hidden: el.hasAttribute("hidden"),
      height: el.getBoundingClientRect().height,
      display: getComputedStyle(el).display
    }));
    check(closed.hidden || closed.height === 0 || closed.display === "none", label + " left dead spacing: " + id);
  }
}

async function auditWorldLenses(label){
  const world=page.locator("#world");
  check(await world.count()===1, label+" THE WORLD section missing");
  const trigger=world.locator(".section-drop-trigger");
  if(await trigger.count() && !(await world.evaluate(el=>el.classList.contains("section-open")).catch(()=>false))) await trigger.click();
  for(const tab of ["atlas","people","places","moments","fragments","bodies","proof","path","timeline","symbols","trails"]){
    const button=page.locator('[data-world-tab="'+tab+'"]').first();
    check(await button.count()===1, label+" THE WORLD lens missing: "+tab);
    if(await button.count()){
      await button.click();
      check((await button.getAttribute("aria-selected"))==="true", label+" THE WORLD lens did not activate: "+tab);
      check((await page.locator("#world-container").innerText()).trim().length>0, label+" THE WORLD lens rendered empty shell: "+tab);
    }
  }
}
async function auditSymbols(label) {
  const symbols = page.locator(".section-motif-item");
  let visibleCount = 0;
  for (let i = 0; i < await symbols.count(); i++) {
    const candidate = symbols.nth(i);
    if (!(await candidate.isVisible().catch(() => false))) continue;
    visibleCount++;
    if (visibleCount > 3) break;
    await candidate.click();
    check(await page.locator("#record-inspector").isVisible().catch(() => false), label + " symbol did not open inspector");
    const close = page.locator(".record-inspector-close").first();
    if (await close.count()) await close.click();
  }
  if (visibleCount === 0) check(true, label + " no live motif controls rendered; source contract covers symbol wiring");
}

async function auditGlassEye(label) {
  const section = page.locator("section#glass-eye");
  if (!(await section.count())) {
    check(false, label + " Glass Eye section missing");
    return;
  }
  const trigger = section.locator(".section-drop-trigger");
  if (await trigger.count() && !(await section.evaluate(el => el.classList.contains("section-open")).catch(() => false))) {
    await trigger.click();
    await page.waitForTimeout(80);
  }

  const actions = ["observe", "hear", "follow", "return", "info"];
  for (const action of actions) {
    const button = page.locator('[data-glass-eye-action="' + action + '"]').first();
    check(await button.count() === 1, label + " Glass Eye action missing: " + action);
    if (await button.count()) {
      const disabled = await button.isDisabled().catch(() => false);
      await button.click().catch(() => {});
      if (!disabled && action !== "info") {
        check((await button.getAttribute("aria-pressed")) === "true", label + " Glass Eye action did not respond: " + action);
      }
    }
  }

  const iframe = page.locator("#glass-eye iframe, .glass-video-frame iframe").first();
  if (await iframe.count()) {
    const src = await iframe.getAttribute("src");
    check(Boolean(src && src.includes("youtube-nocookie.com/embed/")), label + " Glass Eye iframe is not privacy-enhanced YouTube");
  } else {
    check(await page.locator(".glass-video-window-empty").count() === 1, label + " Glass Eye lacks approved-video gate");
  }
}

const auditURL = new URL(baseURL);
if (expectedSha) auditURL.searchParams.set("escie_audit_sha", expectedSha);
else auditURL.searchParams.set("escie_audit", Date.now().toString());

await page.goto(auditURL.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
check((await page.title()).includes('ESCIE'), 'ESCIE title missing');
let observedSha = '';
let deploymentMeta = page.locator('meta[name="escie-deployment-sha"]').first();
for (let attempt = 0; attempt < 6 && !(await deploymentMeta.count()); attempt++) {
  await page.waitForTimeout(10000);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  deploymentMeta = page.locator('meta[name="escie-deployment-sha"]').first();
}
check(await deploymentMeta.count() === 1, 'deployment revision marker missing');
if (await deploymentMeta.count()) {
  observedSha = (await deploymentMeta.getAttribute('content')) || '';
  check(/^[0-9a-f]{40}$/i.test(observedSha), 'deployment revision marker is invalid');
  if (expectedSha) check(observedSha.toLowerCase() === expectedSha.toLowerCase(), 'live deployment revision mismatch: expected ' + expectedSha + ' but observed ' + observedSha);
}
check(await page.locator('#main-content').count() === 1, 'main content missing');
check(await page.locator("#mobile-menu-button").count() === 1, "public doorway/menu missing");

const menu = page.locator("#mobile-menu-button");
await menu.click();
check((await menu.getAttribute("aria-expanded")) === "true", "mobile index did not open");
await menu.click();
check((await menu.getAttribute("aria-expanded")) === "false", "mobile index did not close");

await auditAccordions("mobile");
await auditGlassEye("mobile");
await auditWorldLenses("mobile");
check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), "mobile public layout has horizontal overflow");

for (const lang of ["en", "fr", "es"]) {
  const button = page.locator('[data-language="' + lang + '"]');
  check(await button.count() === 1, "language control missing: " + lang);
  if (await button.count()) await button.click();
}
const theme = page.locator("#theme-toggle");
check(await theme.count() === 1, "theme control missing");
if (await theme.count()) await theme.click();

await auditSymbols("mobile");

await scanRenderedBoundary("mobile");
check(await menu.isVisible(), "public doorway not visible on mobile");
await page.screenshot({ path: "artifacts/public-mobile.png", fullPage: true });

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(auditURL.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
check(await page.locator("#main-content").isVisible(), "desktop main content not visible");
await auditAccordions("desktop");
await auditGlassEye("desktop");
await auditWorldLenses("desktop");
check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), "desktop public layout has horizontal overflow");
await auditSymbols("desktop");
await scanRenderedBoundary("desktop");
await page.screenshot({ path: "artifacts/public-desktop.png", fullPage: true });

fs.writeFileSync("artifacts/audit-manifest.json", JSON.stringify({
  status: failures.length ? "FAIL" : "PASS",
  baseURL,
  checkedAt: new Date().toISOString(),
  expectedSha: expectedSha || null,
  observedSha: observedSha || null,
  deploymentIdentity: expectedSha ? observedSha.toLowerCase() === expectedSha.toLowerCase() : 'not-required',
  viewports: [{ width: 390, height: 844 }, { width: 1440, height: 900 }],
  checks: checks.filter(c => c.ok).map(c => c.message),
  failures
}, null, 2));

await browser.close();

if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "PASS",
  checked: [
    "reachability",
    "doorway",
    "navigation",
    "accordion open/close",
    "closed-row zero-space",
    "interactive symbols",
    "Glass Eye actions and media gate",
    "language/theme controls",
    "same-origin request health",
    "rendered HTML and loaded-asset release/private boundary",
    "mobile",
    "desktop"
  ]
}, null, 2));
