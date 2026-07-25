// White-background JPG -> transparent PNG via luminance matte, downscaled.
import { readFileSync, writeFileSync } from "fs";
import { chromium } from "playwright-core";

const src = readFileSync(".context/attachments/WWdsnc/silhouettes@2x.jpg").toString("base64");
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage();
const dataUrl = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = "data:image/jpeg;base64," + b64;
  await img.decode();
  const targetH = 1600;
  const scale = targetH / img.naturalHeight;
  const w = Math.round(img.naturalWidth * scale);
  const c = document.createElement("canvas");
  c.width = w; c.height = targetH;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, w, targetH);
  const d = ctx.getImageData(0, 0, w, targetH);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const a = Math.max(0, Math.min(255, 255 - lum));  // white -> 0, black -> 255
    if (a > 0) {
      // un-matte from white so soft edges don't go milky
      const af = a / 255;
      px[i]     = Math.max(0, Math.min(255, (r - (1 - af) * 255) / af));
      px[i + 1] = Math.max(0, Math.min(255, (g - (1 - af) * 255) / af));
      px[i + 2] = Math.max(0, Math.min(255, (b - (1 - af) * 255) / af));
    }
    px[i + 3] = a;
  }
  ctx.putImageData(d, 0, 0);
  return c.toDataURL("image/png");
}, src);
writeFileSync("public/images/dancer.png", Buffer.from(dataUrl.split(",")[1], "base64"));
await browser.close();
console.log("saved public/images/dancer.png");
