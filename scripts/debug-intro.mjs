import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
for (const path of ["/", "/liquid"]) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e).slice(0, 600)));
  await page.goto("http://localhost:4123" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const state = await page.evaluate(() => ({
    intro: document.documentElement.dataset.intro,
    flag: sessionStorage.getItem("dl:intro"),
    preloaderDisplay: getComputedStyle(document.querySelector(".preloader")).display,
    counter: document.querySelector("[data-preloader-counter]")?.textContent,
    hasGsap: !!window.gsap || "no-global",
    rafWorks: new Promise(res => { let n = 0; const t0 = performance.now(); const step = () => { n++; if (performance.now() - t0 > 300) res(n); else requestAnimationFrame(step); }; requestAnimationFrame(step); }),
  }));
  console.log(path, JSON.stringify(state), "pageerrors:", errs.length ? errs : "none");
  await page.close();
}
await browser.close();
