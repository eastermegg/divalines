import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
await page.screenshot({ path: ".context/shots/grain-crop.png", clip: { x: 350, y: 150, width: 400, height: 300 } });
await browser.close();
console.log("saved");
