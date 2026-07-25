import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("http://localhost:4123/", { waitUntil: "commit" });
await page.waitForTimeout(400);
for (const [wait, name] of [[800, "pl2-a"], [1200, "pl2-b"], [1200, "pl2-c"], [1200, "pl2-d"], [1500, "pl2-e"]]) {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `.context/shots/${name}.png` });
}
await browser.close();
console.log("done");
