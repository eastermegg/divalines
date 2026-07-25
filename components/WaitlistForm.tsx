"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { FORM } from "@/lib/site";

type Status = "idle" | "loading" | "success" | "error";

function collectUtm(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const [k, v] of params) {
    if (k.startsWith("utm_")) utm[k] = v.slice(0, 120);
  }
  return Object.keys(utm).length ? utm : undefined;
}

export default function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const inputId = useId();
  const errorId = useId();

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
        body: JSON.stringify({ email, company, utm: collectUtm() }),
      });
      if (res.ok) {
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

  if (status === "success") {
    return (
      <p
        ref={successRef}
        data-waitlist-success
        className="surface-veil inline-flex h-[54px] items-center rounded-pill px-8 font-serif text-base italic text-cream"
        role="status"
      >
        {FORM.success}
      </p>
    );
  }

  return (
    <div data-waitlist className={compact ? "" : "w-full max-w-[560px]"}>
      <form
        onSubmit={onSubmit}
        noValidate
        className="surface-veil flex flex-col gap-2 rounded-[28px] p-[7px] sm:h-[68px] sm:flex-row sm:items-center sm:rounded-pill"
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
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
          className="h-[54px] min-w-0 flex-1 rounded-pill bg-transparent px-[22px] text-sm text-cream placeholder:text-cream/40 focus-visible:outline-offset-[-2px]"
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
          className="cta-heat h-[54px] shrink-0 cursor-pointer rounded-pill px-7 text-base font-medium transition-opacity disabled:opacity-70"
        >
          {status === "loading" ? (
            <span
              aria-label="Sending"
              className="mx-auto block size-4 animate-spin rounded-full border border-night/30 border-t-night"
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

      <div className="mt-2.5 px-5">
        {status === "error" && error ? (
          <p id={errorId} aria-live="polite" className="text-xs text-neon-pink">
            {error}
          </p>
        ) : (
          <p className="text-xs text-cream/60">
            {FORM.consent}{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-cream">
              Privacy policy
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
