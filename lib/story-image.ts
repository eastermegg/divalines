"use client";

/**
 * Instagram-story visual (1080×1920), composed client-side in a <canvas>
 * and downloaded as PNG — zero backend (spec §3bis).
 *
 * Background: the designer's static asset at /story-bg.png when present
 * (with the middle band kept free for the dynamic text). Until that asset
 * lands, a programmatic backdrop in the site's heat palette so the button
 * works from day one. No URL is drawn on the image — the link travels via
 * the clipboard and gets pasted as a link sticker.
 *
 * Brand rules honored: all copy lowercase italic, no dancer imagery to
 * crop, pieces stay veiled.
 */

const W = 1080;
const H = 1920;

/** Designer asset (optional). Swap the file in /public, keep the name. */
const BG_SRC = "/story-bg.png";

export type StoryText = {
  /** « je suis sur la liste » */
  title: string;
  /** e.g. "47e" — display-face hero line */
  rank: string;
  /** e.g. "sur 230" */
  ofTotal: string;
  /** wordmark line, e.g. "divalines" (fallback background only) */
  brand: string;
};

/** Resolve one of the site's font stacks (--font-display / --font-serif /
 * --font-sans) to a canvas-usable font-family list. */
function fontStack(varName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Heat-palette backdrop echoing the site: night ground, glowing orbs,
 * a whisper of grain — used until the designer's PNG exists. */
function paintFallbackBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#0e0a16";
  ctx.fillRect(0, 0, W, H);

  const orbs: [number, number, number, string][] = [
    [W * 0.82, H * 0.16, 620, "rgba(255,94,196,0.34)"], // neon pink, top right
    [W * 0.12, H * 0.88, 700, "rgba(255,122,47,0.30)"], // heat orange, bottom left
    [W * 0.5, H * 0.55, 860, "rgba(110,43,168,0.32)"], // violet, center
  ];
  for (const [x, y, r, color] of orbs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(14,10,22,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Sparse grain so the gradients read printed, not flat.
  ctx.fillStyle = "rgba(244,234,220,0.05)";
  let seed = 9;
  for (let i = 0; i < 4200; i++) {
    // Tiny LCG — deterministic speckle, no Math.random in hot loop needed.
    seed = (seed * 48271) % 2147483647;
    const x = seed % W;
    seed = (seed * 48271) % 2147483647;
    const y = seed % H;
    ctx.fillRect(x, y, 2, 2);
  }
}

/** Compose the story PNG and return it as a data URL. */
export async function renderStoryImage(text: StoryText): Promise<string> {
  // Make sure Greed/Migra are usable inside the canvas before drawing.
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d unavailable");

  const bg = await loadImage(BG_SRC);
  if (bg) {
    // Cover-fit the designer asset.
    const scale = Math.max(W / bg.width, H / bg.height);
    const dw = bg.width * scale;
    const dh = bg.height * scale;
    ctx.drawImage(bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    paintFallbackBackground(ctx);
  }

  const display = fontStack("--font-display", "'Arial Narrow', sans-serif");
  const serif = fontStack("--font-serif", "Georgia, serif");

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4eadc";

  // Dynamic band, centered — the zone the designer keeps free on the asset.
  ctx.font = `italic 200 64px ${serif}`;
  ctx.fillText(text.title, W / 2, H * 0.42);

  ctx.save();
  ctx.shadowColor = "rgba(255,122,47,0.55)";
  ctx.shadowBlur = 90;
  ctx.font = `italic 500 340px ${display}`;
  ctx.fillText(text.rank, W / 2, H * 0.42 + 330);
  ctx.restore();

  ctx.font = `italic 200 72px ${serif}`;
  ctx.fillStyle = "rgba(244,234,220,0.82)";
  ctx.fillText(text.ofTotal, W / 2, H * 0.42 + 460);

  if (!bg) {
    // Wordmark signature — only on the programmatic backdrop; the
    // designer's asset carries its own branding.
    ctx.fillStyle = "#f4eadc";
    ctx.font = `italic 500 84px ${display}`;
    ctx.fillText(text.brand, W / 2, H * 0.88);
    ctx.font = `italic 200 40px ${serif}`;
    ctx.fillStyle = "rgba(244,234,220,0.7)";
    ctx.fillText("✦", W / 2, H * 0.88 + 80);
  }

  return canvas.toDataURL("image/png");
}

/** In-app browsers (Instagram, Facebook…) ignore the download attribute —
 * the caller then shows the long-press-to-save fallback instead. */
export function canDownloadFile(): boolean {
  const inApp = /instagram|fbav|fban|line\/|micromessenger/i.test(
    navigator.userAgent,
  );
  return !inApp && "download" in HTMLAnchorElement.prototype;
}

export function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
