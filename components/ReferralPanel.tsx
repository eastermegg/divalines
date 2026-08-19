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
import { SITE } from "@/lib/site";

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
}: {
  info: RankInfo;
  /** Restyle for the footer's bright heat gradient. */
  onLight?: boolean;
  /** Present only on the returning-visitor block. */
  onNotYou?: () => void;
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
        title: R.storyTitle,
        rank: formatRank(info.rank, locale),
        ofTotal: fill(R.storyOf, { total: info.total ?? 0 }),
        brand: SITE.name.toLowerCase(),
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

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    fill(R.whatsappText, { link }),
  )}`;

  // Contrast sets, mirroring WaitlistForm's onLight treatment.
  const heading = onLight ? "text-night" : "text-cream";
  const body = onLight ? "text-night/75" : "text-cream/70";
  const linkBox = onLight
    ? "border-night/25 text-night"
    : "border-cream/20 text-cream";
  const ghostBtn = onLight
    ? "border-night/30 text-night hover:bg-night/10"
    : "border-cream/25 text-cream hover:bg-cream/10";

  const rankParts = R.rankLine.split("{rank}");

  return (
    <div data-referral-panel className="flex flex-col gap-4">
      {/* Distance to the threshold — THE line of the panel (spec: visually
          above the raw rank), so it leads in the serif accent voice. */}
      {info.rank !== undefined ? (
        <div className="flex flex-col gap-1.5">
          {info.diva_name ? (
            <p className={`text-xs ${body}`}>
              {R.stageLabel}{" "}
              <span className={`font-serif text-sm italic ${heading}`}>
                {info.diva_name}
              </span>
            </p>
          ) : null}
          <p className={`font-serif text-xl italic sm:text-2xl ${heading}`}>
            {info.to_top10 === 0
              ? R.topTenLine
              : info.to_top10 === 1
                ? R.toTopOne
                : fill(R.toTopMany, { n: info.to_top10 ?? 0 })}
          </p>
          <p className={`text-sm ${body}`}>
            {rankParts[0]}
            <strong className={`font-medium ${heading}`}>
              {formatRank(info.rank, locale)}
            </strong>
            {fill(rankParts[1] ?? "", { total: info.total ?? 0 })}
            {info.referrals ? (
              <> · {fill(R.referralsLine, { n: info.referrals })}</>
            ) : null}
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
            className={`shrink-0 cursor-pointer rounded-pill border px-3.5 py-1.5 text-xs font-medium transition-colors ${ghostBtn}`}
          >
            {copied ? R.copied : R.copy}
          </button>
        </div>
      </div>

      {/* Share actions — story first: it's the channel for this crowd */}
      <div className="flex flex-wrap items-center gap-2.5">
        {info.rank !== undefined ? (
          <button
            type="button"
            onClick={onStory}
            disabled={storyBusy}
            className="cta-heat cursor-pointer rounded-pill px-6 py-3 text-sm font-medium disabled:opacity-70"
          >
            {storyBusy ? "…" : R.story}
          </button>
        ) : null}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-pill border px-6 py-3 text-sm font-medium transition-colors ${ghostBtn}`}
        >
          {R.whatsapp}
        </a>
      </div>

      <p className={`text-xs ${body}`}>{R.rule}</p>

      <a
        href={`/${locale}/classement`}
        className={`self-start text-xs underline underline-offset-4 ${body} hover:opacity-80`}
      >
        {R.seeBoard} →
      </a>

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
