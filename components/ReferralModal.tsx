"use client";

import { useEffect, useRef, useState } from "react";
import AccentText, { plainText } from "@/components/AccentText";
import ReferralPanel from "@/components/ReferralPanel";
import { useDictionary } from "@/lib/i18n/context";
import type { RankInfo } from "@/lib/referral";

/**
 * Post-signup modal — opens straight after the form submits (spec §3:
 * one screen, no extra step) with rank, distance to the top 10 and the
 * share actions. Closing hands over to the inline ranking block that
 * replaces the form.
 *
 * The signup form is email-only (one field where the traffic lands), so
 * on a fresh join the modal carries the optional insta ask — she's
 * already committed, it costs nothing in conversion.
 */
export default function ReferralModal({
  info,
  askInsta = false,
  onClose,
}: {
  info: RankInfo;
  /** Fresh signup → offer the optional insta-handle field. */
  askInsta?: boolean;
  onClose: () => void;
}) {
  const { dict } = useDictionary();
  const R = dict.referral;
  const cardRef = useRef<HTMLDivElement>(null);
  const [instaState, setInstaState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Hand focus to the dialog so keyboard/screen-reader users land in it.
    cardRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  async function onInstaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (instaState !== "idle") return;
    const handle = String(new FormData(e.currentTarget).get("insta") ?? "").trim();
    if (!handle) return;
    setInstaState("saving");
    try {
      const res = await fetch("/api/waitlist/insta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: info.ref_code, insta: handle }),
      });
      // Invalid handle → let her fix it; anything saved (or silently
      // ignored server-side) reads as done — it's an optional nicety.
      setInstaState(res.ok ? "saved" : "idle");
    } catch {
      setInstaState("idle");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-night/80 p-4 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={plainText(R.panelTitle)}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="surface-card relative max-h-[92svh] w-full max-w-[520px] overflow-y-auto rounded-[24px] p-6 outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={R.close}
          className="text-cream/60 hover:text-cream absolute top-4 right-5 cursor-pointer text-xl leading-none transition-colors"
        >
          ×
        </button>

        <p className="font-display text-cream mb-5 text-3xl italic sm:text-4xl">
          <AccentText text={R.panelTitle} />
        </p>

        <ReferralPanel info={info} />

        {askInsta ? (
          <form
            onSubmit={onInstaSubmit}
            className="border-cream/12 mt-5 border-t pt-4"
          >
            <label htmlFor="modal-insta" className="text-cream/60 block text-xs">
              {R.instaAsk}
            </label>
            {instaState === "saved" ? (
              <p className="text-cream mt-2 font-serif text-base italic">
                {R.instaSaved}
              </p>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="modal-insta"
                  name="insta"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder={R.instaPlaceholder}
                  className="surface-veil text-cream placeholder:text-cream/40 h-[42px] min-w-0 flex-1 rounded-pill px-4 text-sm focus-visible:outline-offset-[-2px]"
                />
                <button
                  type="submit"
                  disabled={instaState === "saving"}
                  className="border-cream/25 text-cream hover:bg-cream/10 h-[42px] shrink-0 cursor-pointer rounded-pill border px-5 text-xs font-medium transition-colors disabled:opacity-60"
                >
                  {instaState === "saving" ? "…" : R.instaSaveCta}
                </button>
              </div>
            )}
          </form>
        ) : null}
      </div>
    </div>
  );
}
