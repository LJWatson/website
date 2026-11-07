import { deliver, invitationEmail } from "./email.mjs";
import { randomToken, sha256 } from "./security.mjs";

export const INVITATION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

export function getMember(db, id) {
  return db.one("SELECT id, email, display_name, role, status, created_at FROM members WHERE id = $1", [id]);
}

// Deleting the member cascades to their sessions, log-in tokens, lists, items and
// reservations. Others' reservations on their items are kept, as removed (see 0003_reservations.sql).
export async function removeMember(db, memberId) {
  const removed = await db.one("DELETE FROM members WHERE id = $1 AND role <> 'admin' RETURNING id", [memberId]);
  return Boolean(removed);
}

// First-time set-up. While the database has no admin, a log-in request for the address in the
// WISHLISTS_ADMIN_EMAIL setting creates the admin (or makes an existing member with that
// address the admin). Once there is an admin, this does nothing. Returns true if it created one.
export function ensureFirstAdmin(db, config, email) {
  if (!config.adminEmail || email !== config.adminEmail) {
    return false;
  }

  return db.transaction(async (tx) => {
    // Only one request at a time gets to check and create
    await tx.query("SELECT pg_advisory_xact_lock(7312026)");

    if (await tx.one("SELECT 1 FROM members WHERE role = 'admin'")) {
      return false;
    }

    await tx.query(
      `INSERT INTO members (email, display_name, role) VALUES ($1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'active'`,
      [email, config.adminName || "Admin"]
    );
    console.log("Created the admin from the WISHLISTS_ADMIN_EMAIL setting.");
    return true;
  });
}

// Creates or refreshes an invitation and emails it. Returns false if the email couldn't be sent.
export async function sendInvitation(ctx, { displayName, email, invitationId = null }) {
  const token = randomToken();
  let invitation;

  if (invitationId) {
    invitation = await ctx.db.one(
      `UPDATE invitations SET token_hash = $2, expires_at = now() + make_interval(secs => $3)
       WHERE id = $1 AND used_at IS NULL RETURNING id, email, display_name`,
      [invitationId, sha256(token), INVITATION_LIFETIME_SECONDS]
    );
  } else {
    invitation = await ctx.db.transaction(async (db) => {
      // One open invitation per address: a new one replaces the old
      await db.query("DELETE FROM invitations WHERE email = $1 AND used_at IS NULL", [email]);
      return db.one(
        `INSERT INTO invitations (email, display_name, token_hash, invited_by, expires_at)
         VALUES ($1, $2, $3, $4, now() + make_interval(secs => $5)) RETURNING id, email, display_name`,
        [email, displayName, sha256(token), ctx.member.id, INVITATION_LIFETIME_SECONDS]
      );
    });
  }

  if (!invitation) {
    return { invitation: null, sent: false };
  }

  const link = `${ctx.baseUrl}/wishlists/invite/?token=${token}`;

  try {
    await deliver(ctx.app, {
      to: invitation.email,
      ...invitationEmail({ inviterName: ctx.member.display_name, link, name: invitation.display_name })
    });
    return { invitation, sent: true };
  } catch (error) {
    console.error("Invitation email failed:", error.message);
    return { invitation, sent: false };
  }
}

// A usable invitation: not used, not expired, and the address isn't already a member's
export function findOpenInvitation(db, token, { lock = false } = {}) {
  return db.one(
    `SELECT i.id, i.email, i.display_name FROM invitations i
     WHERE i.token_hash = $1 AND i.used_at IS NULL AND i.expires_at > now()
     AND NOT EXISTS (SELECT 1 FROM members m WHERE m.email = i.email)
     ${lock ? "FOR UPDATE" : ""}`,
    [sha256(token)]
  );
}
