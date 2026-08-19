import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

// signup → modal, then story button
await page.goto("http://localhost:4123/fr", { waitUntil: "networkidle" });
await page.fill('input[name="email"]', "e2e@example.com");
await page.click('[data-waitlist-cta]');
await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

// sibling sync: with the modal open, the footer instance should already be a panel
console.log("panels while modal open:", await page.locator('[data-referral-panel]').count());

const dlPromise = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);
await page.locator('[role="dialog"] button', { hasText: "Story Instagram" }).click();
const dl = await dlPromise;
console.log("story download:", dl ? dl.suggestedFilename() : "NONE");
await page.waitForTimeout(400);
console.log("toast:", await page.locator('[aria-live="polite"] p').first().textContent().catch(() => null));
console.log("clipboard:", await page.evaluate(() => navigator.clipboard.readText()).catch(() => "n/a"));
if (dl) await dl.saveAs("/tmp/divalines-story.png");
await page.screenshot({ path: "/tmp/referral-modal2.png" });

// close modal → hero inline panel above hook, screenshot
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("panels after close:", await page.locator('[data-referral-panel]').count());
await page.screenshot({ path: "/tmp/referral-inline2.png" });

// EN ordinal
await page.goto("http://localhost:4123/en", { waitUntil: "networkidle" });
await page.waitForSelector('[data-referral-panel]', { timeout: 5000 });
console.log("en rank line:", (await page.locator('[data-referral-panel] strong').first().textContent()).trim());

// whatsapp href
const wa = await page.locator('[data-referral-panel] a[href^="https://wa.me"]').first().getAttribute("href");
console.log("whatsapp:", decodeURIComponent(wa));

await browser.close();
