import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** Dev-mode leaderboard so the page is designable with zero env. */
const DEV_TOP = [
  { rank: 1, diva_name: "Diva Edgy Stiletto", referrals: 4 },
  { rank: 2, diva_name: "Diva Stella Elektra", referrals: 3 },
  { rank: 3, diva_name: "Diva Roxy Vertigo", referrals: 3 },
  { rank: 4, diva_name: "Diva Velvet Panther", referrals: 2 },
  { rank: 5, diva_name: "Diva Nikita Midnight", referrals: 2 },
  { rank: 6, diva_name: "Diva Coco Glitter", referrals: 1 },
  { rank: 7, diva_name: "Diva Lola Fever", referrals: 1 },
  { rank: 8, diva_name: "Diva Gigi Vinyl", referrals: 1 },
  { rank: 9, diva_name: "Diva Nova Comet", referrals: 1 },
  { rank: 10, diva_name: "Diva Ruby Ember", referrals: 1 },
];

/**
 * Public leaderboard — stage names + referral counts only (get_leaderboard
 * is the privacy boundary: emails, handles and codes never reach here).
 * CDN-cached a minute: the page can be hammered from stories without the
 * database feeling it.
 */
export async function GET(req: Request) {
  const closed = process.env.WAITLIST_CLOSED === "true";

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  if (!(await checkRateLimit(`board:${ip}`, 30))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Dev convenience only — in production a missing Supabase env must
    // fail loudly, never serve the mock board. Empty payload: the board
    // simply hides (total < 10) instead of showing phantom divas.
    if (process.env.NODE_ENV === "production") {
      console.error("[waitlist:leaderboard] missing Supabase env in production");
      return NextResponse.json({ ok: true, closed, total: 0, top: [] });
    }
    return NextResponse.json({
      ok: true,
      dev: true,
      closed,
      total: 92,
      top: DEV_TOP,
    });
  }

  const { data, error } = await supabase.rpc("get_leaderboard");
  if (error) {
    console.error("[waitlist:leaderboard] rpc failed:", error.message);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, closed, ...data },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  );
}
