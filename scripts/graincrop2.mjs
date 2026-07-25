import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
await page.screenshot({ path: ".context/shots/grain-blob.png", clip: { x: 1050, y: 60, width: 400, height: 300 } });
await page.screenshot({ path: ".context/shots/grain-full.png" });
await browser.close();
console.log("saved");
