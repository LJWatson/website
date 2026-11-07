// Daily purge, run by the wishlists-cleanup scheduled function
export async function purgeExpired(db) {
  await db.query("DELETE FROM login_tokens WHERE created_at < now() - interval '24 hours'");
  await db.query("DELETE FROM rate_limit_events WHERE created_at < now() - interval '24 hours'");
  await db.query("DELETE FROM sessions WHERE expires_at < now()");
  // Used invitations go at once. Expired ones stay for 30 days so they can be resent.
  await db.query("DELETE FROM invitations WHERE used_at IS NOT NULL OR expires_at < now() - interval '30 days'");
  await db.query("DELETE FROM audit_log WHERE created_at < now() - interval '12 months'");
}
