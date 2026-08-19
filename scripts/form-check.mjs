import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage();
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
// invalid first
await page.fill('input[name="email"]', "nope");
await page.click('[data-waitlist-cta]');
await page.waitForTimeout(400);
console.log("error shown:", await page.locator('[data-waitlist] .text-neon-pink').first().textContent().catch(()=>null));
// then valid → referral modal (replaces the old success pill)
await page.fill('input[name="email"]', "e2e@example.com");
await page.click('[data-waitlist-cta]');
await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
console.log("success modal:", (await page.locator('[role="dialog"] .font-display').first().textContent()).trim());
// keyboard reachability: tab from top to submit
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
const seen = [];
for (let i = 0; i < 12; i++) {
  await page.keyboard.press("Tab");
  seen.push(await page.evaluate(() => {
    const el = document.activeElement;
    return el.getAttribute("aria-label") || el.getAttribute("name") || el.textContent?.trim().slice(0, 24) || el.tagName;
  }));
}
console.log("tab order:", seen.join(" → "));
await browser.close();
