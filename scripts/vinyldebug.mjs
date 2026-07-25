import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
await page.click("[data-vinyl]");
await page.waitForTimeout(1000);
console.log(await page.evaluate(() => {
  const btn = document.querySelector("[data-vinyl]");
  const panel = btn.parentElement.querySelector("div");
  const iframe = btn.parentElement.querySelector("iframe");
  const r = panel.getBoundingClientRect();
  return JSON.stringify({
    expanded: btn.getAttribute("aria-expanded"),
    panelClass: panel.className.slice(0, 120),
    panelRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    iframe: iframe ? iframe.src.slice(0, 60) : null,
    iframeH: iframe?.getBoundingClientRect().height,
  });
}));
await page.waitForTimeout(3000);
await page.screenshot({ path: ".context/shots/vinyl-open2.png", clip: { x: 1100, y: 0, width: 412, height: 360 } });
await browser.close();
