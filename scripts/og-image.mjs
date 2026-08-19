// Renders public/og.png (1200×630) from the brand assets — the link
// preview for every WhatsApp/DM/story share. Re-run after asset changes:
//   node scripts/og-image.mjs
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pub = (p) => resolve(import.meta.dirname, "../public", p);
const font = (f) => readFileSync(pub(`fonts/${f}`)).toString("base64");
// Inline the solid wordmark (fill="white" → cream) so it reads at
// thumbnail size — the outline letterforms are too faint there.
const wordmark = readFileSync(pub("logos/wordmark.svg"), "utf8").replace(
  /fill="white"/g,
  'fill="#f4eadc"',
);

const html = `<!doctype html><html><head><style>
  @font-face { font-family: Greed; src: url(data:font/woff2;base64,${font("GreedNarrow-MediumItalic.woff2")}) format("woff2"); font-weight: 500; font-style: italic; }
  @font-face { font-family: Migra; src: url(data:font/woff2;base64,${font("MigraItalic-ExtralightItalic.woff2")}) format("woff2"); font-weight: 200; font-style: italic; }
  @font-face { font-family: Switzer; src: url(data:font/woff2;base64,${font("Switzer-Regular.woff2")}) format("woff2"); }
  * { margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative; background:
    radial-gradient(52% 60% at 106% -8%, #FFF1DC 0%, #FF8A3A 22%, #FF5A12 42%, rgba(196,137,232,.9) 68%, transparent 100%),
    radial-gradient(56% 64% at -6% 108%, #FFF1DC 0%, #FF8A3A 22%, #FF5A12 42%, rgba(196,137,232,.9) 68%, transparent 100%),
    #0E0A16; }
  .mark  { position: absolute; top: 168px; left: 50%; transform: translateX(-50%); width: 940px; filter: drop-shadow(0 10px 60px rgba(14,10,22,.6)); }
  .mark svg { width: 100%; height: auto; display: block; }
  .tag   { position: absolute; left: 0; right: 0; bottom: 116px; text-align: center; font: italic 200 46px Migra; color: #f4eadc; letter-spacing: .01em; }
  .meta  { position: absolute; left: 0; right: 0; bottom: 60px; text-align: center; font: 21px Switzer; color: rgba(244,234,220,.75); }
</style></head><body>
  <div class="mark">${wordmark}</div>
  <div class="tag">tu la sentiras avant de la voir ✦</div>
  <div class="meta">divalines.com — automne 2026, série limitée</div>
</body></html>`;

const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: pub("og.png") });
await browser.close();
console.log("wrote public/og.png");
