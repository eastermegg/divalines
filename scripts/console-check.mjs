import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage();
page.on("console", m => { if (["error","warning"].includes(m.type())) console.log(m.type().toUpperCase()+":", m.text().slice(0,500)); });
page.on("pageerror", e => console.log("PAGEERROR:", String(e).slice(0,500)));
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await browser.close();
