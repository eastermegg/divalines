import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** Dev-mode leaderboard so the page is designable with zero env. */
const DEV_TOP = [
  { rank: 1, diva_name: "diva braise", referrals: 14 },
  { rank: 2, diva_name: "diva solaire", referrals: 11 },
  { rank: 3, diva_name: "diva vertige", referrals: 9 },
  { rank: 4, diva_name: "diva féline", referrals: 8 },
  { rank: 5, diva_name: "diva nocturne", referrals: 7 },
  { rank: 6, diva_name: "diva onde", referrals: 6 },
  { rank: 7, diva_name: "diva insoumise", referrals: 5 },
  { rank: 8, diva_name: "diva ambrée", referrals: 4 },
  { rank: 9, diva_name: "diva céleste", referrals: 3 },
  { rank: 10, diva_name: "diva murmure", referrals: 3 },
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
    return NextResponse.json({
      ok: true,
      dev: true,
      closed,
      total: 230,
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
