import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. ref capture from ?ref=
await page.goto("http://localhost:4123/fr?ref=marr41", { waitUntil: "networkidle" });
console.log("captured ref:", await page.evaluate(() => localStorage.getItem("divalines_ref")));

// 2. signup with insta → modal
await page.fill('input[name="email"]', "e2e@example.com");
await page.fill('input[name="insta"]', "@Ma.Copine");
await page.click('[data-waitlist-cta]');
await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
console.log("modal title:", (await page.locator('[role="dialog"] .font-display').first().textContent()).trim());
console.log("distance line:", (await page.locator('[role="dialog"] [data-referral-panel] p').first().textContent()).trim());
console.log("link shown:", (await page.locator('[role="dialog"] .truncate').first().textContent()).trim());
console.log("me stored:", await page.evaluate(() => localStorage.getItem("divalines_me")));
await page.screenshot({ path: "/tmp/referral-modal.png" });

// 3. copy button
await page.locator('[role="dialog"] button', { hasText: "Copier" }).click();
await page.waitForTimeout(300);
console.log("copy feedback:", (await page.locator('[role="dialog"] [data-referral-panel] button').first().textContent()).trim());

// 4. close modal → inline panel remains
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("dialog gone:", await page.locator('[role="dialog"]').count() === 0);
console.log("inline panels:", await page.locator('[data-referral-panel]').count());
await page.screenshot({ path: "/tmp/referral-inline.png" });

// 5. reload → returning block replaces form (both instances)
await page.goto("http://localhost:4123/fr", { waitUntil: "networkidle" });
await page.waitForSelector('[data-referral-panel]', { timeout: 5000 });
console.log("after reload, panels:", await page.locator('[data-referral-panel]').count(), "forms:", await page.locator('[data-waitlist] form').count());

// 6. "pas toi ?" → form back
await page.locator('[data-referral-panel] button', { hasText: "pas toi" }).first().click();
await page.waitForTimeout(400);
console.log("after not-you, forms:", await page.locator('[data-waitlist] form').count(), "me:", await page.evaluate(() => localStorage.getItem("divalines_me")));

// 7. footer (onLight) form has insta too
console.log("insta inputs:", await page.locator('input[name="insta"]').count());

await browser.close();
