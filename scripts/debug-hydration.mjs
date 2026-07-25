import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage();
page.on("console", m => console.log("console:", m.type(), m.text().slice(0, 300)));
page.on("pageerror", e => console.log("pageerror:", String(e).slice(0, 600)));
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const top = document.getElementById("top");
  const fiberKeys = top ? Object.keys(top).filter(k => k.startsWith("__react")) : [];
  // does clicking the vinyl toggle aria-pressed? (proves handlers attached)
  return {
    fiberAttached: fiberKeys.length > 0,
    nextData: !!document.getElementById("__NEXT_DATA__"),
    countdownText: document.querySelector("[data-countdown]")?.textContent,
  };
});
console.log(JSON.stringify(info));
await browser.close();
