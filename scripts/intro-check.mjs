import { chromium } from "playwright-core";
const exec = "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium";
const browser = await chromium.launch({ executablePath: exec });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 300)));
page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });

await page.goto("http://localhost:4123/", { waitUntil: "commit" });
await page.waitForTimeout(500);
await page.screenshot({ path: ".context/shots/intro-t05.png" });
await page.waitForTimeout(700);
await page.screenshot({ path: ".context/shots/intro-t12.png" });
await page.waitForTimeout(1500);
await page.screenshot({ path: ".context/shots/intro-t27.png" });
console.log("intro flag:", await page.evaluate(() => sessionStorage.getItem("dl:intro")));
console.log("data-intro:", await page.evaluate(() => document.documentElement.dataset.intro));

// reload same session → skip
await page.reload({ waitUntil: "commit" });
await page.waitForTimeout(400);
await page.screenshot({ path: ".context/shots/intro-reload.png" });
console.log("after reload data-intro:", await page.evaluate(() => document.documentElement.dataset.intro));
console.log("preloader display:", await page.evaluate(() => getComputedStyle(document.querySelector(".preloader")).display));
console.log("errors:", errors.length ? errors : "none");
await browser.close();
