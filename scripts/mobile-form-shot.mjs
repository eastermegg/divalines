import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:4123/fr", { waitUntil: "networkidle" });
await page.locator('[data-hero] [data-waitlist]').screenshot({ path: "/tmp/mobile-form.png" });
// footer onLight
await page.locator('footer [data-waitlist]').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.locator('footer [data-waitlist]').screenshot({ path: "/tmp/footer-form.png" });
// footer panel (returning, onLight)
await page.evaluate(() => localStorage.setItem("divalines_me", "dev4me"));
await page.reload({ waitUntil: "networkidle" });
await page.locator('footer [data-waitlist]').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.locator('footer [data-waitlist]').screenshot({ path: "/tmp/footer-panel.png" });
await browser.close();
