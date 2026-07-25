import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
const errs = [];
page.on("pageerror", e => errs.push(String(e).slice(0,200)));
page.on("console", m => { if (m.type()==="error") errs.push(m.text().slice(0,200)); });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(4500);
// mid-fill state
await page.evaluate(() => {
  const el = document.querySelector("[data-manifesto-section]");
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 320);
});
await page.waitForTimeout(1500);
console.log("fill:", await page.evaluate(() => getComputedStyle(document.querySelector("[data-manifesto]")).getPropertyValue("--fill")));
await page.screenshot({ path: ".context/shots/fill-mid.png" });
console.log("errors:", errs.length ? errs : "none");
await browser.close();
