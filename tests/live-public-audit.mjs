import { chromium } from "playwright";
import fs from "node:fs";

const baseURL = process.env.LIVE_URL;
if (!baseURL) throw new Error("LIVE_URL is required");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const failures = [];
const checks = [];
const textResponses = new Map();
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
  "SUPABASE_ACCESS_TOKEN"
];

const sameOrigin = new URL(baseURL).origin;
page.on("console", m => {
  if (m.type() === "error") failures.push("console error: " + m.text());
});
page.on("pageerror", e => failures.push("page error: " + e.message));
page.on("response", response => {
  const type = response.request().resourceType();
  if (!["document", "script", "stylesheet", "xhr", "fetch"].includes(type)) return;
  if (!response.url().startsWith(sameOrigin)) return;
  if (response.status() >= 400) failures.push("same-origin " + type + " request failed: " + response.status() + " " + response.url());
  if (["document", "script", "xhr", "fetch"].includes(type)) {
    textResponses.set(response.url(), response);
  }
});

async function scanRenderedBoundary(label) {
  const html = await page.locator("html").evaluate(el => el.outerHTML);
  for (const secret of forbidden) {
    check(!html.toLowerCase().includes(secret.toLowerCase()), label + " exposes forbidden material: " + secret);
  }
  const scripts = await page.locator("script[src]").evaluateAll(nodes =>
    nodes.map(node => new URL(node.getAttribute("src"), location.href).href)
  );
  const assets = await page.evaluate(async urls => {
    const results = [];
    for (const url of urls) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        results.push({ url, status: response.status, text: response.ok ? await response.text() : "" });
      } catch (error) {
        results.push({ url, status: 0, text: "", error: String(error) });
      } finally {
        clearTimeout(timer);
      }
    }
    return results;
  }, scripts);
  for (const asset of assets) {
    check(asset.status >= 200 && asset.status < 400, label + " loaded script failed: " + asset.status + " (" + asset.url + ")");
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

await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
check((await page.title()).includes("ESCIE"), "ESCIE title missing");
check(await page.locator("#main-content").count() === 1, "main content missing");
check(await page.locator("#mobile-menu-button").count() === 1, "public doorway/menu missing");

const menu = page.locator("#mobile-menu-button");
await menu.click();
check((await menu.getAttribute("aria-expanded")) === "true", "mobile index did not open");
await menu.click();
check((await menu.getAttribute("aria-expanded")) === "false", "mobile index did not close");

await auditAccordions("mobile");
await auditGlassEye("mobile");

for (const lang of ["en", "fr", "es"]) {
  const button = page.locator('[data-language="' + lang + '"]');
  check(await button.count() === 1, "language control missing: " + lang);
  if (await button.count()) await button.click();
}
const theme = page.locator("#theme-toggle");
check(await theme.count() === 1, "theme control missing");
if (await theme.count()) await theme.click();

const symbol = page.locator(".section-motif-item").first();
check(await symbol.count() > 0, "interactive public symbol missing");
if (await symbol.count()) {
  await symbol.click();
  check(await page.locator("#record-inspector").isVisible().catch(() => false), "symbol did not open inspector");
  const close = page.locator(".record-inspector-close").first();
  if (await close.count()) await close.click();
}

await scanRenderedBoundary("mobile");
check(await menu.isVisible(), "public doorway not visible on mobile");
await page.screenshot({ path: "artifacts/public-mobile.png", fullPage: true });

await page.setViewportSize({ width: 1440, height: 900 });
await page.reload({ waitUntil: "networkidle" });
check(await page.locator("#main-content").isVisible(), "desktop main content not visible");
await auditAccordions("desktop");
await auditGlassEye("desktop");
await scanRenderedBoundary("desktop");
await page.screenshot({ path: "artifacts/public-desktop.png", fullPage: true });

fs.writeFileSync("artifacts/audit-manifest.json", JSON.stringify({
  status: failures.length ? "FAIL" : "PASS",
  baseURL,
  checkedAt: new Date().toISOString(),
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
