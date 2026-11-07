const { chromium } = require("playwright");

const baseURL = process.env.LIVE_URL;
if (!baseURL) throw new Error("LIVE_URL is required");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

page.on("console", m => { if (m.type() === "error") failures.push("console error: " + m.text()); });
page.on("pageerror", e => failures.push("page error: " + e.message));

await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
check((await page.title()).includes("ESCIE"), "ESCIE title missing");
check(await page.locator("#main-content").count() === 1, "main content missing");
check(await page.locator("#mobile-menu-button").count() === 1, "public doorway/menu missing");

const nav = page.locator("#main-navigation");
await page.locator("#mobile-menu-button").click();
check((await page.locator("#mobile-menu-button").getAttribute("aria-expanded")) === "true", "mobile index did not open");
await page.locator("#mobile-menu-button").click();
check((await page.locator("#mobile-menu-button").getAttribute("aria-expanded")) === "false", "mobile index did not close");

const triggers = page.locator(".section-drop-trigger");
const count = await triggers.count();
check(count > 0, "no section dropdown triggers found");

for (let i = 0; i < count; i++) {
  const trigger = triggers.nth(i);
  if (!(await trigger.isVisible().catch(() => false))) continue;
  await trigger.click();
  await page.waitForTimeout(100);
  const section = trigger.locator("xpath=ancestor::section[1]");
  const panel = section.locator(".section-drop-panel");
  if (await panel.count()) {
    const hidden = await panel.getAttribute("hidden");
    const height = await panel.evaluate(el => getComputedStyle(el).display === "none" ? 0 : el.getBoundingClientRect().height).catch(() => 0);
    check(hidden === null && height > 0, "section failed to open: " + (await section.getAttribute("id")));
    await trigger.click();
    const closedHeight = await panel.evaluate(el => el.getBoundingClientRect().height).catch(() => 999);
    check(await panel.getAttribute("hidden") !== null || closedHeight === 0, "section left dead spacing: " + (await section.getAttribute("id")));
  }
}

const glassActions = page.locator("[data-glass-eye-action]");
check(await glassActions.count() >= 4, "Glass Eye approved controls missing");
for (const action of ["observe","follow","return","info"]) {
  const b = page.locator('[data-glass-eye-action="' + action + '"]').first();
  check(await b.count() === 1, "Glass Eye action missing: " + action);
  if (await b.count()) {
    await b.click();
    check((await b.getAttribute("aria-pressed")) === "true" || action === "info", "Glass Eye action did not respond: " + action);
  }
}

for (const lang of ["en","fr","es"]) {
  const b = page.locator('[data-language="' + lang + '"]');
  check(await b.count() === 1, "language control missing: " + lang);
  if (await b.count()) await b.click();
}
await page.locator("#theme-toggle").click();
check(await page.locator("#theme-toggle").count() === 1, "theme control missing");

const bodyText = await page.locator("body").innerText();
for (const forbidden of ["Dallas ’63","Dallas '63","Pumpy to the Chest","BACC 2 BASICS"]) {
  check(!bodyText.includes(forbidden), "unreleased BAM content exposed: " + forbidden);
}
check(!bodyText.includes("ESCIE_RELEASE_QUEUE_JSON"), "release secret name exposed");

await page.screenshot({ path: "artifacts/public-mobile.png", fullPage: true });

await page.setViewportSize({ width: 1440, height: 900 });
await page.reload({ waitUntil: "networkidle" });
check(await page.locator("#main-content").isVisible(), "desktop main content not visible");
await page.screenshot({ path: "artifacts/public-desktop.png", fullPage: true });

await browser.close();
if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: "PASS", checked: [
  "reachability","doorway","navigation","accordion collapse","dead-spacing","symbols/interactions",
  "Glass Eye","language/theme controls","mobile","desktop","public BAM/private-content boundary"
]}, null, 2));
