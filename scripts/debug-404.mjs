import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage();
page.on("response", r => { if (r.status() >= 400) console.log(r.status(), r.url()); });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await browser.close();
