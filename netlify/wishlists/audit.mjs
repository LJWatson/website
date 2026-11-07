// Admin actions: invite, resend, revoke invitation, edit, suspend, reinstate, remove, revoke sessions
export async function audit(db, actorId, action, targetMemberId = null, detail = null) {
  await db.query(
    "INSERT INTO audit_log (actor_id, action, target_member_id, detail) VALUES ($1, $2, $3, $4)",
    [actorId, action, targetMemberId, detail ? JSON.stringify(detail) : null]
  );
}
