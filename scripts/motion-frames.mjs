import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto("http://localhost:4123/", { waitUntil: "networkidle" });
await page.waitForTimeout(4000); // intro fully done
const clip = { x: 900, y: 60, width: 500, height: 400 }; // top-right blob region
const frames = [];
for (let i = 0; i < 3; i++) {
  frames.push(await page.screenshot({ clip }));
  await page.screenshot({ path: `.context/shots/frame-${i}.png`, clip });
  await page.waitForTimeout(1500);
}
// crude diff: count differing bytes between consecutive PNGs (decoded via raw buffer compare is unreliable; use pixel sampling through canvas in page instead)
const diffs = await page.evaluate(async () => {
  // sample the same canvas region twice, 1s apart
  const canvas = document.querySelector("canvas");
  if (!canvas) return "no canvas";
  const snap = () => {
    const c = document.createElement("canvas");
    c.width = 200; c.height = 200;
    c.getContext("2d").drawImage(canvas, 900, 100, 200, 200, 0, 0, 200, 200);
    return c.getContext("2d").getImageData(0, 0, 200, 200).data;
  };
  const a = snap();
  await new Promise(r => setTimeout(r, 1000));
  const b = snap();
  let changed = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) > 6) changed++;
  }
  return `${changed} of 40000 sampled pixels changed over 1s`;
});
console.log("shader motion:", diffs);
await browser.close();
