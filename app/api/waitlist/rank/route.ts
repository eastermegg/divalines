import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isValidRefCode } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * Live ranking for one referral code — the "come back and check my rank"
 * flow (spec §3). The site ships no anon Supabase key, so instead of a
 * client-side RPC this thin route calls get_rank() with the service role;
 * same data out (rank / referrals / total / to_top10 — never an email).
 *
 * Also carries the `closed` flag so a returning visitor sees the frozen
 * state without trying a signup first.
 */
export async function GET(req: Request) {
  const closed = process.env.WAITLIST_CLOSED === "true";

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  // Looser than the signup limit: a read-only endpoint the page may hit
  // on every visit from a returning user.
  if (!(await checkRateLimit(`rank:${ip}`, 30))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const code = new URL(req.url).searchParams.get("code")?.toLowerCase() ?? "";
  if (!isValidRefCode(code)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      dev: true,
      closed,
      ref_code: code,
      rank: 47,
      referrals: 3,
      to_top10: 2,
      total: 230,
      diva_name: "Diva Stella Elektra",
    });
  }

  const { data, error } = await supabase.rpc("get_rank", { p_code: code });
  if (error) {
    console.error("[waitlist:rank] get_rank failed:", error.message);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
  // Unknown code (stale localStorage, hand-typed URL) → 404, the front
  // clears its stored identity and shows the form again.
  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, closed, ref_code: code, ...data });
}
