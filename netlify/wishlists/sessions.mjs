import { csrfTokenFor, randomToken, sha256 } from "./security.mjs";
import { summariseUserAgent } from "./user-agent.mjs";

export const SESSION_COOKIE = "__Host-wishlists_session";
// Chrome's maximum cookie lifetime
export const SESSION_MAX_AGE = 400 * 24 * 60 * 60;
const SLIDE_AFTER_MS = 24 * 60 * 60 * 1000;

// Finds the member for the session cookie. Suspended members and expired sessions get nothing.
export async function loadSession(ctx) {
  const token = ctx.cookies[SESSION_COOKIE];

  if (!token) {
    return;
  }

  const row = await ctx.db.one(
    `SELECT s.id AS session_id, s.last_used_at, m.id, m.email, m.display_name, m.role
     FROM sessions s JOIN members m ON m.id = s.member_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND m.status = 'active'`,
    [sha256(token)]
  );

  if (!row) {
    ctx.clearCookie(SESSION_COOKIE);
    return;
  }

  ctx.session = { id: row.session_id };
  ctx.member = { display_name: row.display_name, email: row.email, id: row.id, role: row.role };
  ctx.csrfToken = csrfTokenFor(token);

  // Slide the expiry forward at most once a day
  if (Date.now() - new Date(row.last_used_at).getTime() > SLIDE_AFTER_MS) {
    await ctx.db.query(
      "UPDATE sessions SET last_used_at = now(), expires_at = now() + make_interval(secs => $2) WHERE id = $1",
      [row.session_id, SESSION_MAX_AGE]
    );
    ctx.setCookie(SESSION_COOKIE, token, SESSION_MAX_AGE);
  }
}

export async function startSession(ctx, db, memberId) {
  const token = randomToken();

  await db.query(
    `INSERT INTO sessions (token_hash, member_id, expires_at, user_agent_summary)
     VALUES ($1, $2, now() + make_interval(secs => $3), $4)`,
    [sha256(token), memberId, SESSION_MAX_AGE, summariseUserAgent(ctx.request.headers.get("user-agent"))]
  );

  ctx.setCookie(SESSION_COOKIE, token, SESSION_MAX_AGE);
}

export async function revokeAllSessions(db, memberId) {
  await db.query("DELETE FROM sessions WHERE member_id = $1", [memberId]);
}

// For the response that ends this browser's session
export function endBrowserSession(ctx) {
  ctx.clearCookie(SESSION_COOKIE);
  ctx.extraHeaders["Clear-Site-Data"] = "\"cache\", \"cookies\", \"storage\"";
}
