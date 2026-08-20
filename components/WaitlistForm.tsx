"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/fill";
import { PRIZE_TOP_N } from "@/lib/site";
import { usePathname, useRouter } from "next/navigation";
import AccentText from "@/components/AccentText";
import ReferralPanel from "@/components/ReferralPanel";
import {
  broadcastMe,
  captureRef,
  fetchRank,
  getMe,
  getStoredRef,
  onMeChange,
  setMe,
  type RankInfo,
} from "@/lib/referral";

type Status = "idle" | "loading" | "success" | "error";

/** Glowing diva orbs (no faces before launch, brand rule) — the "crowd"
 * cue under the home/footer form. Overlapping stack, newest on the left. */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#ff7a2f,#ff5ec4)",
  "linear-gradient(135deg,#ff5ec4,#6e2ba8)",
  "linear-gradient(135deg,#ffd9a8,#ff7a2f)",
  "linear-gradient(135deg,#c4408f,#6e2ba8)",
];

function collectUtm(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const [k, v] of params) {
    if (k.startsWith("utm_")) utm[k] = v.slice(0, 120);
  }
  return Object.keys(utm).length ? utm : undefined;
}

export default function WaitlistForm({
  compact = false,
  onLight = false,
  expanded = false,
}: {
  compact?: boolean;
  /** Restyle for a light background (e.g. the footer heat gradient). */
  onLight?: boolean;
  /** /classement only: a known visitor gets the full referral card
   * (rank + link + share) inline instead of the slim pill. */
  expanded?: boolean;
}) {
  const { dict, locale } = useDictionary();
  const FORM = dict.form;
  const R = dict.referral;
  const router = useRouter();
  const pathname = usePathname();
  // On /classement the state lives inline (expanded card); anywhere else
  // a fresh signup routes there rather than popping a modal in place.
  const onBoard = pathname?.includes("/classement") ?? false;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // Referral state: `info` present = she has a code (fresh signup or
  // restored from localStorage), so the form yields to the ranking panel.
  const [info, setInfo] = useState<RankInfo | null>(null);
  const [closed, setClosed] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);
  const inputId = useId();
  const errorId = useId();

  // Referral bootstrap: bank ?ref= for later, then restore "me" — a
  // returning subscriber sees her live ranking instead of the form.
  useEffect(() => {
    captureRef();
    if (document.body.dataset.waitlistClosed === "true") setClosed(true);
    // Dev-only override so the frozen state is testable without a rebuild
    // (the DevStateTester widget sets the flag). Stripped from prod builds.
    if (process.env.NODE_ENV === "development") {
      try {
        if (localStorage.getItem("dl:dev:closed") === "true") setClosed(true);
      } catch {}
    }
    const me = getMe();
    if (!me) return;
    let cancelled = false;
    fetchRank(me)
      .then((res) => {
        if (cancelled) return;
        if (res === null) {
          // Stale code (wiped row, hand-edited storage) — back to the form.
          setMe(null);
          return;
        }
        setInfo({
          ref_code: me,
          rank: res.rank,
          referrals: res.referrals,
          total: res.total,
          to_top10: res.to_top10,
          diva_name: res.diva_name,
        });
        if (res.closed) setClosed(true);
      })
      .catch(() => {
        /* rank endpoint down — keep the form usable */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror the sibling instance (hero ↔ footer): signup there shows the
  // panel here; "not you?" there restores the form here.
  useEffect(() => {
    return onMeChange((next) => {
      setInfo(next);
      if (next === null) setStatus("idle");
    });
  }, []);

  // Contrast set — dark veil + cream text by default, or a frosted light
  // pill with ink text + night CTA when placed on a bright gradient.
  const surface = onLight ? "surface-veil-light" : "surface-veil";
  const inputText = onLight
    ? "text-night placeholder:text-night/45"
    : "text-cream placeholder:text-cream/40";
  const ctaClass = onLight ? "bg-night text-cream hover:bg-night/85" : "cta-heat";
  const spinnerClass = onLight
    ? "border-cream/30 border-t-cream"
    : "border-night/30 border-t-night";
  const consentText = onLight ? "text-night/70" : "text-cream/60";
  const errorText = onLight ? "text-[#8f0f37]" : "text-neon-pink";
  const successText = onLight ? "text-night" : "text-cream";

  // Success pop: the pill settles in with a flash of the orange glow.
  useEffect(() => {
    const el = successRef.current;
    if (status !== "success" || !el || prefersReducedMotion()) return;
    gsap
      .timeline()
      .fromTo(
        el,
        { scale: 0.92, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.7)" },
      )
      .fromTo(
        el,
        { boxShadow: "0 0 0px 0px rgba(255,122,47,0)" },
        {
          boxShadow: "0 0 44px 2px rgba(255,122,47,0.45)",
          duration: 0.35,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        },
        0.1,
      );
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(FORM.errorInvalid);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          ref: getStoredRef() ?? undefined,
          utm: collectUtm(),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload?.ref_code) {
        // Signed up (or found again via `already`) — remember her, then
        // hand off to the game page (/classement) where she lands as
        // État 2. On the board itself the sibling instance updates inline,
        // so no navigation.
        setMe(payload.ref_code);
        const nextInfo: RankInfo = {
          ref_code: payload.ref_code,
          rank: payload.rank,
          referrals: payload.referrals,
          total: payload.total,
          to_top10: payload.to_top10,
          diva_name: payload.diva_name,
        };
        setInfo(nextInfo);
        setStatus("success");
        broadcastMe(nextInfo);
        if (!onBoard) router.push(`/${locale}/classement`);
      } else if (res.ok) {
        // Degraded payload without a code — fall back to the plain pill.
        setStatus("success");
      } else if (res.status === 403) {
        setClosed(true);
        setStatus("idle");
      } else if (res.status === 429) {
        setError(FORM.errorRateLimited);
        setStatus("error");
      } else if (res.status === 400) {
        setError(FORM.errorInvalid);
        setStatus("error");
      } else {
        setError(FORM.errorServer);
        setStatus("error");
      }
    } catch {
      setError(FORM.errorServer);
      setStatus("error");
    }
  }

  function onNotYou() {
    setMe(null);
    setInfo(null);
    setStatus("idle");
    broadcastMe(null);
  }

  // Sans on purpose: Migra is the editorial accent voice, never a CTA.
  // Every entry point routes to /classement — the game and her link live
  // there, never in an in-place modal.
  const entryLinkClass = `inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium underline underline-offset-4 ${successText} hover:opacity-80`;

  const boardLink = (label: string) => (
    <a href={`/${locale}/classement`} className={entryLinkClass}>
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );

  // Frozen (J-3) — the state itself is the message. A known visitor on
  // /classement still gets her full card (the expanded branch shows the
  // closed title inside it).
  if (closed && !(info && expanded)) {
    return (
      <div data-waitlist className={compact ? "" : "w-full max-w-[560px]"}>
        <div
          className={`${onLight ? "surface-card-light" : "surface-card"} rounded-[24px] p-6 text-left`}
        >
          <p className={`font-display text-2xl italic sm:text-3xl ${successText}`}>
            <AccentText text={R.closedTitle} />
          </p>
          <p className={`mt-2 text-sm ${consentText}`}>{R.closedBody}</p>
        </div>
        {/* No proof row in the frozen state — the link stands alone. */}
        {info ? (
          <div className="mt-2.5 px-5">{boardLink(R.seeMyRank)}</div>
        ) : null}
      </div>
    );
  }

  // She's on the list. On /classement (`expanded`) the full referral card
  // sits inline — that page IS the game, so her link and share actions
  // show without a tap. The modal still carries fresh-signup extras
  // (insta ask). Everywhere else: the slim status pill.
  if (info && expanded) {
    return (
      <div
        data-waitlist
        className={compact ? "" : "w-full max-w-[560px]"}
      >
        <div
          className={`${onLight ? "surface-card-light" : "surface-card"} rounded-[24px] p-5 text-left sm:p-6`}
        >
          <p
            className={`font-display mb-4 text-2xl italic sm:text-3xl ${successText}`}
          >
            <AccentText
              text={
                closed
                  ? R.closedTitle
                  : info.diva_name
                    ? fill(R.panelTitleNamed, { name: info.diva_name })
                    : R.panelTitle
              }
            />
          </p>
          <ReferralPanel
            info={info}
            onLight={onLight}
            onNotYou={closed ? undefined : onNotYou}
            closed={closed}
          />
        </div>
      </div>
    );
  }

  // She's on the list → the form gives way to a slim status pill: the
  // state in words plus two doors to /classement (where rank + link live).
  if (info) {
    return (
      <div data-waitlist className={compact ? "" : "w-full max-w-[560px]"}>
        <div
          className={`${surface} flex w-full flex-wrap items-baseline gap-x-4 gap-y-1.5 rounded-[20px] px-6 py-4 sm:rounded-pill sm:py-[22px] ${
            compact ? "" : "justify-center"
          }`}
        >
          <p className={`font-serif text-base italic ${successText}`}>
            {R.onList}
          </p>
          {boardLink(R.seeMyRank)}
          {boardLink(R.myLink)}
        </div>
      </div>
    );
  }

  // /classement (`expanded`): every state sits in the same card the
  // referral view uses — the ring, the title, the milestone ladder (what
  // she wins, right by the field), then the form.
  const cardWrap = (children: React.ReactNode) =>
    expanded ? (
      <div
        className={`${onLight ? "surface-card-light" : "surface-card"} rounded-[24px] p-5 sm:p-6`}
      >
        <p
          className={`font-display mb-3 text-xl italic text-balance sm:text-2xl ${successText}`}
        >
          <AccentText text={dict.leaderboard.joinTitle} />
        </p>
        {/* Milestone ladder — one short line per step, the payoff right
            above the field. */}
        <ol className="mb-4 flex flex-col gap-2.5">
          {dict.leaderboard.steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(120deg,#d1569e_0%,#ff7a2f_80%)] text-[11px] font-semibold text-night">
                {i + 1}
              </span>
              <p className={`text-sm font-medium ${successText}`}>{step}</p>
            </li>
          ))}
        </ol>
        {children}
      </div>
    ) : (
      children
    );

  if (status === "success") {
    return (
      <div data-waitlist className={compact ? "" : "w-full max-w-[560px]"}>
        {cardWrap(
          <>
            <p
              ref={successRef}
              data-waitlist-success
              className={`${surface} ${successText} flex h-[54px] w-full items-center justify-center rounded-[16px] px-8 font-serif text-base italic sm:h-[68px] sm:rounded-pill`}
              role="status"
            >
              {FORM.success}
            </p>
          </>,
        )}
      </div>
    );
  }

  return (
    <div data-waitlist className={compact ? "" : "w-full max-w-[560px]"}>
      {cardWrap(
        <>
          {/* The stakes, above the field — the promise reads BEFORE she
              types (home + footer; /classement's hero already sells it). */}
          {expanded ? null : (
            <p
              className={`mb-3 px-5 text-sm font-medium ${successText} ${
                compact ? "" : "text-center"
              }`}
            >
              {fill(R.stakes, { top: PRIZE_TOP_N })} ✦
            </p>
          )}
          {/* expanded (/classement panel): the column is narrow, so the form
          stays stacked at every size — input above, CTA below. */}
      <form
        onSubmit={onSubmit}
        noValidate
        className={
          expanded
            ? "flex flex-col gap-2.5"
            : `${surface} flex flex-col gap-1.5 rounded-[20px] p-1.5 sm:h-[68px] sm:flex-row sm:items-center sm:gap-2 sm:rounded-pill sm:p-[7px]`
        }
      >
        <label htmlFor={inputId} className="sr-only">
          {dict.waitlist.emailLabel}
        </label>
        {/* Expanded (/classement): the wrapper carries no surface, so the
            border lives on the field itself; elsewhere the pill's surface
            frames it and the input stays transparent. */}
        <input
          id={inputId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={FORM.placeholder}
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? errorId : undefined}
          className={`h-[54px] min-w-0 px-5 text-[16px] ${inputText} focus-visible:outline-offset-[-2px] sm:text-base ${
            expanded
              ? `${surface} rounded-[16px]`
              : "rounded-[14px] bg-transparent sm:h-[54px] sm:flex-1 sm:rounded-pill sm:px-[22px]"
          }`}
        />
        {/* Honeypot — invisible to humans, tempting to bots */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px opacity-0"
        />
        <button
          type="submit"
          data-waitlist-cta
          disabled={status === "loading"}
          className={`${ctaClass} h-[54px] shrink-0 cursor-pointer rounded-[14px] px-7 text-base font-medium transition-[background-color,opacity] disabled:opacity-70 ${
            expanded ? "w-full" : "sm:h-[54px] sm:rounded-pill"
          }`}
        >
          {status === "loading" ? (
            <span
              aria-label={dict.waitlist.sending}
              className={`mx-auto block size-4 animate-spin rounded-full border ${spinnerClass}`}
            />
          ) : (
            <>
              {FORM.cta}
              <span aria-hidden="true" className="ml-2 inline-block">
                ↗
              </span>
            </>
          )}
        </button>
      </form>

          {status === "error" && error ? (
            <div className="mt-2.5 px-5">
              <p
                id={errorId}
                aria-live="polite"
                className={`text-xs ${errorText}`}
              >
                {error}
              </p>
            </div>
          ) : null}

          {/* /classement: reassurance under the CTA. Home/footer show no
              hint here (the "find my rank again" line was removed). */}
          {expanded ? (
            <p className={`mt-1.5 text-xs ${consentText}`}>{R.reassure}</p>
          ) : null}

          {/* Crowd cue — the glowing diva orbs (no faces, no fake count),
              home/footer only; /classement has the gang ring + urgency. */}
          {expanded ? null : (
            <div
              className={`mt-3.5 flex items-center gap-3 px-2 sm:px-4 ${
                compact ? "" : "justify-center"
              }`}
            >
              <div className="flex items-center" aria-hidden="true">
                {AVATAR_GRADIENTS.map((g, i) => (
                  <span
                    key={i}
                    className="block size-8 rounded-full border-2 shadow-[0_2px_10px_rgba(0,0,0,0.28)]"
                    style={{
                      backgroundImage: g,
                      borderColor: onLight ? "#f4eadc" : "#0e0a16",
                      marginLeft: i === 0 ? 0 : -11,
                      zIndex: AVATAR_GRADIENTS.length - i,
                    }}
                  />
                ))}
              </div>
              <p className={`text-xs ${consentText}`}>{FORM.crowd}</p>
            </div>
          )}
        </>,
      )}
      {/* Urgency line — replaces the old counter on /classement only */}
      {expanded ? (
        <p className={`mt-3 text-xs ${consentText}`}>{R.urgency}</p>
      ) : null}
    </div>
  );
}
