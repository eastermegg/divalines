"use client";

import { useEffect } from "react";
import { captureRef } from "@/lib/referral";

/**
 * Banks ?ref=CODE into localStorage the moment ANY page loads, so the
 * sponsorship survives navigation no matter where the shared link lands
 * (home, /classement, a future page without a form). Mounted once in the
 * locale layout; WaitlistForm re-captures on mount as belt-and-braces.
 */
export default function RefCapture() {
  useEffect(() => {
    captureRef();
  }, []);
  return null;
}
