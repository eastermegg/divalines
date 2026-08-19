import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage();
let body = null;
await page.route("**/api/waitlist", async (route) => {
  body = route.request().postData();
  await route.continue();
});
await page.goto("http://localhost:4123/fr?ref=marr41", { waitUntil: "networkidle" });
await page.fill('input[name="email"]', "e2e@example.com");
await page.fill('input[name="insta"]', "@Ma.Copine");
await page.click('[data-waitlist-cta]');
await page.waitForSelector('[role="dialog"]');
console.log("POST body:", body);
// Enter key inside the insta field submits too?
await browser.close();
