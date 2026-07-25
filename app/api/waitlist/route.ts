import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WaitlistBody } from "@/lib/validation";

export const runtime = "nodejs";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
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

  const parsed = WaitlistBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot filled → bot. Answer success so it learns nothing.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      `[waitlist:dev-mode] no Supabase env — would insert: ${parsed.data.email}`,
    );
    return NextResponse.json({ ok: true, dev: true });
  }

  const salt = process.env.IP_SALT ?? "";
  if (!salt) console.warn("[waitlist] IP_SALT not set — hashing with empty salt");

  const { error } = await supabase.from("leads").insert({
    email: parsed.data.email,
    utm: parsed.data.utm ?? {},
    user_agent: req.headers.get("user-agent")?.slice(0, 300),
    ip_hash: sha256(ip + salt),
    locale: req.headers.get("accept-language")?.slice(0, 12),
  });

  // 23505 = unique violation on email_norm → already subscribed.
  // Silent success: never reveal whether an email is on the list.
  if (error && error.code !== "23505") {
    console.error("[waitlist] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
