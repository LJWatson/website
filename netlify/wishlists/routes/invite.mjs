import { redirect } from "../http.mjs";
import { findOpenInvitation } from "../members.mjs";
import { bucket, countRecent, LIMITS, record } from "../rate-limit.mjs";
import { startSession } from "../sessions.mjs";
import { checkDisplayName, FormErrors, normaliseText } from "../validation.mjs";
import { invalid, page } from "./common.mjs";

// GET never uses up the invitation, so a prefetched link still works
export async function showInvitation(ctx) {
  const token = ctx.query.get("token") || "";
  const invitation = token && await findOpenInvitation(ctx.db, token);

  if (!invitation) {
    return page(ctx, "invite-invalid.html", { title: "Invitation not valid" });
  }

  return page(ctx, "invite.html", { title: "Accept your invitation", token, values: { display_name: invitation.display_name } });
}

export async function acceptInvitation(ctx) {
  const token = ctx.form.get("token") || "";
  const displayName = normaliseText(ctx.form.get("display_name"));
  const failures = bucket("token-failures", ctx.ip);

  if (await countRecent(ctx.db, failures, LIMITS.tokenFailures) >= LIMITS.tokenFailures.limit) {
    return page(ctx, "invite-invalid.html", { title: "Invitation not valid" }, 429);
  }

  const errors = new FormErrors().add("display_name", checkDisplayName(displayName));

  const outcome = await ctx.db.transaction(async (db) => {
    const invitation = await findOpenInvitation(db, token, { lock: true });

    if (!invitation) {
      return "invalid";
    }

    if (errors.any) {
      return "errors";
    }

    const member = await db.one(
      "INSERT INTO members (email, display_name) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id",
      [invitation.email, displayName]
    );

    if (!member) {
      return "invalid";
    }

    await db.query("UPDATE invitations SET used_at = now() WHERE id = $1", [invitation.id]);
    await startSession(ctx, db, member.id);
    return "accepted";
  });

  if (outcome === "invalid") {
    await record(ctx.db, failures);
    return page(ctx, "invite-invalid.html", { title: "Invitation not valid" }, 400);
  }

  if (outcome === "errors") {
    return invalid(ctx, "invite.html", { errors, title: "Accept your invitation", token, values: { display_name: displayName } });
  }

  ctx.setFlash(`Welcome to wishlists, ${displayName}. You're logged in.`);
  return redirect("/wishlists/");
}
