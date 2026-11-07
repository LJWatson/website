import { redirect } from "../http.mjs";
import { removeMember } from "../members.mjs";
import { endBrowserSession, revokeAllSessions } from "../sessions.mjs";
import { checkDisplayName, FormErrors, normaliseText } from "../validation.mjs";
import { invalid, notFound, page } from "./common.mjs";

async function accountPageData(ctx) {
  const sessions = await ctx.db.query(
    `SELECT id, created_at, last_used_at, user_agent_summary FROM sessions
     WHERE member_id = $1 AND expires_at > now() ORDER BY last_used_at DESC`,
    [ctx.member.id]
  );

  return {
    sessions: sessions.map((session) => ({ ...session, current: session.id === ctx.session.id })),
    title: "Account"
  };
}

export async function showAccount(ctx) {
  return page(ctx, "account.html", { ...await accountPageData(ctx), values: ctx.member });
}

export async function updateProfile(ctx) {
  const displayName = normaliseText(ctx.form.get("display_name"));
  const errors = new FormErrors().add("display_name", checkDisplayName(displayName));

  if (errors.any) {
    return invalid(ctx, "account.html", { ...await accountPageData(ctx), errors, values: { display_name: displayName } });
  }

  await ctx.db.query("UPDATE members SET display_name = $2 WHERE id = $1", [ctx.member.id, displayName]);
  ctx.setFlash(`Other members now see you as ${displayName}.`);
  return redirect("/wishlists/account/");
}

export async function logOutSession(ctx, { id }) {
  const session = await ctx.db.one(
    "DELETE FROM sessions WHERE id = $1 AND member_id = $2 RETURNING user_agent_summary",
    [id, ctx.member.id]
  );

  if (!session) {
    return notFound(ctx);
  }

  if (id === ctx.session.id) {
    endBrowserSession(ctx);
    return redirect("/wishlists/log-in/?status=logged-out");
  }

  ctx.setFlash(`Logged out of ${session.user_agent_summary}.`);
  return redirect("/wishlists/account/");
}

export async function logOutEverywhere(ctx) {
  await revokeAllSessions(ctx.db, ctx.member.id);
  endBrowserSession(ctx);
  return redirect("/wishlists/log-in/?status=logged-out");
}

export async function logOut(ctx) {
  await ctx.db.query("DELETE FROM sessions WHERE id = $1", [ctx.session.id]);
  endBrowserSession(ctx);
  return redirect("/wishlists/log-in/?status=logged-out");
}

// The admin account can't be deleted from inside the app
export function showDeleteAccount(ctx) {
  if (ctx.member.role === "admin") {
    return notFound(ctx);
  }

  return page(ctx, "account-delete.html", { title: "Delete your account" });
}

export async function deleteAccount(ctx) {
  if (ctx.member.role === "admin" || !(await removeMember(ctx.db, ctx.member.id))) {
    return notFound(ctx);
  }

  endBrowserSession(ctx);
  return redirect("/wishlists/log-in/?status=account-deleted");
}
