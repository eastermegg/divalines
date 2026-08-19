import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isValidRefCode, normalizeInsta } from "@/lib/validation";

export const runtime = "nodejs";

const InstaBody = z.object({
  code: z.string().trim().max(12),
  insta: z.string().max(64),
});

/**
 * Late insta-handle capture — the signup form is email-only (growth: one
 * field where the traffic lands), so the success modal asks for the handle
 * once she's in. First-write-wins: ref codes are public (they travel in
 * share links), so an existing handle can never be overwritten through
 * this route — only the closing audit can correct one, by hand.
 */
export async function POST(req: Request) {
  if (process.env.WAITLIST_CLOSED === "true") {
    return NextResponse.json({ ok: false, error: "closed" }, { status: 403 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  if (!(await checkRateLimit(`insta:${ip}`))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const parsed = InstaBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isValidRefCode(parsed.data.code.toLowerCase())) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const handle = normalizeInsta(parsed.data.insta);
  if (!handle) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(`[waitlist:insta:dev-mode] would set @${handle}`);
    return NextResponse.json({ ok: true, dev: true });
  }

  const { error } = await supabase
    .from("leads")
    .update({ insta_handle: handle })
    .eq("ref_code", parsed.data.code.toLowerCase())
    .is("insta_handle", null);

  if (error) {
    console.error("[waitlist:insta] update failed:", error.message);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  // Unknown code or handle already set both land here silently — the
  // response never leaks whether a code exists or has a handle.
  return NextResponse.json({ ok: true });
}
