import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("http://localhost:4123/", { waitUntil: "commit" });
// wait for hydration signal: preloader line present & timeline started
await page.waitForTimeout(400);
const stamps = [[0, "pl-a"], [500, "pl-b"], [500, "pl-c"], [500, "pl-d"], [900, "pl-e"], [1200, "pl-f"]];
for (const [wait, name] of stamps) {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `.context/shots/${name}.png` });
}
await browser.close();
console.log("done");
