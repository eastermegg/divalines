import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// fresh visitor: submit against the frozen API → closed block
await page.goto("http://localhost:4123/fr", { waitUntil: "networkidle" });
await page.fill('input[name="email"]', "late@example.com");
await page.click('[data-waitlist-cta]');
await page.waitForTimeout(800);
console.log("closed title:", (await page.locator('[data-waitlist] .font-display').first().textContent().catch(() => null))?.trim());
console.log("forms left:", await page.locator('[data-waitlist] form').count());

// returning visitor: me in storage → panel + closed heading, no signup form
await page.evaluate(() => localStorage.setItem("divalines_me", "dev4me"));
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector('[data-referral-panel]', { timeout: 5000 });
console.log("returning: panels:", await page.locator('[data-referral-panel]').count(),
  "closed headings:", await page.locator('[data-waitlist] .font-display').count());
await page.screenshot({ path: "/tmp/closed-returning.png" });
await browser.close();
