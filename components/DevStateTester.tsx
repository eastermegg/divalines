"use client";

import { useEffect, useState } from "react";
import { getMe, setMe, REF_KEY } from "@/lib/referral";

/** Dev-only front-end override for the J-3 freeze — read by WaitlistForm
 * on mount (dev builds only). The API keeps its own WAITLIST_CLOSED. */
export const DEV_CLOSED_KEY = "dl:dev:closed";

/**
 * Dev-only waitlist state switcher, mounted by the layout under
 * NODE_ENV === "development" only. Flips the three visitor states:
 * fresh visitor (form), on the list (pill), waitlist frozen (card).
 * "On the list" runs a real signup with a throwaway email so the rank
 * endpoint has a genuine row to serve.
 */
export default function DevStateTester() {
  const [open, setOpen] = useState(false);
  const [me, setMeCode] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMeCode(getMe());
    try {
      setClosed(localStorage.getItem(DEV_CLOSED_KEY) === "true");
    } catch {
      /* storage unavailable — the tester just shows defaults */
    }
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  function resetToNew() {
    setMe(null);
    try {
      localStorage.removeItem(REF_KEY);
      localStorage.removeItem(DEV_CLOSED_KEY);
    } catch {}
    location.reload();
  }

  async function signupThrowaway() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: `dev-${Date.now().toString(36)}@example.com`,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload?.ref_code) {
        setMe(payload.ref_code);
        location.reload();
      } else {
        setError(`api ${res.status} ${payload?.error ?? ""}`);
        setBusy(false);
      }
    } catch {
      setError("api injoignable");
      setBusy(false);
    }
  }

  function toggleClosed() {
    try {
      if (localStorage.getItem(DEV_CLOSED_KEY) === "true")
        localStorage.removeItem(DEV_CLOSED_KEY);
      else localStorage.setItem(DEV_CLOSED_KEY, "true");
    } catch {}
    location.reload();
  }

  const btn =
    "cursor-pointer rounded-pill border border-cream/25 px-3 py-1.5 text-left text-[11px] text-cream hover:bg-cream/10";

  return (
    <div className="fixed bottom-4 left-4 z-[120] font-sans">
      {open ? (
        <div className="flex w-[210px] flex-col gap-1.5 rounded-[14px] border border-cream/15 bg-night/95 p-3 shadow-xl backdrop-blur">
          <div className="mb-1 flex items-center justify-between text-[11px] text-cream/60">
            <span>🧪 états waitlist (dev)</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-cream/60 hover:text-cream"
            >
              ×
            </button>
          </div>
          <button type="button" onClick={resetToNew} className={btn}>
            nouvelle visiteuse (form)
          </button>
          <button type="button" onClick={signupThrowaway} className={btn}>
            {busy ? "…" : "inscrite (pill + classement)"}
          </button>
          <button type="button" onClick={toggleClosed} className={btn}>
            {closed ? "réouvrir la waitlist" : "waitlist clôturée (J-3)"}
          </button>
          {error ? (
            <p className="text-[10px] text-neon-pink">{error}</p>
          ) : null}
          <p className="mt-1 text-[10px] leading-snug text-cream/45">
            {me ? `me: ${me}` : "me: aucune"}
            {closed ? " · closed" : ""}
            <br />
inscription home → redirige vers /classement
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-pill border border-cream/20 bg-night/90 px-3 py-1.5 text-[11px] text-cream/80 shadow-lg backdrop-blur hover:text-cream"
        >
          🧪 états
        </button>
      )}
    </div>
  );
}
