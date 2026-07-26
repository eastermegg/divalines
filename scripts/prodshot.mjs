import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("https://divalines-psi.vercel.app/", { waitUntil: "networkidle" });
await page.waitForTimeout(6000); // full preloader
await page.screenshot({ path: ".context/shots/prod-live.png" });
const api = await page.evaluate(async () => {
  const r = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "prod-verify@example.com" }) });
  return r.status + " " + (await r.text());
});
console.log("api:", api);
await browser.close();
