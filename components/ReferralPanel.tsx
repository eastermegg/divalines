"use client";

import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/fill";
import {
  buildRefLink,
  copyText,
  formatRank,
  type RankInfo,
} from "@/lib/referral";
import {
  canDownloadFile,
  renderStoryImage,
  triggerDownload,
} from "@/lib/story-image";
import { PRIZE_TOP_N, SITE, SOCIALS } from "@/lib/site";

/* ── Share glyphs ─────────────────────────────────────────────────── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.377-.885zm5.383-5.775c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      className={className}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 3v12" />
      <path d="M8 6.5 12 3l4 3.5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

/**
 * The referral content block — rank, distance to the top 10, the link and
 * the three share actions. Rendered in two places with the same content
 * (spec §3): inside the post-signup modal, and inline in place of the form
 * for returning visitors (then with the "not you?" escape hatch).
 */
export default function ReferralPanel({
  info,
  onLight = false,
  onNotYou,
  closed = false,
}: {
  info: RankInfo;
  /** Restyle for the footer's bright heat gradient. */
  onLight?: boolean;
  /** Present only on the returning-visitor block. */
  onNotYou?: () => void;
  /** Signups frozen → final place + a single follow CTA, no sharing. */
  closed?: boolean;
}) {
  const { dict, locale } = useDictionary();
  const R = dict.referral;
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [storyBusy, setStoryBusy] = useState(false);
  /** Data URL shown full-screen when a real download isn't possible
   * (Instagram/Facebook in-app browsers) — long-press to save. */
  const [storyFallback, setStoryFallback] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const link =
    typeof window === "undefined" ? "" : buildRefLink(info.ref_code);

  // Touch devices get the system share sheet; desktop deep-links WhatsApp.
  // Media-query detection (not user-agent), resolved post-mount so SSR and
  // the first client render agree (desktop label by default).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(
      window.matchMedia("(pointer: coarse) and (hover: none)").matches,
    );
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4600);
  }

  async function onCopy() {
    if (await copyText(link)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

  async function onStory() {
    if (storyBusy || info.rank === undefined) return;
    setStoryBusy(true);
    // Copy first, inside the click gesture — Safari drops clipboard
    // permission once the canvas work has yielded to the event loop.
    const copiedOk = await copyText(link);
    try {
      const dataUrl = await renderStoryImage({
        name: info.diva_name ?? SITE.name,
        claim: R.storyTitle,
        rankLabel: formatRank(info.rank, locale),
        rankValue: info.rank,
        ofTotal: fill(R.storyOf, { total: info.total ?? 0 }),
        sticker: R.storySticker,
        linkSlot: R.storyLinkSlot,
        brand: SITE.name.toLowerCase(),
        // Colourway stable per person: her code always maps to HER template,
        // but colours alternate across different girls' stories.
        variant: [...info.ref_code].reduce((a, c) => a + c.charCodeAt(0), 0),
      });
      if (canDownloadFile()) {
        triggerDownload(dataUrl, "divalines-story.png");
        showToast(copiedOk ? R.storyToast : R.storyFallback);
      } else {
        setStoryFallback(dataUrl);
      }
    } catch {
      // Canvas failed (ancient browser) — the copied link still shares.
      if (copiedOk) showToast(R.copied);
    } finally {
      setStoryBusy(false);
    }
  }

  // Validated share message: lowercase, one ✦, the link ALONE on the last
  // line so the WhatsApp preview stays clean.
  function openWhatsApp() {
    const msg = encodeURIComponent(`${R.shareText}\n${link}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  async function onShare() {
    if (isMobile && navigator.share) {
      try {
        // No `title`; text and url separate — the OS composes the message.
        await navigator.share({ text: R.shareText, url: link });
      } catch (err) {
        // AbortError = she closed the sheet — stay silent.
        if ((err as Error).name !== "AbortError") openWhatsApp();
      }
    } else {
      openWhatsApp();
    }
  }

  // Contrast sets, mirroring WaitlistForm's onLight treatment.
  const heading = onLight ? "text-night" : "text-cream";
  const body = onLight ? "text-night/75" : "text-cream/70";
  const linkBox = onLight
    ? "border-night/25 text-night"
    : "border-cream/20 text-cream";
  const ghostBtn = onLight
    ? "border-night/30 text-night hover:bg-night/10"
    : "border-cream/25 text-cream hover:bg-cream/10";
  // Copy sits inside the link pill — a filled chip (background, no border)
  // so it reads as a button, not another outline.
  const copyBtn = onLight
    ? "bg-night/10 text-night hover:bg-night/20"
    : "bg-cream/15 text-cream hover:bg-cream/25";

  const rankParts = R.rankLine.split("{rank}");

  // État 3 — signups closed: her final place and one door, the account.
  // Sharing is over; the link would be a dead end.
  if (closed) {
    return (
      <div data-referral-panel className="flex flex-col gap-4">
        {info.rank !== undefined ? (
          <p className={`font-display text-lg leading-snug text-balance italic sm:text-xl ${heading}`}>
            {fill(R.closedFinal, { rank: formatRank(info.rank, locale) })}
          </p>
        ) : null}
        <a
          href={SOCIALS[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-heat self-start cursor-pointer rounded-pill px-6 py-3 text-sm font-medium"
        >
          {R.followCta}
        </a>
      </div>
    );
  }

  return (
    <div data-referral-panel className="flex flex-col gap-4">
      {/* Her position — rank first (a plain fact in sans, the number in
          tabular figures so it doesn't wobble), then the share hook. */}
      {info.rank !== undefined ? (
        <div className="flex flex-col gap-1.5">
          <p className={`text-sm ${body}`}>
            {rankParts[0]}
            <strong className={`font-medium tabular-nums ${heading}`}>
              {formatRank(info.rank, locale)}
            </strong>
            {fill(rankParts[1] ?? "", { total: info.total ?? 0 })}
            {info.referrals ? (
              <> · {fill(R.referralsLine, { n: info.referrals })}</>
            ) : null}
          </p>
          {/* The action, in the display voice (Greed) — legible at clause
              length and subordinate to the title. Migra is reserved for
              single-word accents (the *inscrite* in the title). */}
          <p className={`font-display text-lg leading-snug text-balance italic sm:text-xl ${heading}`}>
            {R.shareLine}
          </p>
        </div>
      ) : null}

      {/* The link, in clear, with instant copy */}
      <div className="flex flex-col gap-1.5">
        <p className={`text-xs ${body}`}>{R.linkLabel}</p>
        <div
          className={`flex items-center gap-2 rounded-pill border px-4 py-2.5 ${linkBox}`}
        >
          <span className="min-w-0 flex-1 truncate text-sm">{link}</span>
          <button
            type="button"
            onClick={onCopy}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors ${copyBtn}`}
          >
            <CopyIcon className="size-[13px]" />
            {copied ? R.copied : R.copy}
          </button>
        </div>
      </div>

      {/* Share actions — the primary heat pill adapts: system share sheet
          on touch ("Partager" + generic glyph), WhatsApp deep link on
          desktop. The Instagram story follows as the ghost route. */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onShare}
          className="cta-heat inline-flex cursor-pointer items-center gap-2 rounded-pill px-6 py-3 text-sm font-medium"
        >
          {isMobile ? (
            <ShareIcon className="size-[18px]" />
          ) : (
            <WhatsAppIcon className="size-[18px]" />
          )}
          {isMobile ? R.share : R.whatsapp}
        </button>
        {info.rank !== undefined ? (
          <button
            type="button"
            onClick={onStory}
            disabled={storyBusy}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-pill border px-6 py-3 text-sm font-medium transition-colors disabled:opacity-70 ${ghostBtn}`}
          >
            <InstagramIcon className="size-[18px]" />
            {storyBusy ? "…" : R.story}
          </button>
        ) : null}
      </div>

      {/* The stakes, in small — the full pitch lives on the page */}
      <p className={`text-xs ${body}`}>{fill(R.sharePitch, { top: PRIZE_TOP_N })}</p>

      {onNotYou ? (
        <button
          type="button"
          onClick={onNotYou}
          className={`self-start cursor-pointer text-xs underline underline-offset-4 ${body} hover:opacity-80`}
        >
          {R.notYou}
        </button>
      ) : null}

      {/* Toast */}
      <div aria-live="polite">
        {toast ? (
          <p className="surface-veil text-cream fixed bottom-6 left-1/2 z-[90] w-max max-w-[92vw] -translate-x-1/2 rounded-pill px-6 py-3 text-center text-sm">
            {toast}
          </p>
        ) : null}
      </div>

      {/* Long-press fallback for in-app browsers */}
      {storyFallback ? (
        <div
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-4 bg-night/90 p-6 backdrop-blur-sm"
          onClick={() => setStoryFallback(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable asset */}
          <img
            src={storyFallback}
            alt={R.story}
            className="max-h-[72vh] w-auto rounded-[12px]"
          />
          <p className="text-cream/85 max-w-[32ch] text-center text-sm">
            {R.storyFallback}
          </p>
          <button
            type="button"
            className="text-cream cursor-pointer rounded-pill border border-cream/30 px-5 py-2 text-xs"
          >
            {R.close}
          </button>
        </div>
      ) : null}
    </div>
  );
}
