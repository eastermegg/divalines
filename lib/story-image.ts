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

/** Designer templates — one per heat colourway. The variant is stable
 * per person (hashed from her ref code) so SHE always gets her colour,
 * but colours alternate across the gang's stories. Each template already
 * carries the wordmark + descriptor (top) and the dashed "Ajoute ton
 * lien ✦" slot (lower third) — the canvas only adds the dynamic band. */
const BG_SRCS = ["/story-bg-1.png", "/story-bg-2.png", "/story-bg-3.png"];

export type StoryText = {
  /** Her stage name — "Diva Rita Mirage". The shareable identity. */
  name: string;
  /** « j'ai pris ma place » */
  claim: string;
  /** e.g. "109e" — formatted rank */
  rankLabel: string;
  /** Numeric rank — drives the template (top 10: rank hero; else: name hero) */
  rankValue: number;
  /** e.g. "sur 230" */
  ofTotal: string;
  /** « la waiting list du premier drop est ouverte » */
  sticker: string;
  /** « colle ton lien ici ✦ » — label inside the link-sticker slot
   * (programmatic fallback only; the designer templates carry theirs) */
  linkSlot: string;
  /** wordmark line, e.g. "divalines" (fallback only) */
  brand: string;
  /** 0..2 — colourway index, stable per person */
  variant: number;
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

  const bg = await loadImage(BG_SRCS[Math.abs(text.variant) % BG_SRCS.length]);
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

  /** Shrink a font until `str` fits maxWidth (long stage names — "Diva
   * Nikita Cadence" — must never bleed off the 9:16 frame). */
  const fit = (
    str: string,
    px: number,
    minPx: number,
    maxWidth: number,
    font: (px: number) => string,
  ) => {
    let size = px;
    ctx.font = font(size);
    while (size > minPx && ctx.measureText(str).width > maxWidth) {
      size -= 4;
      ctx.font = font(size);
    }
    return size;
  };

  const serifFont = (px: number) => `italic 200 ${px}px ${serif}`;
  const displayFont = (px: number) => `italic 500 ${px}px ${display}`;
  const maxW = W - 140;
  const topTier = text.rankValue <= 10;
  // Bright designer gradients: cream ink with a soft night shadow reads on
  // every colourway (an orange glow would vanish on the orange template).
  const inkShadow = () => {
    ctx.shadowColor = "rgba(14,10,22,0.55)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 4;
  };

  if (bg) {
    // ── Template mode: wordmark, descriptor and the link slot are baked
    // into the asset — draw only the dynamic band in the free middle zone.
    // The orange→lavande template (index 2) has a LIGHT middle band, so
    // its ink flips to night (no shadow needed on a light ground).
    const darkInk = Math.abs(text.variant) % BG_SRCS.length === 2;
    const soft = darkInk ? "rgba(14,10,22,0.9)" : "rgba(244,234,220,0.95)";
    const full = darkInk ? "#0e0a16" : "#f4eadc";
    ctx.save();
    if (!darkInk) inkShadow();

    // 1. name — identity line, serif italic, deliberately small
    ctx.fillStyle = soft;
    fit(text.name, 60, 40, maxW, serifFont);
    ctx.fillText(text.name, W / 2, H * 0.3);

    // 2. claim
    ctx.font = serifFont(44);
    ctx.fillText(text.claim, W / 2, H * 0.3 + 84);

    // 3. tier badge (top 10 only), then the rank — the hero
    if (topTier) {
      ctx.font = displayFont(80);
      ctx.fillText(text.rankValue <= 5 ? "Top 5 ✦" : "Top 10 ✦", W / 2, H * 0.43);
    }
    ctx.fillStyle = full;
    fit(text.rankLabel, 400, 220, maxW, displayFont);
    ctx.fillText(text.rankLabel, W / 2, H * 0.44 + 330);

    ctx.font = serifFont(60);
    ctx.fillStyle = full;
    ctx.fillText(text.ofTotal, W / 2, H * 0.44 + 440);

    // The context line — why this story exists — just above the baked-in
    // "Ajoute ton lien" slot.
    ctx.fillStyle = soft;
    fit(text.sticker, 42, 30, maxW, serifFont);
    ctx.fillText(text.sticker, W / 2, H * 0.705);
    ctx.restore();

    return canvas.toDataURL("image/png");
  }

  // ── Programmatic fallback (no template asset): draw everything.
  // 1. name — identity line, serif italic, deliberately small
  ctx.fillStyle = "rgba(244,234,220,0.9)";
  fit(text.name, 60, 40, maxW, serifFont);
  ctx.fillText(text.name, W / 2, H * 0.27);

  // 2. claim
  ctx.font = serifFont(44);
  ctx.fillStyle = "rgba(244,234,220,0.7)";
  ctx.fillText(text.claim, W / 2, H * 0.27 + 84);

  // 3. tier badge (top 10 only), then the rank — the hero
  if (topTier) {
    ctx.fillStyle = "#ffd9a8";
    ctx.font = displayFont(80);
    ctx.fillText(text.rankValue <= 5 ? "Top 5 ✦" : "Top 10 ✦", W / 2, H * 0.40);
  }
  ctx.save();
  ctx.shadowColor = "rgba(255,122,47,0.55)";
  ctx.shadowBlur = 100;
  ctx.fillStyle = "#f4eadc";
  fit(text.rankLabel, 400, 220, maxW, displayFont);
  ctx.fillText(text.rankLabel, W / 2, H * 0.41 + 360);
  ctx.restore();

  ctx.font = serifFont(64);
  ctx.fillStyle = "rgba(244,234,220,0.82)";
  ctx.fillText(text.ofTotal, W / 2, H * 0.41 + 470);

  // 4. the link-sticker slot — a dashed pill marking where the sticker
  // goes, with the open-list line above it.
  ctx.font = serifFont(40);
  ctx.fillStyle = "rgba(244,234,220,0.72)";
  fit(text.sticker, 40, 28, maxW, serifFont);
  ctx.fillText(text.sticker, W / 2, H * 0.715);

  const slotW = 620;
  const slotH = 128;
  const slotX = (W - slotW) / 2;
  const slotY = H * 0.735;
  // roundRect is missing on older Safari — trace the pill by hand then.
  const pill = () => {
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(slotX, slotY, slotW, slotH, slotH / 2);
    } else {
      const r = slotH / 2;
      ctx.moveTo(slotX + r, slotY);
      ctx.lineTo(slotX + slotW - r, slotY);
      ctx.arc(slotX + slotW - r, slotY + r, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(slotX + r, slotY + slotH);
      ctx.arc(slotX + r, slotY + r, r, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.closePath();
    }
  };
  ctx.save();
  ctx.strokeStyle = "rgba(255,122,47,0.85)";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 14]);
  pill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255,122,47,0.08)";
  pill();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#ffd9a8";
  fit(text.linkSlot, 46, 32, slotW - 80, serifFont);
  ctx.fillText(text.linkSlot, W / 2, slotY + slotH / 2 + 16);

  // 5. wordmark signature
  ctx.fillStyle = "#f4eadc";
  ctx.font = displayFont(72);
  ctx.fillText(`${text.brand} ✦`, W / 2, H * 0.915);

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
