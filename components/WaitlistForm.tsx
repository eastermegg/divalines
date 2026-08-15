"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";

type Status = "idle" | "loading" | "success" | "error";

/** Warm heat-palette gradients used for the fake "who's joined" avatars.
 * No real faces — just glowing orbs that read as a community. */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#ff7a2f,#ff5ec4)",
  "linear-gradient(135deg,#ff5ec4,#6e2ba8)",
  "linear-gradient(135deg,#ffd9a8,#ff7a2f)",
  "linear-gradient(135deg,#c4408f,#6e2ba8)",
  "linear-gradient(135deg,#ff7a2f,#c4408f)",
  "linear-gradient(135deg,#ff5ec4,#ffd9a8)",
  "linear-gradient(135deg,#6e2ba8,#ff5ec4)",
  "linear-gradient(135deg,#ffb347,#ff5ec4)",
];

/** Seed the counter from a plausible, already-growing crowd. */
const BASE_COUNT = 547;
/** Most avatars we ever show; everyone else lives in the counter. */
const MAX_AVATARS = 4;

type Avatar = { key: number; gradient: string };

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
}: {
  compact?: boolean;
  /** Restyle for a light background (e.g. the footer heat gradient). */
  onLight?: boolean;
}) {
  const { dict, locale } = useDictionary();
  const FORM = dict.form;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const inputId = useId();
  const errorId = useId();

  // Fake social proof — a rotating avatar stack (max 4) and a counter that
  // ticks up each time someone joins. Deterministic initial values keep SSR
  // and the first client render in sync (no hydration mismatch).
  const [count, setCount] = useState(BASE_COUNT);
  const [avatars, setAvatars] = useState<Avatar[]>(() =>
    Array.from({ length: MAX_AVATARS }, (_, i) => ({
      key: i,
      gradient: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
    })),
  );
  const seedRef = useRef(MAX_AVATARS);
  const stackRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const didJoin = useRef(false);

  // Slot a fresh avatar in at the front, drop the oldest, and bump the count
  // by the new joiner plus a couple of "others" so the crowd feels alive.
  function registerJoin() {
    setAvatars((prev) => {
      const key = seedRef.current++;
      const next: Avatar = {
        key,
        gradient: AVATAR_GRADIENTS[key % AVATAR_GRADIENTS.length],
      };
      return [next, ...prev].slice(0, MAX_AVATARS);
    });
    setCount((c) => c + 1 + Math.floor(Math.random() * 3));
    didJoin.current = true;
  }

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

  // New joiner: pop the freshly-added avatar in and nudge the counter.
  useEffect(() => {
    if (!didJoin.current || prefersReducedMotion()) return;
    const orb = stackRef.current?.firstElementChild;
    if (orb) {
      gsap.fromTo(
        orb,
        { scale: 0, xPercent: -60, autoAlpha: 0 },
        { scale: 1, xPercent: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" },
      );
    }
    if (countRef.current) {
      gsap.fromTo(
        countRef.current,
        { scale: 1.35, color: "#ff5ec4" },
        {
          scale: 1,
          color: onLight ? "#0e0a16" : "#f4eadc",
          duration: 0.5,
          ease: "power2.out",
        },
      );
    }
  }, [count]);

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
        body: JSON.stringify({ email, company, utm: collectUtm() }),
      });
      if (res.ok) {
        registerJoin();
        setStatus("success");
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

  // Persistent social-proof row — an overlapping avatar stack (newest on top)
  // plus the live count. Rendered under both the form and the success pill so
  // the freshly-added avatar stays visible after someone joins.
  const proof = (
    <div
      className={`mt-3.5 flex items-center gap-3 px-2 sm:px-4 ${
        compact ? "" : "justify-center"
      }`}
    >
      <div ref={stackRef} className="flex items-center" aria-hidden="true">
        {avatars.map((a, i) => (
          <span
            key={a.key}
            className="block size-8 rounded-full border-2 shadow-[0_2px_10px_rgba(0,0,0,0.28)]"
            style={{
              backgroundImage: a.gradient,
              borderColor: onLight ? "#f4eadc" : "#0e0a16",
              marginLeft: i === 0 ? 0 : -11,
              zIndex: avatars.length - i,
            }}
          />
        ))}
      </div>
      <p className={`text-xs ${consentText}`}>
        {FORM.proofBefore}{" "}
        <span ref={countRef} className={`font-medium ${successText}`}>
          {count.toLocaleString(locale === "en" ? "en-GB" : "fr-FR")}
        </span>{" "}
        {FORM.proof}
      </p>
    </div>
  );

  if (status === "success") {
    return (
      <div data-waitlist className={compact ? "" : "w-full max-w-[560px]"}>
        <p
          ref={successRef}
          data-waitlist-success
          className={`${surface} ${successText} flex h-[54px] w-full items-center justify-center rounded-[16px] px-8 font-serif text-base italic sm:h-[68px] sm:rounded-pill`}
          role="status"
        >
          {FORM.success}
        </p>
        {proof}
      </div>
    );
  }

  return (
    <div data-waitlist className={compact ? "" : "w-full max-w-[560px]"}>
      <form
        onSubmit={onSubmit}
        noValidate
        className={`${surface} flex flex-col gap-1.5 rounded-[20px] p-1.5 sm:h-[68px] sm:flex-row sm:items-center sm:gap-2 sm:rounded-pill sm:p-[7px]`}
      >
        <label htmlFor={inputId} className="sr-only">
          {dict.waitlist.emailLabel}
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={FORM.placeholder}
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? errorId : undefined}
          className={`h-[54px] min-w-0 rounded-[14px] bg-transparent px-5 text-[16px] ${inputText} focus-visible:outline-offset-[-2px] sm:h-[54px] sm:flex-1 sm:rounded-pill sm:px-[22px] sm:text-base`}
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
          className={`${ctaClass} h-[54px] shrink-0 cursor-pointer rounded-[14px] px-7 text-base font-medium transition-[background-color,opacity] disabled:opacity-70 sm:h-[54px] sm:rounded-pill`}
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
          <p id={errorId} aria-live="polite" className={`text-xs ${errorText}`}>
            {error}
          </p>
        </div>
      ) : null}

      {proof}
    </div>
  );
}
