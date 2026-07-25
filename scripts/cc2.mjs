import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
for (const path of ["/liquid", "/pulse"]) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e).slice(0, 400)));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 400)); });
  await page.goto("http://localhost:4123" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  console.log(path, "errors:", errs.length ? errs : "none");
  await page.close();
}
await browser.close();
