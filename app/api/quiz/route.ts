import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";
import { QuizBody } from "@/lib/validation";

export const runtime = "nodejs";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Fallback profile when the client doesn't send one: the dominant energy. */
function dominantEnergy(scores: Record<string, number>): string | undefined {
  let top: string | undefined;
  let max = -Infinity;
  for (const [energy, value] of Object.entries(scores)) {
    if (value > max) {
      max = value;
      top = energy;
    }
  }
  return top;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";

  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const parsed = QuizBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot filled → bot. Answer success so it learns nothing.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { email, scores, utm } = parsed.data;
  const profile = parsed.data.profile ?? dominantEnergy(scores);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      `[quiz:dev-mode] no Supabase env — would record: ${email} → ${profile ?? "?"}`,
    );
    return NextResponse.json({ ok: true, dev: true, profile });
  }

  const salt = process.env.IP_SALT ?? "";
  if (!salt) console.warn("[quiz] IP_SALT not set — hashing with empty salt");

  const ip_hash = sha256(ip + salt);
  const user_agent = req.headers.get("user-agent")?.slice(0, 300);
  const locale = req.headers.get("accept-language")?.slice(0, 12);

  // Store the quiz result. Retakes are allowed (no unique index on
  // quiz_submissions), so every submission is its own row — the newest is the
  // taker's current result.
  const { error: quizError } = await supabase.from("quiz_submissions").insert({
    email,
    scores,
    profile,
    utm: utm ?? {},
    user_agent,
    ip_hash,
    locale,
  });

  if (quizError) {
    console.error("[quiz] insert failed:", quizError.message);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  // Taking the quiz also joins the waitlist (CTA: "Join the waitlist. read her
  // first."). A duplicate email raises 23505 → already subscribed, ignore
  // silently. A failure here must NOT fail the request: the result is saved.
  const { error: leadError } = await supabase.from("leads").insert({
    email,
    source: "aura-quiz",
    utm: utm ?? {},
    user_agent,
    ip_hash,
    locale,
  });
  if (leadError && leadError.code !== "23505") {
    console.error("[quiz] waitlist insert failed:", leadError.message);
  }

  return NextResponse.json({ ok: true, profile });
}
