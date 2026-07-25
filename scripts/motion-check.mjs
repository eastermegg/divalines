import { chromium } from "playwright-core";
const exec = "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium";
const browser = await chromium.launch({ executablePath: exec });

// 1. normal motion: scroll into manifesto, count dim vs lit words
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 300)));
page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.evaluate(() => {
  const el = document.querySelector("[data-manifesto-section]");
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 350);
});
await page.waitForTimeout(1500);
const words = await page.evaluate(() => {
  const ws = [...document.querySelectorAll("[data-manifesto] .w")];
  const lit = ws.filter(w => getComputedStyle(w).color === "rgb(244, 234, 220)").length;
  return { total: ws.length, lit };
});
console.log("manifesto words:", JSON.stringify(words));
console.log("lenis active:", await page.evaluate(() => document.documentElement.classList.contains("lenis")));
await page.screenshot({ path: ".context/shots/v1-manifesto-mid.png" });
console.log("errors:", errors.length ? errors : "none");
await page.close();

// 2. reduced motion: no split, text lit, no Lenis
const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
const p2 = await ctx.newPage();
await p2.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await p2.waitForTimeout(800);
const rm = await p2.evaluate(() => ({
  splitWords: document.querySelectorAll("[data-manifesto] .w").length,
  manifestoColor: getComputedStyle(document.querySelector("[data-manifesto]")).color,
  lenis: document.documentElement.classList.contains("lenis"),
}));
console.log("reduced-motion:", JSON.stringify(rm));
await browser.close();
