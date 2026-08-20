import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WaitlistBody, isValidRefCode, normalizeInsta } from "@/lib/validation";

export const runtime = "nodejs";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Rank payload shape returned by the get_rank RPC. */
type RankInfo = {
  rank: number;
  referrals: number;
  total: number;
  to_top10: number;
};

/**
 * Signup + referral. On success (including "email already on the list")
 * the response carries the lead's ref_code and live ranking so the front
 * can show the referral panel: re-typing your email IS the "find my rank
 * again" flow (spec §3) — an intentional product trade-off over the old
 * never-reveal-membership behavior.
 */
export async function POST(req: Request) {
  // J-3 freeze: signups closed, ranking stays readable via /rank.
  if (process.env.WAITLIST_CLOSED === "true") {
    return NextResponse.json({ ok: false, error: "closed" }, { status: 403 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";

  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const parsed = WaitlistBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot filled → bot. Answer success so it learns nothing (no
  // ref_code either — the front treats the payload as legacy success).
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Dev convenience only — in production a missing Supabase env must
    // fail loudly, never serve mock data (fake signups, phantom ranks).
    if (process.env.NODE_ENV === "production") {
      console.error("[waitlist] missing Supabase env in production");
      return NextResponse.json({ ok: false, error: "server" }, { status: 503 });
    }
    console.warn(
      `[waitlist:dev-mode] no Supabase env — would insert: ${parsed.data.email}`,
    );
    // Full mock payload so the referral flow is testable with zero env.
    return NextResponse.json({
      ok: true,
      dev: true,
      already: false,
      ref_code: "dev4me",
      rank: 47,
      referrals: 3,
      to_top10: 2,
      total: 230,
      diva_name: "Diva Stella Elektra",
    });
  }

  const salt = process.env.IP_SALT ?? "";
  if (!salt) console.warn("[waitlist] IP_SALT not set — hashing with empty salt");

  // Referral code from ?ref= — verified against the base; an unknown or
  // malformed code is dropped silently, never a blocked signup.
  let referredBy: string | null = null;
  const ref = parsed.data.ref?.toLowerCase();
  if (ref && isValidRefCode(ref)) {
    const { data } = await supabase
      .from("leads")
      .select("ref_code")
      .eq("ref_code", ref)
      .maybeSingle();
    referredBy = data?.ref_code ?? null;
  }

  const { data: inserted, error } = await supabase
    .from("leads")
    .insert({
      email: parsed.data.email,
      insta_handle: normalizeInsta(parsed.data.insta),
      referred_by: referredBy,
      utm: parsed.data.utm ?? {},
      user_agent: req.headers.get("user-agent")?.slice(0, 300),
      ip_hash: sha256(ip + salt),
      locale: req.headers.get("accept-language")?.slice(0, 12),
    })
    .select("ref_code")
    .single();

  let refCode: string;
  let already = false;

  if (error) {
    // 23505 = unique violation on email_norm → already subscribed. Fetch
    // her existing code so she gets her link and rank back (self-referral
    // via her own link ends here too: the row is never re-inserted).
    if (error.code !== "23505") {
      console.error("[waitlist] insert failed:", error.message);
      return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
    }
    already = true;
    const { data: existing, error: lookupError } = await supabase
      .from("leads")
      .select("ref_code")
      .eq("email_norm", parsed.data.email.toLowerCase())
      .single();
    if (lookupError || !existing) {
      console.error("[waitlist] lookup failed:", lookupError?.message);
      return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
    }
    refCode = existing.ref_code;
  } else {
    refCode = inserted.ref_code;
  }

  const { data: rank, error: rankError } = await supabase.rpc("get_rank", {
    p_code: refCode,
  });
  if (rankError) {
    // Signup went through — degrade to code-only rather than failing it.
    console.error("[waitlist] get_rank failed:", rankError.message);
    return NextResponse.json({ ok: true, already, ref_code: refCode });
  }

  return NextResponse.json({
    ok: true,
    already,
    ref_code: refCode,
    ...(rank as RankInfo),
  });
}
