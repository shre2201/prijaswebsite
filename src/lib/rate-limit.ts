import type { NextRequest } from "next/server";

/**
 * Best-effort, in-memory rate limit for public form endpoints (bookings, reviews, sign-up).
 * On serverless each instance has its own memory, so this slows down casual spam rather
 * than stopping a determined attacker — pair it with Vercel's firewall rules if abuse appears.
 */
const hits = new Map<string, number[]>();

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** true = allowed. `limit` requests per `windowMs` per IP per bucket. */
export function rateLimit(req: NextRequest, bucket: string, limit: number, windowMs: number) {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return true;
}
