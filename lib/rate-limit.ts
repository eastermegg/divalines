/**
 * In-memory sliding-window rate limiter: 5 requests / 10 min / key.
 *
 * Caveats (accepted for a waitlist form — see docs/SETUP.md):
 * - Per warm serverless instance on Vercel: the effective global limit is
 *   ~5 × concurrent instances, and state resets on deploy. The real abuse
 *   defenses are the honeypot, Zod validation and the unique email index.
 * - Upgrade path: swap the body of checkRateLimit for Upstash Redis or a
 *   Supabase `rate_limits` table. The async signature makes that a
 *   one-file change.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_KEYS = 5000;

const hits = new Map<string, number[]>();

export async function checkRateLimit(
  key: string,
  max: number = MAX_REQUESTS,
): Promise<boolean> {
  const now = Date.now();
  const fresh = (hits.get(key) ?? []).filter((t) => t > now - WINDOW_MS);

  if (fresh.length >= max) {
    hits.set(key, fresh);
    return false;
  }

  if (!hits.has(key) && hits.size >= MAX_KEYS) {
    // Evict the oldest-inserted key to bound memory.
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }

  fresh.push(now);
  hits.set(key, fresh);
  return true;
}
