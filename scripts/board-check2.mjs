import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });

// signed-up visitor (me = verif-board lead) → board highlights her row
await page.goto("http://localhost:4123/fr", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.setItem("divalines_me", "h9xm2m"));
await page.goto("http://localhost:4123/fr/classement", { waitUntil: "domcontentloaded" });
await page.waitForSelector('ol[aria-label] li', { timeout: 10000 });
await page.waitForSelector('text=toi ✦', { timeout: 10000 });
console.log("rows:", await page.locator('ol[aria-label] li').count());
console.log("my row:", (await page.locator('ol[aria-label] li').nth(5).innerText()).replace(/\n/g, " | "));
console.log("panel below:", await page.locator('[data-referral-panel]').count());
await page.screenshot({ path: "/tmp/board-me2.png", fullPage: true });

// EN board
await page.goto("http://localhost:4123/en/classement", { waitUntil: "domcontentloaded" });
await page.waitForSelector('ol[aria-label] li', { timeout: 10000 });
console.log("en h1:", (await page.locator("h1").textContent()).trim());
console.log("en you tag:", await page.locator('text=you ✦').count());
console.log("en refs label:", (await page.locator('ol[aria-label] li').first().innerText()).replace(/\n/g, " | "));
await browser.close();
