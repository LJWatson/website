import { sha256 } from "./security.mjs";

export const LIMITS = {
  // Spec: no more than 5 log-in emails per address, and per IP address, per hour
  logInEmail: { limit: 5, windowSeconds: 3600 },
  logInIp: { limit: 5, windowSeconds: 3600 },
  // Wrong log-in codes per pending log-in, counted for members and non-members alike
  codeFailures: { limit: 5, windowSeconds: 900 },
  // Failed log-in link and invitation tokens per IP address
  tokenFailures: { limit: 20, windowSeconds: 3600 },
  // General limit on POSTs per session
  sessionPosts: { limit: 120, windowSeconds: 600 }
};

export function bucket(kind, value) {
  return sha256(`${kind}:${value}`);
}

export async function countRecent(db, bucketId, { windowSeconds }) {
  const row = await db.one(
    "SELECT count(*)::int AS total FROM rate_limit_events WHERE bucket = $1 AND created_at > now() - make_interval(secs => $2)",
    [bucketId, windowSeconds]
  );

  return row.total;
}

export async function record(db, bucketId) {
  await db.query("INSERT INTO rate_limit_events (bucket) VALUES ($1)", [bucketId]);
}

// Records the event and returns true, or returns false once the limit is reached
export async function allow(db, bucketId, limits) {
  if (await countRecent(db, bucketId, limits) >= limits.limit) {
    return false;
  }

  await record(db, bucketId);
  return true;
}
